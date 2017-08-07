
import {Component} from 'react';

const usernames = [
  'fakeone',
  'wollymammoth',
  'eatyouforlunch',
  'whatareyou',
  'iamyourworstnightmare',
  'teenage-mutant-ninja-starfish',
  'hidden-there',
];

class Initializing extends Component {
  constructor(...args) {
    super(...args);
    const numPlayers = this.props.game.chiat.players.min;
    this.state = {
      name: '',
      players: _.times(numPlayers, i=> 'human'),
    };
  }
  componentWillReceiveProps(props) {
    this.setNumPlayers(undefined, props.game.chiat);
  }
  setNumPlayers(numPlayers = this.state.players.length, chiat = this.props.game.chiat) {
    const {min, max} = chiat.players;
    if (numPlayers < min) {
      numPlayers = min;
    } else if (numPlayers > max) {
      numPlayers = max;
    }
    if (numPlayers < this.state.players.length) {
      this.setState({players: this.state.players.slice(0, numPlayers)});
    } else if (numPlayers > this.state.players.length) {
      const newPlayers = _.times(numPlayers - this.state.players.length, _.constant('human'));
      this.setState({players: this.state.players.concat(newPlayers)});
    }
  }
  setPlayer(index, value) {
    const {players} = this.state;
    this.setState({
      players: players.slice(0, index).concat([value]).concat(players.slice(index + 1)),
    });
  }
  onSubmit() {
    const players = this.state.players.map(type=> {
      const _id = randomId();
      if (type === 'human') {
        return _id;
      } else {
        return `ai-${_id}-${type}`;
      }
    }).map((_id, index)=> ({_id, username: usernames[index]}));
    this.props.startGame(this.state.name, players);
  }
  render() {
    return <div>
      <h2>Create Game</h2>
      <form onSubmit={(e)=> e.preventDefault() || this.onSubmit()}>
        <input
          type="text"
          placeholder="Game Name"
          value={this.state.name}
          onChange={e=> this.setState({name: e.target.value})} />
        <input
          type="number"
          value={this.state.players.length}
          onChange={(e)=> this.setNumPlayers(e.target.value)} />
        {this.state.players.map((player, index)=> {
          return <div key={index}>
            <select value={player} onChange={(e)=> this.setPlayer(index, e.target.value)}>
              <option>human</option>
              {_.map(this.props.game.ai, (a, name)=> {
                return <option key={name}>{name}</option>;
              })}
            </select>
          </div>;
        })}
        <input type="submit" />
      </form>
      {this.props.possibleGames.map(a=> 
        <button key={a.id} onClick={()=> this.props.selectGame(a.id)}>Play {a.name}</button>)}
    </div>;
  }
}

function randomId() {
  return _.times(8, ()=> {
    return Math.floor(Math.random() * 10);
  }).join('');
}

export default Initializing;
