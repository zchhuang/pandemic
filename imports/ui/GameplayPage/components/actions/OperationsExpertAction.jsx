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

function OperationsExpertAction({
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
  const dialogText = 'Choose a card to discard.';
  const classes = useStyles();

  const discardCards = player.cityCards;
  const validMoveLocations = Object.keys(CityCards).filter(
    (city) => player.location !== city
  );
  const hasResearchStation =
    game.cityObjects[player.location].hasResearchStation;

  const cityOnclick = (city) => {
    setOpenDialog(true);
    setSelectedCity(city);
  };

  // Calls the operationsExpertMove method in players.js based on which card was chosen
  const move = () => {
    endMove();
    Meteor.call(
      'players.operationsExpertMove',
      player._id,
      selectedDiscardCard,
      selectedCity
    );
  };

  const renderMoveButton = () => {
    return (
      <Button variant="contained" onClick={move}>
        Move!
      </Button>
    );
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
    return discardCards.includes(selectedDiscardCard) && renderMoveButton();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedDiscardCard('');
    setSelectedCity('');
  };

  const endMove = () => {
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
    highlightCities(validMoveLocations);
    validMoveLocations.forEach((city) => setCityOnclick(city, cityOnclick));
  }

  // For conditionally rendering fly vs. cancel action button
  const disabled =
    !displayCities &&
    (actionsDisabled ||
      !hasResearchStation ||
      player.operationsExpertAction === game.numTurns);
  const setOpen = displayCities ? endMove : setDisplayCities;
  const buttonText = displayCities ? 'Cancel Op Fly' : 'Operations Fly';
  const buttonIcon = displayCities
    ? '/actions/cancel-op-move.svg'
    : '/actions/op-move.svg';

  return (
    <Action
      renderDialogBody={renderDialogBody}
      dialogText={dialogText}
      renderDialogActions={renderDialogActions}
      disabled={disabled}
      setOpen={setOpen}
      text={buttonText}
      open={openDialog}
      handleDialogClose={handleDialogClose}
      buttonIcon={buttonIcon}
    />
  );
}

OperationsExpertAction.propTypes = {
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
})(OperationsExpertAction);
