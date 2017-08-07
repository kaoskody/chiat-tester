
import _ from 'lodash';
import {Component} from 'react';
import analyzeGame from '../../utils/analyze-game';
import SelectGame from './components/select-game';
import Immutable from 'seamless-immutable';
import * as Random from '../../utils/random';
import babelRuntime from './babel-runtime-loader.genfile';
import GameLog from '../../utils/game-log';
import compileGame from '../../utils/compiler';
import UserError from '../../utils/user-error';

export default class App extends Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }
  componentWillMount() {
    const localVars = {
      Container,
      Button,
      gameLog: new GameLog(),
      BoxedGrid: BoxedGrid,
      logger: console,
    };
    fetch('/api/games.json')
    .then(file=> file.json())
    .then(gameFiles => compileGame(gameFiles.chiat.id, gameFiles))
    .then(game => deepMap(game, function(value) {
      window.module = {};
      const script = document.createElement('script');
      script.innerHTML = value;
      document.body.append(script);
      const module = window.module;
      delete window.module;
      return module.exports;
    }))
    .then(game => resolveDependencies(game, constructGameRequire(game, localVars)))
    .then(game => analyzeGame(game, localVars))
    .then(game => this.setState({game}))
    .catch(e=> {
      console.log('ServerError: ', e, e.stack);
    });
  }
  render() {
    return <div>
      <p>Chiat</p>
      {!this.state.game ? 'Loading...' : <SelectGame game={this.state.game} />}
    </div>;
  }
}

function resolveDependencies(game, gameRequire, depth = []) {
  return _.mapValues(game, (value, key) => {
    if (_.isFunction(value)) {
      const result = gameRequire(depth.concat(key))(depth.concat(key).join('/'));
      return result && result.__esModule ? result.default : result;
    } else if (key === 'chiat') {
      return value;
    } else {
      return resolveDependencies(value, gameRequire, depth.concat(key));
    }
  });
}

function Button(props) {
  return <button {...props} />;
}

function BoxedGrid({rows, cols, children}) {
  return <table>
    <tbody>
      {_.times(rows, rowIndex => {
        return <tr key={rowIndex}>
          {_.times(cols, colIndex => {
            return children(rowIndex, colIndex);
          })}
        </tr>;
      })}
    </tbody>
  </table>;
}

BoxedGrid.Cell = function BoxedGridCell({style, children}) {
  return <td style={style}>{children}</td>;
};

function Container({children}) {
  return <div>{children}</div>;
}

function constructGameRequire(game, localVars) {
  const fetching = [];
  const cache = {
    immutable: Immutable,
    lodash: _,
  };
  for (let key in babelRuntime) {
    cache['babel-runtime/' + key] = babelRuntime[key];
  }
  cache['error'] = UserError;
  cache['core/utils/random'] = Random;
  cache['core/utils/logger'] = localVars.logger;
  cache['core/components/boxed-grid'] = localVars.BoxedGrid;
  cache['core/components/button'] = localVars.Button;
  cache['core/utils/game-log'] = localVars.gameLog;
  cache['core/components/container'] = localVars.Container;
  return function locationSpecificRequire(depth) {
    return function require(dependencyKey) {
      const dependency = dependencyKey.split('/');
      // TODO: if the dependency is in the cache, it doesn't prevent access
      if (cache[dependencyKey]) {
        return cache[dependencyKey];
      }
      const circular = fetching.includes(dependencyKey);
      fetching.push(dependencyKey);
      if (circular) {
        throw new Error('Circular dependency ' + fetching.join(' -> '));
      }
      if (depth[0] !== dependency[0] && dependency[0] !== 'utils') {
        throw new Error ('module ' + depth.join('/') + ' attempted to import invalid module ' + dependencyKey);
      }
      let result;
      // TODO: protect _.get from breaking off the path _.get({}, ['constructor']);
      const dependencyDepth = dependency.slice(0, dependency.length - 1);
      const factory = _.get(game, dependency);
      if (!factory) {
        throw new Error('Invalid dependency ' + dependencyKey);
      }
      result = factory(locationSpecificRequire(dependency));
      cache[dependencyKey] = result;
      fetching.pop();
      return result;
    };
  };
}

function deepMap(game, fn) {
  return _.mapValues(game, (value, key)=> {
    if (key === 'chiat') {
      return value;
    } else if (_.isString(value)) {
      return fn(value);
    } else {
      return deepMap(value, fn);
    }
  });
}
