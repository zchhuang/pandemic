import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import { setDiscardCard } from '../../../redux/actions';
import {
  getHandSize,
  getPlayersWaitingOn,
  MAX_HAND_SIZE,
} from '../../../../constants/cards';
import {
  actionBarStyle as actionsBarStyle,
  ACTIONS_BAR_OVERLAY_Z_INDEX,
  canvasStyle,
  MAP_DISCARD_OVERLAY_Z_INDEX,
  topBarHeight,
} from '../../../../constants/styles';
import { Roles } from '../../../../constants/roles';
import { getSingularOrPlural } from '../../../../constants/utils';

const useStyles = makeStyles({
  overlay: {
    background: '#000000',
    position: 'absolute',
  },
  mapOverlay: {
    top: topBarHeight,
    width: '100%',
    height: canvasStyle.height - topBarHeight,
    opacity: 0.25,
    zIndex: MAP_DISCARD_OVERLAY_Z_INDEX,
    pointerEvents: 'none',
  },
  actionsBarOverlay: {
    top: canvasStyle.height - 3, // Manual adjustment
    width: actionsBarStyle.width,
    height: actionsBarStyle.height + 2,
    zIndex: ACTIONS_BAR_OVERLAY_Z_INDEX,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    opacity: 0.9,
  },
  overlayText: {
    font: '24px sans-serif',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 16,
  },
});

function DiscardOverlay({
  playersWaitingOn,
  handSize,
  actionInProgress,
  setDiscardCard,
  currentTurnPlayer, // The player who's currently taking actions
  playerId,
}) {
  const classes = useStyles();

  const getOverlay = (overlayText, shouldDarkenMap, icon) => {
    return (
      <>
        {shouldDarkenMap && (
          <div className={`${classes.overlay} ${classes.mapOverlay}`} />
        )}
        <div className={`${classes.overlay} ${classes.actionsBarOverlay}`}>
          {icon && <img src={icon} />}
          <p className={classes.overlayText}>{overlayText}</p>
        </div>
      </>
    );
  };

  // Waiting on us to discard
  if (handSize > MAX_HAND_SIZE && !actionInProgress) {
    const discardText = `Cannot have more than ${MAX_HAND_SIZE} cards at end of turn! Discard or play ${
      handSize - MAX_HAND_SIZE
    } ${getSingularOrPlural('card', handSize - MAX_HAND_SIZE)} from your hand`;
    setDiscardCard(true);
    return getOverlay(discardText, true, null);
  }

  // Waiting on someone else to discard
  setDiscardCard(false);
  if (playersWaitingOn.length > 0) {
    const [playerWaitingOn] = playersWaitingOn;
    const cardsOver = getHandSize(playerWaitingOn) - MAX_HAND_SIZE;
    const waitingText = `Waiting for ${
      playerWaitingOn.username
    } to discard or play ${cardsOver} ${getSingularOrPlural(
      'card',
      cardsOver
    )}`;
    return getOverlay(waitingText, false, Roles[currentTurnPlayer.role].icon);
  }

  // If not our turn, show who's playing
  if (currentTurnPlayer?._id !== playerId) {
    const actionsLeftText = `(${
      currentTurnPlayer.actionsLeft
    } ${getSingularOrPlural('action', currentTurnPlayer.actionsLeft)} left)`;
    const waitingText = `Waiting for ${currentTurnPlayer.username} to finish their turn ${actionsLeftText}`;
    return getOverlay(waitingText, false, Roles[currentTurnPlayer.role].icon);
  }

  // Our turn, don't darken anything
  return null;
}

DiscardOverlay.propTypes = {
  handSize: PropTypes.number,
  actionInProgress: PropTypes.bool,
  setDiscardCard: PropTypes.func,
};

const mapStateToProps = (state) => {
  const {
    gameObject,
    playerObject,
    players,
    actionInProgress,
  } = state.meteorData;
  const handSize = getHandSize(playerObject);
  // See if we're waiting for other players to discard
  const playersWaitingOn = getPlayersWaitingOn(players, playerObject?._id);
  const currentTurnPlayerId =
    gameObject.playerOrder[gameObject.numTurns % gameObject.playerOrder.length];
  const currentTurnPlayer = players.find((p) => p?._id === currentTurnPlayerId);

  return {
    playersWaitingOn,
    actionInProgress,
    handSize,
    currentTurnPlayer,
    playerId: playerObject?._id,
  };
};

export default connect(mapStateToProps, { setDiscardCard })(DiscardOverlay);
