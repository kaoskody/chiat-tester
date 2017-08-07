
import {Component} from 'react';
import Initializing from './initializing';
import * as storage from '../storage';
import Play from './play';

class SelectGame extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      selectedId: null,
      gameState: null,
      possibleGames: storage.getGameList(),
    };
  }
  startGame(name, players) {
    const gameState = [{players}];
    const id = storage.newGame(name, gameState);
    this.setState({
      selectedId: id,
      gameState,
      possibleGames: this.state.possibleGames.concat([{id, name}]),
    });
  }
  selectGame(id) {
    this.setState({
      selectedId: id,
      gameState: storage.getGame(id),
    });
  }
  updateGame(gameState) {
    this.setState({gameState});
    storage.saveGame(this.state.selectedId, gameState);
  }
  restart() {
    this.setState({
      selectedId: null,
      gameState: null,
    });
  }
  render() {
    const Component = !this.state.gameState ? Initializing : Play;
    return <div>
      <h1>Select Game</h1>
      <Component
        startGame={::this.startGame}
        selectGame={::this.selectGame}
        updateGame={::this.updateGame}
        possibleGames={this.state.possibleGames}
        gameState={this.state.gameState}
        game={this.props.game}
      />
    </div>;
  }
}

export default SelectGame;
