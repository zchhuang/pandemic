import {
  SET_GAME_OBJECT,
  SET_PLAYERS,
  SET_PLAYER_OBJECT,
} from '../actions/actionTypes';

const initialState = {
  gameObject: {},
  players: [],
  playerObject: {},
};

export default function (state = initialState, action) {
  if (action.type === SET_GAME_OBJECT) {
    const { gameObject } = action.payload;
    return { ...state, gameObject };
  } else if (action.type === SET_PLAYERS) {
    const { players } = action.payload;
    return { ...state, players };
  } else if (action.type === SET_PLAYER_OBJECT) {
    const { playerId } = action.payload;
    const playerObject = state.players.find(
      (player) => player._id === playerId
    );
    return { ...state, playerObject };
  }
  return state;
}
