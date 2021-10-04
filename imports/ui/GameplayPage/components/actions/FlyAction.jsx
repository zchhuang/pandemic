import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import {
  highlightCities,
  unhighlightAllCities,
  setCityOnclick,
  resetCityOnclick,
  startAction,
  endAction,
} from '../../../redux/actions';
import { CityCards } from '../../../../constants/cards';

import Action from './Action';
import CityCard from '../CityCard';

const useStyles = makeStyles({
  cards: {
    display: 'flex',
    flexDirection: 'row',
  },
  selected: {
    borderRadius: '10px',
    border: '2px solid green',
    margin: 'auto',
  },
});

let discardCards = [];

function FlyAction({
  player,
  game,
  actionsDisabled,
  highlightCities,
  unhighlightAllCities,
  setCityOnclick,
  resetCityOnclick,
  startAction,
  endAction,
}) {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDiscardCard, setSelectedDiscardCard] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [displayCities, setDisplayCities] = useState(false);
  const classes = useStyles();

  const hasResearchStation = (location) => {
    return (
      location in game.cityObjects &&
      game.cityObjects[location].hasResearchStation
    );
  };

  const canDirectFlight = (location) => {
    return player.cityCards.includes(location);
  };

  const canCharterFlight = () => {
    return player.cityCards.includes(player.location);
  };

  const canShuttleFlight = (location) => {
    return hasResearchStation(player.location) && hasResearchStation(location);
  };

  const cityOnclick = (city) => {
    // Determine cards that are valid to discard to get to the desired location
    discardCards = [
      flightLocations[city].directFlight ? city : null,
      flightLocations[city].charterFlight ? player.location : null,
    ].filter((location) => location != null);

    setOpenDialog(true);
    setSelectedCity(city);
  };

  // Sets whether shuttle flight is valid for the chosen location
  const shuttleFlightOption = canShuttleFlight(selectedCity);

  // Object that contains every city, and has a boolean value of directFlight, charerFlight, and shuttleFlight for each
  const flightLocations = Object.keys(CityCards).reduce((acc, location) => {
    if (location !== player.location) {
      acc[location] = {
        directFlight: canDirectFlight(location),
        charterFlight: canCharterFlight(),
        shuttleFlight: canShuttleFlight(location),
      };
    }
    return acc;
  }, {});

  // Array that uses the flightLocations object to determine which cities are valid flight locations
  const validFlightLocations = Object.keys(flightLocations).filter(
    (location) => {
      let flights = flightLocations[location];
      return (
        flights.directFlight || flights.charterFlight || flights.shuttleFlight
      );
    }
  );

  // Calls the fly method in players.js based on which card was chosen
  const fly = () => {
    endFlight();
    if (selectedCity === selectedDiscardCard) {
      Meteor.call('players.directFlight', player._id, selectedCity);
    } else if (player.location === selectedDiscardCard) {
      Meteor.call('players.charterFlight', player._id, selectedCity);
    } else {
      Meteor.call('players.shuttleFlight', player._id, selectedCity);
    }
  };

  const renderDialogBody = () => {
    if (discardCards.length === 1) {
      setSelectedDiscardCard(discardCards[0]);
    }
    return (
      <div className={classes.cards}>
        {discardCards.map((city) => (
          <div
            key={city}
            className={selectedDiscardCard === city ? classes.selected : ''}
            onClick={() => setSelectedDiscardCard(city)}
          >
            <CityCard city={city} />
          </div>
        ))}
      </div>
    );
  };

  const renderDialogActions = () => {
    return (
      <>
        {shuttleFlightOption && (
          <Button
            variant="contained"
            onClick={() => {
              fly();
            }}
          >
            Free Shuttle Flight!
          </Button>
        )}
        {discardCards.includes(selectedDiscardCard) && (
          <Button variant="contained" onClick={fly}>
            Discard and Fly!
          </Button>
        )}
      </>
    );
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedDiscardCard('');
    setSelectedCity('');
    discardCards = [];
  };

  const endFlight = () => {
    endAction();
    handleDialogClose();
    setDisplayCities(false);
    unhighlightAllCities();
    resetCityOnclick();
  };

  if (displayCities) {
    startAction();
    unhighlightAllCities();
    resetCityOnclick();
    highlightCities(validFlightLocations);
    validFlightLocations.forEach((city) => setCityOnclick(city, cityOnclick));
  }

  const getDialogText = () => {
    if (discardCards.length > 0) {
      if (shuttleFlightOption) {
        return `Discard a card or shuttle flight to ${CityCards[selectedCity].name}.`;
      }
      return `Select which card to discard to fly to ${CityCards[selectedCity].name}.`;
    } else {
      if (shuttleFlightOption) {
        return `Well, go ahead then. Take your free shuttle flight to ${CityCards[selectedCity].name}.`;
      }
      return '';
    }
  };

  // For conditionally rendering fly vs. cancel action button
  const disabled =
    !displayCities && (actionsDisabled || validFlightLocations.length === 0);
  const setOpen = displayCities ? endFlight : setDisplayCities;
  const buttonText = displayCities ? 'Cancel Fly Action' : 'Fly to a City';
  const buttonIcon = displayCities
    ? '/actions/cancel-fly.svg'
    : '/actions/fly.svg';

  return (
    <>
      <Action
        dialogTitle="It's time to pay"
        dialogText={getDialogText()}
        renderDialogBody={renderDialogBody}
        renderDialogActions={renderDialogActions}
        disabled={disabled}
        setOpen={setOpen}
        text={buttonText}
        open={openDialog}
        handleDialogClose={handleDialogClose}
        buttonIcon={buttonIcon}
      />
    </>
  );
}

FlyAction.propTypes = {
  player: PropTypes.object,
  game: PropTypes.object,
  actionsDisabled: PropTypes.bool,
  highlightCities: PropTypes.func,
  unhighlightAllCities: PropTypes.func,
  setCityOnclick: PropTypes.func,
  resetCityOnclick: PropTypes.func,
  startAction: PropTypes.func,
  endAction: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    player: state.meteorData.playerObject,
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
})(FlyAction);
