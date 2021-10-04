import * as Action from './actionTypes';

export const highlightCities = (cities) => {
  return {
    type: Action.HIGHLIGHT_CITIES,
    payload: {
      cities,
    },
  };
};

export const unhighlightAllCities = () => {
  return {
    type: Action.UNHIGHLIGHT_ALL_CITIES,
  };
};

export const setGameObject = (gameObject) => {
  return {
    type: Action.SET_GAME_OBJECT,
    payload: {
      gameObject,
    },
  };
};

export const setPlayers = (players) => {
  return {
    type: Action.SET_PLAYERS,
    payload: {
      players,
    },
  };
};

export const setPlayerObject = (playerId) => {
  return {
    type: Action.SET_PLAYER_OBJECT,
    payload: {
      playerId,
    },
  };
};

export const setCityOnclick = (city, onClick) => {
  return {
    type: Action.SET_CITY_ONCLICK,
    payload: {
      city,
      onClick,
    },
  };
};

export const resetCityOnclick = () => {
  return {
    type: Action.RESET_CITY_ONCLICK,
  };
};

export const startAction = () => {
  return {
    type: Action.START_ACTION,
  };
};

export const endAction = () => {
  return {
    type: Action.END_ACTION,
  };
};

export const setDiscardCard = (discardCard) => {
  return {
    type: Action.SET_DISCARD_CARD,
    payload: {
      discardCard,
    },
  };
};
