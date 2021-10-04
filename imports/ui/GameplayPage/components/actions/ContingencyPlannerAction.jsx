import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import EventCard from '../EventCard';
import Action from './Action';
import { useEffect } from 'react';

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

function ContingencyPlannerAction({ actionsDisabled, player, game }) {
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');
  const [discardedEvents, setDiscardedEvents] = useState([]);
  const classes = useStyles();

  const recycleEvent = () => {
    handleDialogClose();
    Meteor.call('players.recycleEvent', player._id, selectedCard);
  };

  useEffect(() => {
    Meteor.call('games.getDiscardedEvents', game._id, (err, result) => {
      if (err) {
        alert(err);
      }
      setDiscardedEvents(result);
    });
  }, [game.playerDiscardPile]);

  const renderDialogBody = () => {
    return (
      <div className={classes.cards}>
        {discardedEvents.map((event) => (
          <div
            key={event}
            className={selectedCard === event ? classes.selected : ''}
            onClick={() => setSelectedCard(event)}
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>
    );
  };

  const renderDialogActions = () => {
    return (
      <Button
        variant="contained"
        disabled={!discardedEvents.includes(selectedCard)}
        onClick={recycleEvent}
      >
        Done
      </Button>
    );
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  return (
    <Action
      dialogTitle="Contingency Planner Action"
      dialogText="Choose an event card to take from the player discard pile."
      renderDialogBody={renderDialogBody}
      renderDialogActions={renderDialogActions}
      disabled={
        actionsDisabled ||
        discardedEvents.length === 0 ||
        player.contingencyCard !== null
      }
      setOpen={setOpen}
      buttonTooltip="Place a discarded event card into your hand"
      text="Recycle Card"
      open={open}
      handleDialogClose={handleDialogClose}
      buttonIcon="/actions/contingency.svg"
    />
  );
}

ContingencyPlannerAction.propTypes = {
  player: PropTypes.object,
  game: PropTypes.object,
  actionsDisabled: PropTypes.bool,
};

const mapStateToProps = (state) => {
  return {
    player: state.meteorData.playerObject,
    game: state.meteorData.gameObject,
  };
};

export default connect(mapStateToProps)(ContingencyPlannerAction);
