import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import {
  unhighlightAllCities,
  resetCityOnclick,
  startAction,
  endAction,
} from '../../../redux/actions';
import { ONE_QUIET_NIGHT, REGULAR } from '../../../../constants/cards';
import Event from './Event';

function OneQuietNight({
  zIndex,
  inHand,
  size,
  playerId,
  unhighlightAllCities,
  resetCityOnclick,
  startAction,
  endAction,
}) {
  const callEvent = (event, params) => {
    Meteor.call('players.playEvent', playerId, event, params);
    endAction();
  };

  const oneQuietNight = () => {
    startAction();
    unhighlightAllCities();
    resetCityOnclick();
    callEvent(ONE_QUIET_NIGHT, {});
  };

  return (
    <Event
      event={ONE_QUIET_NIGHT}
      handleEvent={oneQuietNight}
      zIndex={zIndex}
      inHand={inHand}
      size={size}
    />
  );
}

OneQuietNight.defaultProps = {
  size: REGULAR,
};

OneQuietNight.propTypes = {
  zIndex: PropTypes.number,
  inHand: PropTypes.bool,
  size: PropTypes.string,
  playerId: PropTypes.string,
  unhighlightAllCities: PropTypes.func,
  resetCityOnclick: PropTypes.func,
  startAction: PropTypes.func,
  endAction: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    playerId: state.meteorData.playerObject?._id,
  };
};

export default connect(mapStateToProps, {
  unhighlightAllCities,
  resetCityOnclick,
  startAction,
  endAction,
})(OneQuietNight);
