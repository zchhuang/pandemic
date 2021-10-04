import { CityCards } from '../../../constants/cards';
import {
  HIGHLIGHT_CITIES,
  UNHIGHLIGHT_ALL_CITIES,
  SET_CITY_ONCLICK,
  RESET_CITY_ONCLICK,
} from '../actions/actionTypes';

const initialState = Object.keys(CityCards).reduce((acc, curr) => {
  acc[curr] = { lit: false, onClick: () => {} };
  return acc;
}, {});

// cityKeys is array of city names, newValue is the new obj for each city
const buildCitiesObject = (state, cityKeys, newValues) =>
  cityKeys.reduce((cityObj, key) => {
    cityObj[key] = { ...state[key], ...newValues };
    return cityObj;
  }, {});

export default function (state = initialState, action) {
  if (action.type === HIGHLIGHT_CITIES) {
    const { cities } = action.payload;
    const citiesObject = buildCitiesObject(state, cities, { lit: true });
    return { ...state, ...citiesObject };
  } else if (action.type === UNHIGHLIGHT_ALL_CITIES) {
    const citiesObject = buildCitiesObject(state, Object.keys(state), {
      lit: false,
    });
    return { ...state, ...citiesObject };
  } else if (action.type === SET_CITY_ONCLICK) {
    const { city, onClick } = action.payload;
    return { ...state, [city]: { ...state[city], onClick } };
  } else if (action.type === RESET_CITY_ONCLICK) {
    const citiesObject = buildCitiesObject(state, Object.keys(state), {
      onClick: () => {},
    });
    return { ...state, ...citiesObject };
  }
  return state;
}
