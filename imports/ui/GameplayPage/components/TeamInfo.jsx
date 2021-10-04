import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import Divider from '@material-ui/core/Divider';
import {
  getCityName,
  CityCards,
  getOrderedPlayers,
} from '../../../constants/cards';
import {
  canvasStyle,
  gameplayFontFamilies,
  listHeaderStyle,
} from '../../../constants/styles';

import { Diseases } from '../../../constants/diseases';
import { rolesBordered } from '../../../constants/roles';

const useStyles = makeStyles(() => ({
  root: {
    width: canvasStyle.width / 4,
    height: canvasStyle.height / 2,
    overflow: 'auto',
    backgroundColor: 'rgba(0, 38, 95, 0.58)',
    padding: 0,
    color: 'white',
  },
  header: {
    height: canvasStyle.height / 15,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(70, 108, 175, 1)',
  },
  subheader: {
    height: canvasStyle.height / 12,
  },
  nested: {
    paddingLeft: 32,
    height: canvasStyle.height / 17,
  },
  color: {
    width: 24,
    height: 24,
    border: '1px solid white',
    borderRadius: 100,
  },
  role: {
    ...gameplayFontFamilies,
    margin: 0,
    fontSize: '14px',
  },
  playerLine: {
    ...gameplayFontFamilies,
    margin: 0,
  },
}));

function TeamInfo({ players }) {
  const classes = useStyles();
  const [open, setOpen] = useState(players.map(() => true));

  const handleClick = (i) => {
    setOpen(
      open
        .slice(0, i) // Add all items before i
        .concat(!open[i]) // Negate current item
        .concat(open.slice(i + 1)) // Add all items after i
    );
  };
  return (
    <List
      component="nav"
      aria-labelledby="subheader"
      subheader={<div />}
      className={classes.root}
    >
      <ListSubheader
        component="div"
        id="subheader"
        className={classes.header}
        style={listHeaderStyle}
      >
        Team Info
      </ListSubheader>
      {players.map((player, i) => (
        <Fragment key={player._id}>
          <Divider />
          <ListItem
            button
            onClick={() => handleClick(i)}
            className={classes.subheader}
          >
            <ListItemIcon>
              <img src={rolesBordered[player?.role]?.icon} />
            </ListItemIcon>
            <ListItemText>
              <p className={classes.playerLine}>{player.username}</p>
              <p className={(classes.playerLine, classes.role)}>
                {player.role}
              </p>
            </ListItemText>
            {open[i] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Divider />
          <Collapse in={open[i]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {player.cityCards.map((city) => {
                const { color } = CityCards[city];
                return (
                  <ListItem key={city} button className={classes.nested}>
                    <ListItemIcon>
                      <div
                        className={classes.color}
                        style={{ background: Diseases[color].color }}
                      />
                    </ListItemIcon>
                    <ListItemText>
                      <span style={gameplayFontFamilies}>
                        {getCityName(city)}
                      </span>
                    </ListItemText>
                  </ListItem>
                );
              })}
              {player.eventCards.map((event) => {
                return (
                  <ListItem
                    key={event + player._id}
                    button
                    className={classes.nested}
                  >
                    <ListItemIcon>
                      <StarBorder style={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText>
                      <span style={gameplayFontFamilies}>{event}</span>
                    </ListItemText>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </Fragment>
      ))}
    </List>
  );
}

TeamInfo.propTypes = {
  players: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    players: getOrderedPlayers(
      state.meteorData.players,
      state.meteorData.playerObject,
      true
    ),
  };
};

export default connect(mapStateToProps)(TeamInfo);
