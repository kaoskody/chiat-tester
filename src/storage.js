
const GAME_LIST_KEY = 'chiat-game-list';
const GAME_KEY_PREFIX = 'chiat-game-';

export function newGame(name, game) {
  const gameList = getGameList();
  const id = Date.now();
  gameList.push({id, name});
  setItem(GAME_LIST_KEY, gameList);
  saveGame(id, game);
  return id;
}

export function getGameList() {
  return getItem(GAME_LIST_KEY) || [];
}

export function getGame(id) {
  return getItem(GAME_KEY_PREFIX + id);
}

export function saveGame(id, game) {
  setItem(GAME_KEY_PREFIX + id, game);
}

function getItem(key) {
  return JSON.parse(localStorage.getItem(key));
}
function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

