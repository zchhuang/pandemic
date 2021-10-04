import { combineReducers } from 'redux';
import cities from './cities';
import meteorData from './meteorData';
import actionInProgress from './actionInProgress';
import discardCard from './discardCard';

export default combineReducers({
  cities,
  meteorData,
  actionInProgress,
  discardCard,
});
