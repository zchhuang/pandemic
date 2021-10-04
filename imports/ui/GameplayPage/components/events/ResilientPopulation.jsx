import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import {
  unhighlightAllCities,
  resetCityOnclick,
  startAction,
  endAction,
} from '../../../redux/actions';
import { REGULAR, RESILIENT_POPULATION } from '../../../../constants/cards';
import CityCard from '../CityCard';
import Event from './Event';
import DialogModal from '../DialogModal';

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

let infectionDiscardPile = [];

function ResilientPopulation({
  zIndex,
  inHand,
  size,
  game,
  playerId,
  unhighlightAllCities,
  resetCityOnclick,
  startAction,
  endAction,
}) {
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');
  const classes = useStyles();

  const getInfectionDiscardPile = () => {
    startAction();
    unhighlightAllCities();
    resetCityOnclick();
    Meteor.call('games.getInfectionDiscardPile', game._id, (err, result) => {
      if (err) {
        alert(err);
      }
      infectionDiscardPile = result;
      setOpen(true);
    });
  };

  const callEvent = () => {
    setOpen(false);
    Meteor.call('players.playEvent', playerId, RESILIENT_POPULATION, {
      infectionCard: selectedCard,
    });
    endAction();
  };

  const renderDialogBody = () => {
    return (
      <div className={classes.cards}>
        {infectionDiscardPile.map((city) => (
          <div
            key={city}
            className={selectedCard === city ? classes.selected : ''}
            onClick={() => setSelectedCard(city)}
          >
            <CityCard city={city} />
          </div>
        ))}
      </div>
    );
  };

  const renderDialogActions = () => {
    return (
      <Button
        variant="contained"
        disabled={!infectionDiscardPile.includes(selectedCard)}
        onClick={callEvent}
      >
        Done
      </Button>
    );
  };

  return (
    <>
      <Event
        event={RESILIENT_POPULATION}
        handleEvent={getInfectionDiscardPile}
        zIndex={zIndex}
        inHand={inHand}
        size={size}
      />
      <DialogModal
        open={open}
        dialogTitle="Event: Resilient Population"
        dialogText="Choose a card to permanently remove from the infection discard pile."
        renderDialogBody={renderDialogBody}
        handleDialogClose={() => setOpen(false)}
        renderDialogActions={renderDialogActions}
        DialogProps={{ maxWidth: 'lg' }}
        preventExit
      />
    </>
  );
}

ResilientPopulation.defaultProps = {
  size: REGULAR,
};

ResilientPopulation.propTypes = {
  zIndex: PropTypes.number,
  inHand: PropTypes.bool,
  size: PropTypes.string,
  playerId: PropTypes.string,
  game: PropTypes.object,
  unhighlightAllCities: PropTypes.func,
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
  unhighlightAllCities,
  resetCityOnclick,
  startAction,
  endAction,
})(ResilientPopulation);
