import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Dialog, DialogContent } from '@material-ui/core';

import {
  EventCards,
  SMALL,
  REGULAR,
  sizeToCardSizeRatio,
} from '../../../../constants/cards';
import { getCardStyle } from '../../../../constants/styles';

const fontColor = '#0F0F0F';

const useStyles = makeStyles({
  ...getCardStyle(),
  topbar: {
    borderRadius: '5px 5px 0px 0px',
  },
  drawing: {
    margin: '5%',
    width: '80%',
    display: 'flex',
    justifyContent: 'center',
  },
  text: {
    display: 'block',
    padding: '0px 12px 0px 12px',
    fontSize: '14px',
    fontFamily: 'Roboto Condensed',
    fontStyle: 'normal',
    lineHeight: '18px',
    letterSpacing: '0.05px',
    wordWrap: 'break-word',
    color: fontColor,
  },
});

function Event({
  event,
  zIndex,
  inHand,
  size,
  handleEvent,
  playerId,
  discardCard,
}) {
  const [openExpandedView, setOpenExpandedView] = useState(false);
  const classes = useStyles({
    size,
    zIndex,
    inHand: inHand && !openExpandedView,
    fontColor,
  });

  const handleCardClick = () => {
    if (inHand) {
      setOpenExpandedView(true);
    }
  };

  const getCard = () => {
    return (
      <div className={classes.card} onClick={handleCardClick}>
        <img
          className={classes.topbar}
          src="/eventTopbar.svg"
          // TODO: Fix this styling
          style={{
            width: `${sizeToCardSizeRatio[size] * 148}px`,
            height: '16px',
          }}
        />
        <span className={classes.name}>
          {EventCards[event].name.toUpperCase()}
        </span>
        {size !== SMALL && (
          <>
            <div className={classes.drawing}>
              <img src="/eventDrawing.svg" />
            </div>
            <span className={classes.text}>{EventCards[event].text}</span>
          </>
        )}
      </div>
    );
  };

  const handleDialogClose = () => {
    setOpenExpandedView(false);
  };

  const playEvent = () => {
    handleDialogClose();
    handleEvent();
  };

  const submitDiscard = () => {
    handleDialogClose();
    Meteor.call('players.discardPlayerCard', playerId, event);
  };

  return (
    <>
      {getCard()}
      <Dialog
        open={openExpandedView}
        onClose={handleDialogClose}
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <DialogContent>{getCard()}</DialogContent>
        {inHand && (
          <Button variant="contained" onClick={playEvent}>
            Play
          </Button>
        )}
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

Event.defaultProps = {
  size: REGULAR,
};

Event.propTypes = {
  event: PropTypes.string,
  zIndex: PropTypes.number,
  inHand: PropTypes.bool,
  size: PropTypes.string,
  handleEvent: PropTypes.func,
  playerId: PropTypes.string,
  discardCard: PropTypes.bool,
};

const mapStateToProps = (state) => {
  return {
    playerId: state.meteorData.playerObject?._id,
    discardCard: state.discardCard,
  };
};

export default connect(mapStateToProps)(Event);
