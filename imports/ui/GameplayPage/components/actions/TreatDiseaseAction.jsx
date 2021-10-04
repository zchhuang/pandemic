import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { Diseases } from '../../../../constants/diseases';
import Action from './Action';

const useStyles = makeStyles({
  diseases: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disease: {
    float: 'left',
    width: '75px',
  },
  selected: {
    borderRadius: '10px',
    border: '2px solid green',
    margin: 'auto',
  },
});

function TreatDiseaseAction({ actionsDisabled, playerId, colors }) {
  const [open, setOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(-1);
  const classes = useStyles();

  const treatDisease = (disease) => {
    handleDialogClose();
    Meteor.call('players.treatDisease', playerId, disease);
  };

  const handleDialogClose = () => {
    setSelectedDisease(-1);
    setOpen(false);
  };

  const renderDialogBody = () => {
    if (colors.length === 1) {
      setSelectedDisease(colors[0]);
    }

    return (
      <div className={classes.diseases}>
        {colors.map((disease) => (
          <div
            key={disease}
            className={selectedDisease === disease ? classes.selected : ''}
            onClick={() => setSelectedDisease(disease)}
          >
            <img className={classes.disease} src={Diseases[disease].image} />
          </div>
        ))}
      </div>
    );
  };

  const renderDialogActions = () => {
    return (
      <Button
        variant="contained"
        disabled={selectedDisease === -1}
        onClick={() => {
          treatDisease(selectedDisease);
        }}
      >
        Done
      </Button>
    );
  };

  return (
    <Action
      dialogTitle="Treat Disease"
      dialogText="Choose which of these vermins to treat."
      renderDialogBody={renderDialogBody}
      renderDialogActions={renderDialogActions}
      disabled={actionsDisabled || colors.length === 0}
      setOpen={setOpen}
      open={open}
      handleDialogClose={handleDialogClose}
      text="Treat Disease"
      buttonIcon="/actions/treat.svg"
    />
  );
}

TreatDiseaseAction.propTypes = {
  actionsDisabled: PropTypes.bool,
  colors: PropTypes.array,
  playerId: PropTypes.string,
  game: PropTypes.object,
};

const mapStateToProps = (state) => {
  const game = state.meteorData.gameObject;
  const player = state.meteorData.playerObject;
  const colors = game.cityObjects[player.location].diseaseCubes
    .map((count, i) => [count, i])
    .filter(({ [0]: count }) => count > 0)
    .map(([, i]) => i);

  return {
    playerId: player._id,
    colors: colors,
  };
};

export default connect(mapStateToProps)(TreatDiseaseAction);
