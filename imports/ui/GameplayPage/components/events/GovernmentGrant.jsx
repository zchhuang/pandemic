import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import {
  highlightCities,
  unhighlightAllCities,
  setCityOnclick,
  resetCityOnclick,
  startAction,
  endAction,
} from '../../../redux/actions';
import {
  CityCards,
  GOVERNMENT_GRANT,
  REGULAR,
} from '../../../../constants/cards';
import Event from './Event';
import BuildStationAction from '../actions/BuildStationAction';

function GovernmentGrant({
  zIndex,
  inHand,
  size,
  game,
  playerId,
  highlightCities,
  unhighlightAllCities,
  setCityOnclick,
  resetCityOnclick,
  startAction,
  endAction,
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedCity, setSelectedCity] = React.useState(null);

  const callEvent = (event, params) => {
    unhighlightAllCities();
    resetCityOnclick();
    Meteor.call('players.playEvent', playerId, event, params);
    endAction();
  };

  const governmentGrant = () => {
    startAction();
    unhighlightAllCities();
    resetCityOnclick();
    const governmentGrantLocations = Object.keys(CityCards).filter(
      (city) => !game.researchStationLocations.includes(city)
    );
    highlightCities(governmentGrantLocations);
    governmentGrantLocations.forEach((city) => {
      setCityOnclick(city, () => {
        setSelectedCity(city);
        setOpen(true);
      });
    });
  };

  const playEvent = (stationToRemove) =>
    callEvent(GOVERNMENT_GRANT, { city: selectedCity, stationToRemove });

  return (
    <>
      <Event
        event={GOVERNMENT_GRANT}
        handleEvent={governmentGrant}
        zIndex={zIndex}
        inHand={inHand}
        size={size}
      />
      <BuildStationAction
        governmentGrantParams={{ selectedCity, open, setOpen, playEvent }}
      />
    </>
  );
}

GovernmentGrant.defaultProps = {
  size: REGULAR,
};

GovernmentGrant.propTypes = {
  zIndex: PropTypes.number,
  inHand: PropTypes.bool,
  size: PropTypes.string,
  playerId: PropTypes.string,
  game: PropTypes.object,
  highlightCities: PropTypes.func,
  unhighlightAllCities: PropTypes.func,
  setCityOnclick: PropTypes.func,
  resetCityOnclick: PropTypes.func,
  startAction: PropTypes.func,
  endAction: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    playerId: state.meteorData.playerObject?._id,
    game: state.meteorData.gameObject,
  };
};

export default connect(mapStateToProps, {
  highlightCities,
  unhighlightAllCities,
  setCityOnclick,
  resetCityOnclick,
  startAction,
  endAction,
})(GovernmentGrant);
