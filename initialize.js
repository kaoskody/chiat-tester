
import Immutable from 'immutable';
import Random from 'random';
import _ from 'lodash';
import {
  placeTile,
  placeTiles,
} from 'utils/functions';
import gameLog from 'gameLog';

export default function initialize(game) {
  game = Immutable(game);
  let tiles = Random.shuffle(_.flatten(_.times(9, i=> {
    return _.times(12, j=> [i, j]);
  })));

  const toPlace = tiles.slice(0, game.players.length);
  tiles = tiles.slice(game.players.length);

  gameLog.push({
    action: 'startingGame',
  });

  return game
  .update('players', players=> {
    return Immutable(Random.shuffle(players.map(({_id})=> {
      const playerTiles = tiles.slice(0, 6);
      tiles = tiles.slice(6);
      return Immutable({
        _id,
        score: 6000,
        tiles: playerTiles,
      });
    }).asMutable()));
  })
  .set('tiles', tiles)
  .set('chains', {})
  .set('board', placeTiles(Immutable({}), toPlace, -1))
  .set('state', [{
    activePlayer: 0,
    state: 'placeTile',
  }]);
}

