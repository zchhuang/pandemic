import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';

import {
  highlightCities,
  unhighlightAllCities,
  setCityOnclick,
  resetCityOnclick,
} from '../redux/actions';
import { CityCards, getPlayersWaitingOn } from '../../constants/cards';

import Map from './components/map/Map';
import CityCard from './components/CityCard';
import EventCard from './components/EventCard';
import History from './components/History';
import TeamInfo from './components/TeamInfo';
import TopBar from './components/TopBar';
import {
  canvasStyle,
  cardOverlap,
  PLAYER_CARD_START_Z_INDEX,
  regularCardStyle,
} from '../../constants/styles';

const useStyles = makeStyles({
  playerHand: ({ handSize }) => ({
    display: 'grid',
    width: canvasStyle.width,
    position: 'relative',
    top: -cardOverlap,
    gridTemplateColumns: `repeat(${handSize - 1}, min(${
      (canvasStyle.width - regularCardStyle.width) / (handSize - 1)
    }px, ${regularCardStyle.width}px)) ${regularCardStyle.width}px`,
    justifyContent: 'center',
    whiteSpace: 'normal',
  }),
  gameplayBackground: {
    backgroundColor: '#1C1C1C',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    overflow: 'auto',
  },
  contingencyCard: {
    borderRadius: '10px',
    border: '2px solid red',
    margin: 'auto',
  },
  gameplayContainer: {
    display: 'flex',
    justifyContent: 'center',
    height: '90vh',
    whiteSpace: 'nowrap',
  },
  gameplaySidebar: {
    whiteSpace: 'normal',
    display: 'inline-block',
  },
});

function GameplayPage({
  game,
  player,
  actionInProgress,
  discardCard,
  highlightCities,
  unhighlightAllCities,
  setCityOnclick,
  resetCityOnclick,
  playersWaitingOn,
}) {
  const classes = useStyles({
    handSize: player
      ? player.cityCards.length +
        player.eventCards.length +
        (player.contingencyCard != null)
      : 0,
  });

  const isMyTurn =
    player?._id === game.playerOrder[game.numTurns % game.playerOrder.length];

  const actionsDisabled =
    !isMyTurn ||
    player?.actionsLeft <= 0 ||
    actionInProgress ||
    discardCard ||
    playersWaitingOn.length > 0;

  const renderCards = () => {
    let i = PLAYER_CARD_START_Z_INDEX;
    return (
      <div className={classes.playerHand}>
        {player.cityCards.map((card) => (
          <CityCard key={card} city={card} zIndex={i++} inHand={true} />
        ))}
        {player.eventCards.map((card) => (
          <EventCard key={card} event={card} zIndex={i++} inHand={true} />
        ))}
        {player.contingencyCard != null && (
          <div className={classes.contingencyCard}>
            <EventCard
              event={player.contingencyCard}
              zIndex={i++}
              inHand={true}
            />
          </div>
        )}
      </div>
    );
  };

  const driveTo = (destination) => {
    Meteor.call('players.drive', player._id, destination);
  };

  useEffect(() => {
    if (!actionInProgress && player) {
      unhighlightAllCities();
      resetCityOnclick();
      if (!actionsDisabled) {
        highlightCities(CityCards[player.location].neighbors);
        CityCards[player.location].neighbors.forEach((neighbor) => {
          setCityOnclick(neighbor, () => driveTo(neighbor));
        });
      }
    }
  }, [actionsDisabled, player, actionInProgress]);

  const renderSideBar = () => (
    <div className={classes.gameplaySidebar}>
      <TeamInfo />
      <History />
    </div>
  );

  return (
    <div className={classes.gameplayBackground}>
      <div className={classes.gameplayContainer}>
        <div>
          <TopBar />
          <Map isMyTurn={isMyTurn} actionsDisabled={actionsDisabled} />
          {renderSideBar()}
          {player?._id && renderCards()}
        </div>
      </div>
    </div>
  );
}

GameplayPage.propTypes = {
  game: PropTypes.object,
  player: PropTypes.object,
  actionInProgress: PropTypes.bool,
  discardCard: PropTypes.bool,
  selectedCity: PropTypes.string,
  highlightCities: PropTypes.func,
  unhighlightAllCities: PropTypes.func,
  setCityOnclick: PropTypes.func,
  resetCityOnclick: PropTypes.func,
  playersWaitingOn: PropTypes.array,
};

const mapStateToProps = (state) => {
  // See if we're waiting for other players to discard
  const playersWaitingOn = getPlayersWaitingOn(
    state.meteorData.players,
    state.meteorData.playerObject?._id
  );

  return {
    game: state.meteorData.gameObject,
    player: state.meteorData.playerObject,
    actionInProgress: state.actionInProgress,
    discardCard: state.discardCard,
    playersWaitingOn,
  };
};

export default connect(mapStateToProps, {
  highlightCities,
  unhighlightAllCities,
  setCityOnclick,
  resetCityOnclick,
})(GameplayPage);
