import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import City from './City';
import Line from './Line';
import Label from './Label';
import Player from './Player';
import DiscardOverlay from './GameplayPageOverlay';
import { Positions } from '../../../../constants/positions';
import {
  CityCards,
  getPlayersWaitingOn,
  getOrderedPlayers,
} from '../../../../constants/cards';
import { connect } from 'react-redux';
import { Roles } from '../../../../constants/roles';
import { canvasStyle } from '../../../../constants/styles';
import ActionsBar from '../ActionsBar';
import FeedbackLink from '../../../FeedbackLink';

const useStyles = makeStyles({
  map: {
    width: canvasStyle.width,
    height: canvasStyle.height,
    backgroundColor: '#0B2040',
    backgroundImage: 'url(/map-night.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'auto',
    position: 'absolute',
  },
  lines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  invisibleBlock: {
    width: canvasStyle.width,
    height: canvasStyle.height,
    display: 'inline-block',
    position: 'relative',
  },
  bugIcon: {
    top: canvasStyle.height / 10,
    right: 5,
    position: 'absolute',
    zIndex: 1,
    height: 39,
    width: 34,
  },
});

function Map({
  players,
  actionInProgress,
  discardCard,
  isMyTurn,
  actionsDisabled,
  playerObject,
  playersWaitingOn,
}) {
  const classes = useStyles();

  const drawLines = () => {
    return (
      <div className={classes.lines}>
        <svg
          viewBox={`0 0 ${canvasStyle.width} ${canvasStyle.height}`}
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Object.keys(Positions).map((city) =>
            CityCards[city].neighbors.map((otherCity) => {
              return (
                <Line
                  key={`${city}${otherCity}`}
                  city={city}
                  otherCity={otherCity}
                />
              );
            })
          )}
        </svg>
      </div>
    );
  };

  const drawCities = () => {
    return Object.entries(Positions).map(([city, { cityPosition }]) => {
      return (
        <City
          key={city}
          name={city}
          position={cityPosition}
          color={CityCards[city].color}
          canvasDimensions={canvasStyle}
        />
      );
    });
  };

  const drawLabels = () => {
    return Object.entries(Positions).map(([city, { cityPosition }]) => {
      const labelPosition = {
        x: cityPosition.x,
        y: `${parseFloat(cityPosition.y) + 3.5}%`,
      };
      return (
        <Label
          key={city + 'label'}
          position={labelPosition}
          name={CityCards[city].name}
        />
      );
    });
  };

  // Map from city -> list of players on that city
  const cityToPlayerIdsMap = players.reduce((obj, player) => {
    const { location } = player;
    if (!(location in obj)) {
      obj[location] = [];
    }
    obj[location].push(player._id);
    return obj;
  }, {});

  const drawPlayers = () =>
    players.map((player) => {
      const i = cityToPlayerIdsMap[player.location].indexOf(player._id);
      return (
        <Player
          key={player._id}
          position={Positions[player.location].cityPosition}
          roleInfo={Roles[player.role]}
          offset={(i + 1) / (cityToPlayerIdsMap[player.location].length + 1)}
        />
      );
    });

  /** "Ghost" div to help push out sidebar because the canvas is position: absolution */
  const invisibleBlock = () => <div className={classes.invisibleBlock}></div>;

  return (
    <>
      <div className={classes.map}>
        <FeedbackLink>
          <img
            className={classes.bugIcon}
            title="Report a bug?"
            src="/bugIcon.svg"
          />
        </FeedbackLink>
        {drawLines()}
        {drawCities()}
        {drawLabels()}
        {drawPlayers()}
        <DiscardOverlay />
      </div>
      {invisibleBlock()}
      {playerObject && (
        <ActionsBar
          endTurnDisabled={
            !isMyTurn ||
            actionInProgress ||
            discardCard ||
            playersWaitingOn.length > 0
          }
          actionsDisabled={actionsDisabled}
        />
      )}
    </>
  );
}

Map.propTypes = {
  players: PropTypes.array.isRequired,
  actionInProgress: PropTypes.bool.isRequired,
  discardCard: PropTypes.bool.isRequired,
  isMyTurn: PropTypes.bool.isRequired,
  actionsDisabled: PropTypes.bool.isRequired,
  playerObject: PropTypes.object,
  playersWaitingOn: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => {
  // Make sure our player renders last when multiple players are on the same city
  const players = getOrderedPlayers(
    state.meteorData.players,
    state.meteorData.playerObject,
    false
  );

  const playersWaitingOn = getPlayersWaitingOn(
    state.meteorData.players,
    state.meteorData.playerObject?._id
  );

  return {
    players,
    actionInProgress: state.actionInProgress,
    discardCard: state.discardCard,
    playerObject: state.meteorData.playerObject,
    playersWaitingOn,
  };
};

export default connect(mapStateToProps)(Map);
