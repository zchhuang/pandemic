import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Action from './Action';
import { Roles, RESEARCHER } from '../../../../constants/roles';
import CityCard from '../CityCard';

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

function ShareKnowledgeAction({ player, players, actionsDisabled }) {
  const [open, setOpen] = useState(false);
  const [selectedGiveOrTake, setSelectedGiveOrTake] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [dialogText, setDialogText] = useState('');
  const classes = useStyles();

  useEffect(() => {
    setSelectedGiveOrTake('');
    setSelectedPlayerId('');
    setSelectedCard('');
  }, [players]);

  var shareKnowledgeMap = {};

  const otherPlayersAtLocation = players.filter(
    (p) => p._id !== player._id && p.location === player.location
  );

  const otherPlayerThatHas = otherPlayersAtLocation.find((p) =>
    p.cityCards.includes(player.location)
  );

  const otherPlayerResearcher = otherPlayersAtLocation.find(
    (p) => p.role === RESEARCHER
  );

  const addToMap = (giveOrTake, playerId, city) => {
    if (!(giveOrTake in shareKnowledgeMap)) {
      shareKnowledgeMap[giveOrTake] = {};
    }
    if (!(playerId in shareKnowledgeMap[giveOrTake])) {
      shareKnowledgeMap[giveOrTake][playerId] = [];
    }
    shareKnowledgeMap[giveOrTake][playerId].push(city);
  };

  // add all data to the shareKnowledge map
  if (player.role === RESEARCHER) {
    otherPlayersAtLocation.forEach((otherPlayer) => {
      player.cityCards.forEach((city) => {
        addToMap('give', otherPlayer._id, city);
      });
    });
  } else if (otherPlayerResearcher) {
    otherPlayerResearcher.cityCards.forEach((city) => {
      addToMap('take', otherPlayerResearcher._id, city);
    });
  }
  if (otherPlayerThatHas) {
    if (otherPlayerThatHas !== otherPlayerResearcher) {
      addToMap('take', otherPlayerThatHas._id, player.location);
    }
  } else if (player.cityCards.includes(player.location)) {
    if (player.role !== RESEARCHER) {
      otherPlayersAtLocation.forEach((otherPlayer) => {
        addToMap('give', otherPlayer._id, player.location);
      });
    }
  }

  const shareKnowledgePossible = () => {
    return Object.keys(shareKnowledgeMap).length !== 0;
  };

  const shareKnowledge = (otherPlayerId, isGive, cityCard) => {
    const giverId = isGive ? player._id : otherPlayerId;
    const takerId = isGive ? otherPlayerId : player._id;
    Meteor.call('players.shareKnowledge', giverId, takerId, cityCard, isGive);
    handleDialogClose();
  };

  const renderGiveOrTakeChoice = () => {
    if (selectedGiveOrTake) {
      return;
    }
    if (Object.keys(shareKnowledgeMap).length === 1) {
      const giveOrTake = Object.keys(shareKnowledgeMap)[0];
      setSelectedGiveOrTake(giveOrTake);
      return;
    }

    setDialogText('Choose whether to give or take a card.');

    return (
      <>
        <Button
          variant="contained"
          onClick={() => setSelectedGiveOrTake('give')}
        >
          Give a card
        </Button>
        <Button
          variant="contained"
          onClick={() => setSelectedGiveOrTake('take')}
        >
          Take a card
        </Button>
      </>
    );
  };

  const renderOtherPlayerChoice = () => {
    if (
      selectedPlayerId ||
      !selectedGiveOrTake ||
      !(selectedGiveOrTake in shareKnowledgeMap)
    ) {
      return;
    }
    if (Object.keys(shareKnowledgeMap[selectedGiveOrTake]).length === 1) {
      const otherPlayer = Object.keys(shareKnowledgeMap[selectedGiveOrTake])[0];
      setSelectedPlayerId(otherPlayer);
      return;
    }

    if (selectedGiveOrTake === 'give') {
      setDialogText('Select which player you want to give a card to.');
    } else if (selectedGiveOrTake === 'take') {
      setDialogText('Select which player you want to take a card from.');
    }

    const playerOptions = Object.keys(shareKnowledgeMap[selectedGiveOrTake]);
    return (
      <div className={classes.players}>
        {playerOptions.map((playerId) => (
          <div
            key={playerId}
            className={selectedPlayerId === playerId ? classes.selected : ''}
            onClick={() => setSelectedPlayerId(playerId)}
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

  const renderCardChoice = () => {
    if (
      !selectedPlayerId ||
      !selectedGiveOrTake ||
      !(selectedGiveOrTake in shareKnowledgeMap) ||
      !(selectedPlayerId in shareKnowledgeMap[selectedGiveOrTake])
    ) {
      return;
    }
    if (shareKnowledgeMap[selectedGiveOrTake][selectedPlayerId].length === 1) {
      setSelectedCard(
        shareKnowledgeMap[selectedGiveOrTake][selectedPlayerId][0]
      );
    }

    const playerName = players.find((p) => p._id === selectedPlayerId).username;
    if (selectedGiveOrTake === 'give') {
      setDialogText(`Select which card you want to give to ${playerName}.`);
    } else if (selectedGiveOrTake === 'take') {
      setDialogText(`Select which card you want to take from ${playerName}.`);
    }

    const cardOptions = shareKnowledgeMap[selectedGiveOrTake][selectedPlayerId];
    return (
      <div className={classes.cards}>
        {cardOptions.map((city) => (
          <div
            key={city}
            className={selectedCard === city ? classes.selected : ''}
            onClick={() => setSelectedCard(city)}
          >
            <CityCard city={city} />
          </div>
        ))}
      </div>
    );
  };

  const renderDialogBody = () => {
    return (
      <>
        {renderGiveOrTakeChoice()}
        {renderOtherPlayerChoice()}
        {renderCardChoice()}
      </>
    );
  };

  const renderDialogActions = () => {
    return (
      <>
        {selectedGiveOrTake && selectedPlayerId && selectedCard && (
          <Button
            variant="contained"
            onClick={() => {
              shareKnowledge(
                selectedPlayerId,
                selectedGiveOrTake === 'give',
                selectedCard
              );
            }}
          >
            Done!
          </Button>
        )}
      </>
    );
  };

  const handleDialogClose = () => {
    setOpen(false);
    setSelectedGiveOrTake('');
    setSelectedPlayerId('');
    setSelectedCard('');
  };

  return (
    <Action
      dialogTitle="Share Cards"
      dialogText={dialogText}
      renderDialogBody={renderDialogBody}
      renderDialogActions={renderDialogActions}
      disabled={actionsDisabled || !shareKnowledgePossible()}
      setOpen={setOpen}
      open={open}
      text="Share Cards"
      handleDialogClose={handleDialogClose}
      buttonIcon="/actions/share.svg"
    />
  );
}

ShareKnowledgeAction.propTypes = {
  player: PropTypes.object,
  players: PropTypes.array,
  actionsDisabled: PropTypes.bool,
};

const mapStateToProps = (state) => {
  return {
    player: state.meteorData.playerObject,
    players: state.meteorData.players,
  };
};

export default connect(mapStateToProps)(ShareKnowledgeAction);
