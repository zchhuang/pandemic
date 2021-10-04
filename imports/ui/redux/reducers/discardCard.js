import { SET_DISCARD_CARD } from '../actions/actionTypes';

const initialState = false;

export default function (state = initialState, action) {
  if (action.type === SET_DISCARD_CARD) {
    const { discardCard } = action.payload;
    return discardCard;
  }
  return state;
}
