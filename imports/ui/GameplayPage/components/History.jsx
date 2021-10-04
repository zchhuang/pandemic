import React, { useRef, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import {
  canvasStyle,
  gameplayFontFamilies,
  listHeaderStyle,
  listSubheaderStyle,
} from '../../../constants/styles';

const useStyles = makeStyles(() => ({
  root: {
    width: canvasStyle.width / 4,
    height: canvasStyle.height / 2,
    overflow: 'auto',
    backgroundColor: 'rgba(62, 65, 147, .58)',
    color: 'white',
    position: 'relative',
    padding: 0,
  },
  header: {
    backgroundColor: 'rgba(33, 18, 100, 1)',
    color: 'white',
    height: canvasStyle.height / 15,
    fontSize: 10,
    fontWeight: 'bold',
  },
  subheader: {
    height: canvasStyle.height / 15,
    color: 'white',
  },
  entries: {
    color: 'white',
    fontSize: '14px',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
}));

function History({ game, players }) {
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [game]);

  const classes = useStyles();

  const getPlayer = (turn) => {
    const playerId = game.playerOrder[turn % players.length];
    return players.find((p) => p._id === playerId)?.username;
  };

  return (
    <div>
      <List
        className={classes.root}
        subheader={
          <ListSubheader
            component="div"
            id="subheader"
            className={classes.header}
            style={listHeaderStyle}
          >
            History
          </ListSubheader>
        }
      >
        {game.history.map((itemsInTurn, turn) => (
          <Fragment key={`turn ${turn}`}>
            <ListItem className={classes.subheader}>
              <ListItemText>
                <span style={listSubheaderStyle}>
                  Turn {turn + 1} ({getPlayer(turn)})
                </span>
              </ListItemText>
            </ListItem>
            <Divider />
            {itemsInTurn.map((item, i) => (
              <Fragment key={`item-${turn}-${i}`}>
                <ListItem>
                  <ListItemText>
                    <span
                      style={gameplayFontFamilies}
                      className={classes.entries}
                    >
                      {item}
                    </span>
                  </ListItemText>
                </ListItem>
                <Divider variant="middle" />
              </Fragment>
            ))}
          </Fragment>
        ))}
        <li ref={scrollRef} />
      </List>
    </div>
  );
}

History.propTypes = {
  game: PropTypes.object,
  players: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    game: state.meteorData.gameObject,
    players: state.meteorData.players,
  };
};

export default connect(mapStateToProps)(History);
