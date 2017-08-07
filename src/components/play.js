
import _ from 'lodash';
import {Component} from 'react';
import startAction from '../../../utils/game-manager';
import digStateTree from '../../../utils/dig-state-tree';
import Board from '../../../server/src/components/board';

class Play extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      nextAction: this.getPossibleActions()[0],
      actionInput: '{\n\n}',
      actionPlayer: this.getPossiblePlayers()[0],
    };
  }
  componentWillReceiveProps(props) {
    const possibleActions = this.getPossibleActions(props.gameState);
    if (!possibleActions.includes(this.state.nextAction)) {
      this.setState({
        nextAction: possibleActions[0],
      });
    }
    const possiblePlayers = this.getPossiblePlayers(props);
    if (!possiblePlayers.includes(this.state.actionPlayer)) {
      this.setState({actionPlayer: possiblePlayers[0]});
    }
  }
  getPossibleActions(gameState = this.props.gameState) {
    if (gameState.length === 1) {
      return ['initialize'];
    }
    const currentState = _.last(gameState);
    const statesTree = this.props.game.states;
    const stateArray = currentState.state.map(({state})=> state);
    const stateConfig = digStateTree(statesTree, stateArray);
    const actions = _.keys(stateConfig && stateConfig.actions || {});
    return actions.filter(action=> {
      return action !== 'onEnter' && action !== 'onLeave';
    });
  }
  runActionForm(e) {
    e.preventDefault();
    this.runAction(this.state.nextAction, JSON.parse(this.state.actionInput));
  }

  runAction(nextAction, actionInput) {
    const currentState = _.last(this.props.gameState);
    let playerId = undefined;
    if (this.state.actionPlayer !== 'game') {
      playerId = _.findIndex(currentState.players, player=> {
        return player._id === this.state.actionPlayer;
      });
    }
    let results = startAction({
      gameDef: this.props.game,
      game: currentState,
      playerId,
      action: nextAction,
      input: actionInput,
    });
    const states = [];
    let failure = false;
    for (let result of results) {
      result.map(result=> {
        states.push({
          action: result.actionDisplay,
          playerId: result.playerId,
          input: result.input,
          logs: result.logs,
        });
        states.push(result.state);
      })
      .orElse(error=> {
        console.error(error);
        failure = true;
        alert('Error: ' + error.message);
      });
    }
    if (!failure) {
      this.props.updateGame(this.props.gameState.concat(states));
    }
  }
  revert(i) {
    this.props.updateGame(this.props.gameState.slice(0, i + 1));
    if (this.props.gameState.length > i + 1) {
      const {action, input, playerId} = this.props.gameState[i + 1];
      this.setState({
        nextAction: _.last(action.split('.')),
        actionInput: JSON.stringify(input, null, 2),
        actionPlayer: this.props.gameState[i].players[playerId]._id,
      });
    }
  }
  getPossiblePlayers(props = this.props) {
    if (props.gameState.length === 1) {
      return ['game'];
    }
    const game = _.last(props.gameState);
    const players = _.last(game.state).activePlayer;
    return (_.isArray(players) ? players : _.isUndefined(players) ? [] : [players]).map(index=> game.players[index]._id);
  }
  canRevert(state, i) {
    return i % 2 === 0
      && i !== this.props.gameState.length - 1
      && (i === 0 || _.isNumber(this.props.gameState[i + 1].playerId))
  }
  render() {
    const gameState = _.last(this.props.gameState);
    return <div>
      <h2>Play</h2>
      <p>Current State</p>
      <GameState gameState={gameState} game={this.props.game} runAction={this.runAction.bind(this)} />
      <div style={{float: 'right', height: '100%', width: '33%'}}>
        {this.props.gameState.slice(this.props.gameState.length - 20).reverse().map((state, i)=> {
          return <div key={i}>
            <textarea
              style={{width: '100%', height: 100}}
              value={JSON.stringify(state, null, 2)}
              readOnly={true}
            ></textarea>
            {this.canRevert(state, i) &&
              <button onClick={()=> this.revert(i)}>Revert</button>}
          </div>;
        })}
      </div>
      <form
        onSubmit={(e)=> this.runActionForm(e)}
        style={{float: 'right', height: '100%', width: '33%'}}
      >
        <p>Run Action</p>
        <p>
          <span>As:</span>
          <select
            value={this.state.actionPlayer}
            onChange={e=> this.setState({actionPlayer: e.target.value})}
          >
            {this.getPossiblePlayers().map(player=> {
              return <option key={player}>{player}</option>;
            })}
          </select>
        </p>
        {this.getPossibleActions().map(action=> {
          return <span key={action}>
            <input
              type="radio"
              name="action"
              value={action}
              checked={action === this.state.nextAction}
              onChange={()=> this.setState({nextAction: action})}
            /> {action}
          </span>;
        })}
        <div style={{width: "100%"}}>
          <textarea
            value={this.state.actionInput}
            onChange={e=> this.setState({actionInput: e.target.value})}
            style={{width: '100%', height: 200}}
          ></textarea>
        </div>
        <input type="submit" />
      </form>
    </div>;
  }
}

class GameState extends Component {
  constructor(...args) {
    super(...args);

    this.state = {playerId: 0};
  }
  renderBoard() {
    const {game, gameState} = this.props;
    const player = gameState.players[this.state.playerId];
    return <div>
      <p>player {player._id}</p>
      {gameState.state && <Board game={gameState} me={player} components={game.render} modifyGame={this.props.runAction} />}
      {!gameState.state && <p>initialize game first</p>}
    </div>;
  }
  render() {
    return <div>
      <button onClick={() => this.setState({playerId: -1})}>Raw</button>
      {this.props.gameState.players.map((player, index) => {
        return <button key={index} onClick={()=> this.setState({playerId: index})} disabled={index === this.state.playerId}>Player {player._id}</button>;
      })}
      {this.state.playerId !== -1 && this.renderBoard()}
      {this.state.playerId === -1 && <textarea
        style={{width: '33%', height: '75%'}}
        value={JSON.stringify(this.props.gameState, null, 2)}
        readOnly={true}
      ></textarea>}
    </div>;
  }
}

export default Play;

