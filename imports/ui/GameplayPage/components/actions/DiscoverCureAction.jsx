import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { CityCards } from '../../../../constants/cards';
import { BLACK, RED, BLUE, YELLOW } from '../../../../constants/diseases';
import { UNCURED } from '../../../../constants/status';
import { SCIENTIST } from '../../../../constants/roles';

import Action from './Action';
import CityCard from '../CityCard';

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

function DiscoverCureAction({
  player,
  actionsDisabled,
  diseaseStatus,
  hasResearchStation,
}) {
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const cardsByColor = { [BLACK]: [], [RED]: [], [BLUE]: [], [YELLOW]: [] };

  player.cityCards.forEach((card) =>
    cardsByColor[CityCards[card].color].push(card)
  );

  let cardsRequired = player.role === SCIENTIST ? 4 : 5;
  const cureCards = Object.entries(cardsByColor).reduce(
    (total, [color, cards]) => {
      return total.concat(
        cards.length >= cardsRequired && diseaseStatus[color] === UNCURED
          ? cards
          : []
      );
    },
    []
  );

  const toggleCardSelection = (city) => {
    if (selectedCards.has(city)) {
      selectedCards.delete(city);
      setSelectedCards(new Set(selectedCards));
    } else {
      setSelectedCards(new Set(selectedCards.add(city)));
    }
  };

  const validateSelectedCards = () => {
    if (selectedCards.size !== (player.role === SCIENTIST ? 4 : 5)) {
      return false;
    }

    const selectedCardsArray = Array.from(selectedCards);

    let disease = CityCards[selectedCardsArray[0]].color;

    return selectedCardsArray.every(
      (card) => CityCards[card].color === disease
    );
  };

  const renderCureButton = () => {
    return (
      <Button variant="contained" onClick={cureDisease}>
        Cure!
      </Button>
    );
  };

  const renderDialogBody = () => {
    if (
      cureCards.length === cardsRequired &&
      selectedCards.size !== cardsRequired
    ) {
      setSelectedCards(new Set(cureCards));
    }

    return (
      <div className={classes.cards}>
        {cureCards.map((city) => (
          <div
            key={city}
            className={selectedCards.has(city) ? classes.selected : ''}
            onClick={() => toggleCardSelection(city)}
          >
            <CityCard city={city} />
          </div>
        ))}
      </div>
    );
  };

  const renderDialogActions = () => {
    return validateSelectedCards() && renderCureButton();
  };

  const cureDisease = () => {
    handleDialogClose();
    setSelectedCards(new Set());
    Meteor.call(
      'players.discoverCure',
      player._id,
      Array.from(selectedCards),
      (err) => {
        if (err) {
          alert(err);
        }
      }
    );
  };

  const handleDialogClose = () => {
    setOpen(false);
    setSelectedCards(new Set());
  };

  return (
    <Action
      dialogTitle="Cure!"
      dialogText={`Select ${cardsRequired} cards to discard to cure a disease`}
      renderDialogBody={renderDialogBody}
      renderDialogActions={renderDialogActions}
      disabled={
        actionsDisabled || !hasResearchStation || cureCards.length === 0
      }
      setOpen={setOpen}
      buttonText="Cure Disease"
      text="Cure Disease"
      open={open}
      handleDialogClose={handleDialogClose}
      buttonIcon="/actions/cure.svg"
    />
  );
}

DiscoverCureAction.propTypes = {
  player: PropTypes.object,
  actionsDisabled: PropTypes.bool,
  diseaseStatus: PropTypes.array,
  hasResearchStation: PropTypes.bool,
};

const mapStateToProps = (state) => {
  const game = state.meteorData.gameObject;
  const player = state.meteorData.playerObject;
  const { hasResearchStation } = game.cityObjects[player.location];

  return {
    player: state.meteorData.playerObject,
    diseaseStatus: game.diseaseStatus,
    hasResearchStation: hasResearchStation,
  };
};

export default connect(mapStateToProps)(DiscoverCureAction);
