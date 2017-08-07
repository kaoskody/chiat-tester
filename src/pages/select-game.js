
import {Component} from 'react';

export default class SelectGame extends Component {

  constructor(...args) {
    super(...args);
    this.state = {games: []};
  }
  
  componentWillMount() {
    fetch('/games.json')
    .then(file=> file.json())
    .then(({games})=> this.setState({games}))
    .catch(e=> {
      console.log('ServerError: ', e, e.stack);
    });
  }
  render() {
    return <div>
      <h1>Select Game</h1>
      {this.state.games.map(game=> {

      })}
    </div>;
  }
}