
import {Component} from 'react';

export default class SelectSaved extends Component {
  
  constructor(...args) {
    super(...args);
    this.state = {};
  }
  
  componentWillMount() {

    fetch('/games/HotelInvestments.json').then(file=> {
      return file.json();
    })
    .then(game=> {
      game = deepMap(game, ({impl, dependencies})=> {
        return _.set(eval(`(${impl})`), 'dependencies', dependencies);
      });
      this.setState({game: analyzeGame(game)});
    })
    .catch(e=> {
      console.log('ServerError: ', e, e.stack);
    });
  }
  render() {
    return <div>
      <h1>Select saved game</h1>
    </div>;
  }
}