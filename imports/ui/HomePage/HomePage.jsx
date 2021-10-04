import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { Meteor } from 'meteor/meteor';
import Button from '@material-ui/core/Button';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import './HomePage.css';

const theme = createMuiTheme({
  typography: {
    fontFamily: ['Lato'].join(','),
  },
  overrides: {
    MuiButton: {
      root: {
        backgroundColor: '#c4c4c4',
        margin: '3px',
        '&:hover': {
          backgroundColor: 'white',
        },
      },
    },
  },
});

export default function HomePage() {
  const [gameId, setGameId] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
    Meteor.call('games.create', (err, result) => {
      if (err) {
        alert(err);
      }
      setGameId(result);
    });
  };
  if (gameId) {
    return <Redirect to={`/game/${gameId}`} />;
  }

  return (
    <MuiThemeProvider theme={theme}>
      <div className="home-background">
        <div className="home-info">
          <div className="home-title">
            <h2>PANDEMIC</h2>
            <p> Welcome to our award winning game!</p>
          </div>
          <div className="home-homeoptions">
            <div className="home-inner">
              <Button
                className="home-buttons"
                id="home-createGame"
                variant="outlined"
                onClick={handleSubmit}
              >
                Create Game
              </Button>
              <div className="home-space"> </div>
              <Button
                className="home-buttons"
                id="home-howTo"
                variant="outlined"
              >
                How to Play
              </Button>
            </div>
          </div>
        </div>
        <div className="home-sizeWarning">
          <p>Pandemic is best played on larger screens.</p>
        </div>
      </div>
    </MuiThemeProvider>
  );
}
