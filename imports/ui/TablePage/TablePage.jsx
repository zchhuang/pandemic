import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import Button from '@material-ui/core/Button';
import { SMALL } from '../../constants/cards';

import '../HomePage/HomePage.css';

const MAX_TOKEN_AGE = 3000000;

const theme = createMuiTheme({
  typography: {
    fontFamily: ['Lato'].join(','),
  },
  overrides: {
    MuiButton: {
      root: {
        backgroundColor: '#c4c4c4',
        '&:hover': {
          backgroundColor: 'white',
        },
      },
    },
  },
});

const noHoverTheme = createMuiTheme({
  typography: {
    fontFamily: ['Lato'].join(','),
  },
  overrides: {
    MuiButton: {
      root: {
        backgroundColor: '#c4c4c4',
        margin: '3px',
        '&:hover': {
          backgroundColor: 'c4c4c4',
        },
      },
    },
  },
});

function TablePage({ players, game, cookies, setCookie, removeCookie }) {
  const [username, setUsername] = useState('');
  const [isStartGameLoading, setIsStartGameLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const usernameList = players.map((player) => player.username);

  const getPlayerIdFromCookie = () => {
    return cookies[game._id];
  };

  const playerId = getPlayerIdFromCookie();
  const isPlayer = !!playerId;

  // Between 1 and 16 characters, alphanumeric, and doesn't match any other player usernames
  const validUsername =
    username.length >= 1 &&
    username.length <= 16 &&
    username.match('^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$') &&
    !usernameList.includes(username);

  const addPlayer = (event) => {
    event.preventDefault();
    if (validUsername) {
      setSubmitted(true);
      Meteor.call('players.create', username, game._id, (err, result) => {
        if (err) {
          alert(err);
        }
        setCookie(game._id, result, {
          path: '/',
          maxAge: MAX_TOKEN_AGE,
          sameSite: 'strict',
        });
      });
    }
  };

  useEffect(() => {
    if (isPlayer) {
      Meteor.call('players.join', playerId);
    }
    window.addEventListener('beforeunload', leaveGameAndRemoveCookie);
    return () => {
      window.removeEventListener('beforeunload', leaveGameAndRemoveCookie);
    };
  }, []);

  const leaveGameAndRemoveCookie = () => {
    removeCookie(game._id, { path: '/' });
    Meteor.call('players.remove', playerId);
  };

  const toggleReady = () => {
    Meteor.call('players.toggleReady', playerId);
  };

  const copyLink = () => {
    var linkText = document.getElementById('home-linkText');
    linkText.select();
    document.execCommand('copy');
  };

  const startCondition = () => {
    return (
      players.every((p) => p.isReady) &&
      players.length >= 2 &&
      players.length <= 4
    );
  };

  const startGame = () => {
    if (startCondition()) {
      setIsStartGameLoading(true);
      Meteor.call(
        'games.initialize',
        game._id,
        players.map((p) => p._id),
        (err) => {
          if (err) {
            alert(err);
            return;
          }
          setIsStartGameLoading(false);
        }
      );
    }
  };

  const renderPlayersList = () => {
    let playerUsernames = [];
    playerUsernames.push(<li className="home-listTitle">Player Name</li>);

    players.forEach((player) => {
      const playerText = player.username;
      playerUsernames.push(
        <li key={player._id}>
          {player._id === playerId ? (
            <mark>&nbsp;{playerText}&nbsp;</mark>
          ) : (
            playerText
          )}
        </li>
      );
    });
    playerUsernames.push(<li className="home-listTitle">Ready</li>);
    players.forEach((player) => {
      const playerCheck = player.isReady ? ' \u2713' : ' \u2717';
      playerUsernames.push(<li>{playerCheck}</li>);
    });

    return (
      <div>
        <h2>Players</h2>
        <ul id="home-actualList">{playerUsernames}</ul>
      </div>
    );
  };

  // TODO: replace this generic error with the username criteria
  const renderPlayerCreation = () => {
    return (
      <div className="home-constrained home-eliminateSpace">
        <div className="home-options">
          <h2 className="home-spacingAbove"> Enter Username </h2>
          <form onSubmit={addPlayer}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button
              variant="outlined"
              id="home-joinButtton"
              size={SMALL}
              className="home-buttons"
              type="submit"
            >
              Join
            </Button>
          </form>
          {!submitted && username && !validUsername && (
            <p className="home-invalid">Invalid username!</p>
          )}
        </div>
      </div>
    );
  };

  const renderCopyLink = () => {
    return (
      <div>
        <h2>Invite your friends!</h2>
        <input
          id="home-linkText"
          type="text"
          value={window.location.href}
          readOnly
        />
        <Button
          id="home-copyButton"
          className="home-buttons"
          variant="outlined"
          size="medium"
          onClick={copyLink}
        >
          Copy
        </Button>
      </div>
    );
  };

  const renderDifficultySetting = () => {
    return (
      <div className="home-difficulty">
        <h2>Difficulty</h2>
        {[4, 5, 6].map((num) => (
          <div key={num}>
            <Button
              id={num}
              className={
                game.numEpidemics === num
                  ? 'home-highlighted home-epidemics'
                  : 'home-epidemics'
              }
              value={num}
              variant="outlined"
              onClick={() => activateButton(num)}
            >
              <b>
                {num === 4 ? 'Easy' : ''}
                {num === 5 ? 'Medium' : ''}
                {num === 6 ? 'Hard' : ''}
              </b>{' '}
              : {num} Epidemic Cards
            </Button>
          </div>
        ))}
        <div className="home-smallSpace" />
      </div>
    );
  };

  const activateButton = (num) => {
    Meteor.call('games.setNumEpidemics', game._id, num);
  };

  const readyLeaveButtons = () => {
    // Find our player in the list
    const player = players.filter((p) => p._id === playerId)?.[0];

    return (
      <div className="home-options">
        <div className="home-spacingAbove home-spacingBelow">
          {isPlayer && (
            <Button
              variant="outlined"
              className="home-buttons home-readyLeaveButtons"
              id="home-ready"
              onClick={toggleReady}
              style={{
                backgroundColor: player?.isReady ? '#67D733' : '#c4c4c4',
              }}
            >
              Ready
            </Button>
          )}

          <div className="home-divider" />
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              className="home-buttons home-readyLeaveButtons"
              onClick={leaveGameAndRemoveCookie}
            >
              Leave
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  const renderTableOptions = () => {
    return (
      <div>
        <div className="home-constrained">
          <div className="home-options">{renderDifficultySetting()}</div>
        </div>
        <div className="home-space" />
        <div className="home-constrained">{readyLeaveButtons()}</div>
      </div>
    );
  };

  return (
    <>
      <MuiThemeProvider theme={theme}>
        <div className="home-background">
          <div id="home-split" className="home-info">
            <div id="home-infoContainer">
              <div className="home-title">
                <h2>PANDEMIC</h2>
                <p> Game Lobby</p>
              </div>
              <div className="home-display">
                <div id="home-table">
                  <MuiThemeProvider theme={noHoverTheme}>
                    {!isPlayer && renderPlayerCreation()}
                    {isPlayer && renderTableOptions()}
                  </MuiThemeProvider>
                </div>
                <div id="home-playerList">
                  <div className="home-players">{renderPlayersList()}</div>
                </div>
              </div>
              <div>
                <div id="home-startGame">
                  {startCondition() && (
                    <Button
                      variant="outlined"
                      className="home-buttons"
                      onClick={startGame}
                    >
                      {isStartGameLoading ? <CircularProgress /> : 'Start Game'}
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <div>{renderCopyLink()}</div>
              </div>
            </div>
          </div>
          {/* <div className="home-info">
            <div className="home-link">{renderCopyLink()}</div>
          </div> */}
          <div className="home-sizeWarning">
            <p>Pandemic is best played on larger screens.</p>
          </div>
        </div>
      </MuiThemeProvider>
    </>
  );
}

TablePage.propTypes = {
  players: PropTypes.array,
  game: PropTypes.object,
  player: PropTypes.object,
  cookies: PropTypes.object,
  setCookie: PropTypes.func,
  removeCookie: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    game: state.meteorData.gameObject,
    players: state.meteorData.players,
    player: state.meteorData.playerObject,
  };
};

export default connect(mapStateToProps)(TablePage);
