import { START_ACTION, END_ACTION } from '../actions/actionTypes';

const initialState = false;

export default function (state = initialState, action) {
  if (action.type === START_ACTION) {
    return true;
  } else if (action.type === END_ACTION) {
    return false;
  }
  return state;
}
