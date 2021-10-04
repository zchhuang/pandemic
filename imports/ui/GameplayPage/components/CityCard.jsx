import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import { Dialog, DialogContent } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import { CityCards, REGULAR, SMALL } from '../../../constants/cards';
import { getCardStyle } from '../../../constants/styles';
import { Diseases } from '../../../constants/diseases';

const useStyles = makeStyles({
  ...getCardStyle(),
  population: {
    display: 'block',
    position: 'relative',
    left: '6px',
    top: '14px',
    fontSize: '12px',
    fontFamily: 'Roboto Condensed',
    fontStyle: 'normal',
    fontWeight: 'bold',
    lineHeight: '24px',
    letterSpacing: '0.05px',
    color: '#F0F0F0',
  },
  drawing: {
    overflow: 'hidden',
    position: 'relative',
    bottom: '-10%',
    left: '-1%',
  },
});

function CityCard({ city, zIndex, inHand, size, playerId, discardCard }) {
  const [open, setOpen] = useState(false);
  const topStyle = size === SMALL ? '8px' : '14px';
  const fontWeightStyle = size === SMALL ? 'normal' : 'bold';
  const classes = useStyles({
    size,
    zIndex,
    color: Diseases[CityCards[city].color].color,
    inHand: inHand && !open,
    fontColor: '#F0F0F0',
    fontWeight: fontWeightStyle,
    top: topStyle,
  });

  const handleCardClick = () => {
    if (inHand) {
      setOpen(true);
    }
  };
  const getCard = () => {
    return (
      <div className={classes.card} onClick={handleCardClick}>
        <span className={classes.name}>
          {CityCards[city].name.toUpperCase()}
        </span>
        {size !== SMALL && (
          <>
            <span className={classes.population}>
              pop:{' '}
              {CityCards[city].population
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </span>
            <div className={classes.drawing}>
              <img src="/cityDrawing.svg" />
            </div>
          </>
        )}
      </div>
    );
  };

  const submitDiscard = () => {
    handleDialogClose();
    Meteor.call('players.discardPlayerCard', playerId, city);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  return (
    <>
      {getCard()}
      <Dialog
        open={open}
        onClose={handleDialogClose}
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <DialogContent>{getCard()}</DialogContent>
        {discardCard && (
          <Button variant="contained" onClick={submitDiscard}>
            Discard
          </Button>
        )}
        <Button variant="contained" onClick={handleDialogClose}>
          Exit
        </Button>
      </Dialog>
    </>
  );
}

CityCard.defaultProps = {
  size: REGULAR,
  inHand: false,
};

CityCard.propTypes = {
  city: PropTypes.string,
  zIndex: PropTypes.number,
  inHand: PropTypes.bool,
  size: PropTypes.string,
  playerId: PropTypes.string,
  discardCard: PropTypes.bool,
};

const mapStateToProps = (state) => {
  return {
    playerId: state.meteorData.playerObject?._id,
    discardCard: state.discardCard,
  };
};

export default connect(mapStateToProps)(CityCard);
