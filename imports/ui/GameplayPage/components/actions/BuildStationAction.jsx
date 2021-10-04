import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import Action from './Action';
import { OPERATIONS_EXPERT } from '../../../../constants/roles';
import CityCard from '../CityCard';
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

// Used for both the actual build station action and Government Grant
function BuildStationAction({
  player,
  playerId,
  actionsDisabled,
  hasResearchStation,
  hasCard,
  researchStationLocations,
  governmentGrantParams, // When non-null, we create modal for Government Grant
}) {
  const [openAction, setOpenAction] = useState(false);
  const [stationToRemove, setStationToRemove] = useState(null);

  const classes = useStyles();

  const maxStations = researchStationLocations.length >= 6;

  const buttonText = maxStations ? 'Remove and Build Station' : 'Build Station';
  const dialogText = maxStations
    ? 'We can only have six stations at a time! Choose a research station to remove.'
    : '';

  const isGovernmentGrant =
    'selectedCity' in governmentGrantParams &&
    'open' in governmentGrantParams &&
    'setOpen' in governmentGrantParams &&
    'playEvent' in governmentGrantParams;

  const open = isGovernmentGrant ? governmentGrantParams.open : openAction;
  const setOpen = isGovernmentGrant
    ? governmentGrantParams.setOpen
    : setOpenAction;

  const buildStation = () => {
    handleDialogClose();
    if (isGovernmentGrant) {
      governmentGrantParams.playEvent(stationToRemove);
    } else {
      Meteor.call('players.buildResearchStation', playerId, stationToRemove);
    }
  };

  const renderDialogBody = () => {
    return (
      maxStations && (
        <div>
          <div className={classes.cards}>
            {researchStationLocations.map((city) => (
              <div
                key={city}
                className={stationToRemove === city ? classes.selected : ''}
                onClick={() => setStationToRemove(city)}
              >
                <CityCard city={city} />
              </div>
            ))}
          </div>
        </div>
      )
    );
  };

  const renderDialogActions = () => {
    return (
      <Button
        disabled={maxStations && !stationToRemove}
        variant="contained"
        onClick={buildStation}
      >
        {buttonText}
      </Button>
    );
  };

  const handleDialogClose = () => {
    setOpen(false);
    setStationToRemove(null);
  };

  const dialogTitle = 'Build Research Station';

  return isGovernmentGrant ? (
    <DialogModal
      open={open}
      dialogTitle={dialogTitle}
      dialogText={dialogText}
      renderDialogBody={renderDialogBody}
      renderDialogActions={renderDialogActions}
      handleDialogClose={handleDialogClose}
    />
  ) : (
    <Action
      dialogTitle={dialogTitle}
      dialogText={dialogText}
      renderDialogBody={renderDialogBody}
      renderDialogActions={renderDialogActions}
      disabled={
        actionsDisabled ||
        hasResearchStation ||
        (!hasCard && player.role !== OPERATIONS_EXPERT)
      }
      setOpen={setOpen}
      text="Build Station"
      open={open}
      handleDialogClose={handleDialogClose}
      buttonIcon="/actions/build.svg"
    />
  );
}

BuildStationAction.defaultProps = {
  governmentGrantParams: {},
};

BuildStationAction.propTypes = {
  player: PropTypes.object,
  playerId: PropTypes.string,
  actionsDisabled: PropTypes.bool,
  hasResearchStation: PropTypes.bool,
  hasCard: PropTypes.bool,
  researchStationLocations: PropTypes.array,
  governmentGrantParams: PropTypes.object,
};

const mapStateToProps = (state) => {
  const game = state.meteorData.gameObject;
  const player = state.meteorData.playerObject;
  const { hasResearchStation } = game.cityObjects[player.location];
  const hasCard = player.cityCards.includes(player.location);
  const { researchStationLocations } = game;

  return {
    player,
    playerId: player._id,
    hasResearchStation,
    hasCard,
    researchStationLocations,
  };
};

export default connect(mapStateToProps)(BuildStationAction);
