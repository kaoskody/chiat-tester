
import {Router, Route, IndexRoute} from 'react-router';

export default <Router>
  <Route path="/" component={App}>
    <IndexRoute component={SelectGame} />
    <Route path="game/:gameId" component={PlayGame} />
  </Route>
</Router>;