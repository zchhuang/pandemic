import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import CityCard from './CityCard';
import EventCard from './EventCard';
import {
  BLACK,
  BLUE,
  RED,
  YELLOW,
  Diseases,
} from '../../../constants/diseases';
import {
  canvasStyle,
  MAP_DISCARD_OVERLAY_Z_INDEX,
  topBarHeight,
} from '../../../constants/styles';
import { INFECTION_INDEX_TO_RATE } from '../../../api/games';

import { UNCURED, CURED, ERADICATED } from '../../../constants/status';
import { CityCards, SMALL } from '../../../constants/cards';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    whiteSpace: 'normal',
  },
  topBar: {
    zIndex: MAP_DISCARD_OVERLAY_Z_INDEX + 1,
    width: canvasStyle.width,
    position: 'absolute',
    height: topBarHeight,
    background: '#343434',
    boxShadow: 'none',
  },
  discardedCard: {
    position: 'relative',
    top: -6,
    paddingLeft: 24,
  },
  card: {
    marginLeft: 6,
    marginTop: 80,
  },
  countLabel: {
    marginLeft: 7,
    color: '#F5F3F3',
    fontFamily: 'Roboto Condensed',
    fontWeight: 'bold',
  },
  cardLabel: {
    marginLeft: -30,
    paddingRight: 12,
    marginTop: -8,
    opacity: 0.6,
    color: 'black',
    fontSize: '18px',
    fontFamily: 'Roboto Condensed',
    fontWeight: 'bold',
  },
  icon: {
    display: 'block',
    position: 'relative',
    marginLeft: 20,
    width: 30,
    height: 30,
  },
  cube: {
    border: '1.5px solid white',
    marginLeft: 24,
  },
  infectionRateCounter: {
    marginLeft: 26,
  },
  infectionCountMarker: {
    marginLeft: 4,
    display: 'inline-block',
  },
  infectionCircle: {
    width: 16,
    height: 16,
    border: '2px solid #F5F3F3',
    background: 'black',
    boxSizing: 'border-box',
    borderRadius: 100,
  },
  selected: {
    background: '#327841',
  },
  diseaseIcon: {
    marginLeft: 24,
    width: 32,
    height: 32,
    transform: 'matrix(-1, 0, 0, 1, 0, 0)',
    alignItems: 'center',
    display: 'flex',
  },
  statusEmoji: {
    position: 'absolute',
    top: -3,
    left: 0,
    fontSize: '28px',
    height: 28,
    width: 28,
  },
}));

function TopBar({ game }) {
  const classes = useStyles();
  const diseaseOrder = [RED, BLUE, YELLOW, BLACK];

  const {
    playerDiscardPile,
    playerDrawPile,
    diseaseCubesLeft,
    researchStationLocations,
    diseaseStatus,
    infectionDiscardPile,
    infectionDrawPile,
    numOutbreaks,
    infectionIndex,
  } = game;

  const renderDiscardPile = (discardPile, name) => {
    const topCard = discardPile.slice(-1).pop();
    return (
      <Tooltip title={`${name} discard pile`}>
        <span className={`${classes.card} ${classes.discardedCard}`}>
          {topCard ? (
            topCard in CityCards ? (
              <CityCard city={topCard} selectionMode={false} size={SMALL} />
            ) : (
              <EventCard event={topCard} selectionMode={false} size={SMALL} />
            )
          ) : (
            <img src="/discardPile.svg" />
          )}
        </span>
      </Tooltip>
    );
  };

  const renderDrawPile = (drawPile, iconPath, name) => (
    <>
      <Tooltip title={`${name} deck (${drawPile.length} cards left)`}>
        <span className={classes.card}>
          <img src={iconPath} />
        </span>
      </Tooltip>
      <Typography variant="h6" className={classes.cardLabel}>
        {drawPile.length}
      </Typography>
    </>
  );

  const statusMap = {
    [UNCURED]: {
      emoji: '',
      adjective: 'uncured',
    },
    [CURED]: {
      emoji: '🧪',
      adjective: 'cured!',
    },
    [ERADICATED]: {
      emoji: '🚫',
      adjective: 'eradicated! :D',
    },
  };

  const getOutbreakIcon = () => {
    if (numOutbreaks < 4) return '/outbreakCountWhite.svg';
    else if (numOutbreaks < 6) return '/outbreakCountOrange.svg';
    else return '/outbreakCountRed.svg';
  };
  // Later would like this to be a gradual increase towards red, or have a red pulse

  const renderDiseaseCounts = () =>
    diseaseOrder.map((disease) => (
      <Fragment key={disease + 'count'}>
        <Tooltip
          title={`${Diseases[disease].name} is ${
            statusMap[diseaseStatus[disease]].adjective
          }`}
        >
          <span
            className={`${classes.icon} ${classes.cube}`}
            style={{ background: Diseases[disease].color }}
          >
            <span className={classes.statusEmoji}>
              {statusMap[diseaseStatus[disease]].emoji}
            </span>
          </span>
        </Tooltip>
        <Tooltip title={`${Diseases[disease].name} disease cubes left`}>
          <Typography variant="h6" className={classes.countLabel}>
            {diseaseCubesLeft[disease]}
          </Typography>
        </Tooltip>
      </Fragment>
    ));

  const renderIconAndCount = (iconPath, count, label) => (
    <>
      <Tooltip title={label}>
        <img src={iconPath} className={classes.icon} />
      </Tooltip>
      <Typography variant="h6" className={classes.countLabel}>
        {count}
      </Typography>
    </>
  );

  const renderInfectionRateCounter = (infectionIndex) => (
    <Tooltip
      title={`Currently infecting ${INFECTION_INDEX_TO_RATE[infectionIndex]} cities per turn`}
    >
      <span className={classes.infectionRateCounter}>
        {INFECTION_INDEX_TO_RATE.map((infectionRate, i) => (
          <div
            key={'infectionRate-' + i}
            className={classes.infectionCountMarker}
          >
            <div
              className={`${classes.infectionCircle} ${
                infectionIndex === i ? classes.selected : ''
              }`}
            />
            <span className={classes.countLabel} style={{ marginLeft: 4 }}>
              {infectionRate}
            </span>
          </div>
        ))}
      </span>
    </Tooltip>
  );

  return (
    <div className={classes.root} style={{ paddingRight: 0 }}>
      <AppBar position="static" className={classes.topBar}>
        <Toolbar>
          {renderDiscardPile(playerDiscardPile, 'Player card')}
          {renderDrawPile(playerDrawPile, '/playerDeck.svg', 'Player card')}
          {renderDiseaseCounts()}
          {renderIconAndCount(
            '/station.svg',
            6 - researchStationLocations.length,
            'Research stations left'
          )}
          {renderDiscardPile(infectionDiscardPile, 'Infection card')}
          {renderDrawPile(
            infectionDrawPile,
            '/infectionDeck.svg',
            'Infection card'
          )}
          {renderIconAndCount(
            getOutbreakIcon(),
            numOutbreaks,
            'Outbreaks (we lose when this hits 8!)'
          )}
          {renderInfectionRateCounter(infectionIndex)}
        </Toolbar>
      </AppBar>
    </div>
  );
}

TopBar.propTypes = {
  game: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    game: state.meteorData.gameObject,
  };
};

export default connect(mapStateToProps)(TopBar);
