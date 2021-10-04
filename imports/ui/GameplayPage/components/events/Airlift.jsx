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
import { Roles } from '../../../../constants/roles';
import { CityCards, AIRLIFT, REGULAR } from '../../../../constants/cards';
import Event from './Event';
import DialogModal from '../DialogModal';

const useStyles = makeStyles({
  players: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  player: {
    float: 'left',
    width: '75px',
  },
  selected: {
    borderRadius: '10px',
    border: '2px solid green',
    margin: 'auto',
  },
});

let airliftPlayerOptions = [];

function Airlift({
  zIndex,
  inHand,
  size,
  playerId,
  players,
  highlightCities,
  unhighlightAllCities,
  setCityOnclick,
  resetCityOnclick,
  startAction,
  endAction,
}) {
  const [open, setOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const classes = useStyles();

  const callEvent = (event, params) => {
    unhighlightAllCities();
    resetCityOnclick();
    Meteor.call('players.playEvent', playerId, event, params);
    endAction();
  };

  const chooseAirliftDestination = (playerId) => {
    unhighlightAllCities();
    resetCityOnclick();
    const airliftLocations = Object.keys(CityCards).filter(
      (city) => !players.some((p) => p._id === playerId && p.location === city)
    );
    highlightCities(airliftLocations);
    airliftLocations.forEach((city) => {
      setCityOnclick(city, () => {
        callEvent(AIRLIFT, { playerId: playerId, destination: city });
      });
    });
  };

  const chooseAirliftPlayer = (playerIds) => {
    if (playerIds.length > 1) {
      airliftPlayerOptions = playerIds;
      setOpen(true);
    } else {
      chooseAirliftDestination(playerIds[0]);
    }
  };

  const airlift = () => {
    startAction();
    unhighlightAllCities();
    resetCityOnclick();
    const cityToPlayerIdsMap = players.reduce((obj, player) => {
      const { location } = player;
      if (!(location in obj)) {
        obj[location] = [];
      }
      obj[location].push(player._id);
      return obj;
    }, {});
    highlightCities(Object.keys(cityToPlayerIdsMap));
    Object.entries(cityToPlayerIdsMap).forEach(([location, playerIds]) => {
      setCityOnclick(location, () => chooseAirliftPlayer(playerIds));
    });
  };

  const renderDialogBody = () => {
    return (
      <div className={classes.players}>
        {airliftPlayerOptions.map((playerId) => (
          <div
            key={playerId}
            className={selectedPlayer === playerId ? classes.selected : ''}
            onClick={() => setSelectedPlayer(playerId)}
          >
            <img
              className={classes.player}
              src={Roles[players.find((p) => p._id === playerId).role].icon}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderDialogActions = () => {
    return (
      <Button
        variant="contained"
        disabled={!players.some((p) => p._id === selectedPlayer)}
        onClick={() => {
          chooseAirliftDestination(selectedPlayer);
          setOpen(false);
        }}
      >
        Done
      </Button>
    );
  };

  return (
    <>
      <Event
        event={AIRLIFT}
        handleEvent={airlift}
        zIndex={zIndex}
        inHand={inHand}
        size={size}
      />
      <DialogModal
        open={open}
        dialogTitle="Event: Airlift"
        dialogText="Choose a player to Airlift."
        renderDialogBody={renderDialogBody}
        handleDialogClose={() => setOpen(false)}
        renderDialogActions={renderDialogActions}
        preventExit
      />
    </>
  );
}

Airlift.defaultProps = {
  size: REGULAR,
};

Airlift.propTypes = {
  zIndex: PropTypes.number,
  inHand: PropTypes.bool,
  size: PropTypes.string,
  playerId: PropTypes.string,
  players: PropTypes.array,
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
    players: state.meteorData.players,
  };
};

export default connect(mapStateToProps, {
  highlightCities,
  unhighlightAllCities,
  setCityOnclick,
  resetCityOnclick,
  startAction,
  endAction,
})(Airlift);
