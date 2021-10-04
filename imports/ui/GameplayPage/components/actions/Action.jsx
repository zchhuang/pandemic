import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';

import { canvasStyle } from '../../../../constants/styles';
import DialogModal from '../DialogModal';

const useStyles = makeStyles(() => ({
  button: {
    width: canvasStyle.height / 3,
    height: canvasStyle.height / 14,
    // So that button stays white when disabled
    background: 'white !important',
    borderRadius: 8,
  },
  icon: {
    marginTop: 8,
    flexGrow: 1,
  },
  text: {
    flexGrow: 3,
    fontFamily: 'Roboto Condensed',
  },
}));

export default function Action({
  dialogTitle,
  dialogText,
  renderDialogBody,
  renderDialogActions,
  disabled,
  setOpen,
  text,
  buttonTooltip,
  open,
  handleDialogClose,
  buttonIcon,
}) {
  const classes = useStyles();

  const renderButtonIcon = () => {
    return (
      buttonIcon && (
        <div className={classes.icon}> {<img src={buttonIcon} />} </div>
      )
    );
  };
  const button = (
    <span className={classes.block}>
      <Button
        className={classes.button}
        variant="contained"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {renderButtonIcon()}
        <div className={classes.text}> {text} </div>
      </Button>
    </span>
  );

  return (
    <>
      {buttonTooltip?.length ? (
        <Tooltip title={buttonTooltip} arrow>
          {button}
        </Tooltip>
      ) : (
        button
      )}
      <DialogModal
        open={open}
        dialogTitle={dialogTitle}
        dialogText={dialogText}
        renderDialogBody={renderDialogBody}
        renderDialogActions={renderDialogActions}
        handleDialogClose={handleDialogClose}
      />
    </>
  );
}

Action.defaultProps = {
  dialogTitle: '',
  dialogText: '',
};

Action.propTypes = {
  dialogTitle: PropTypes.string,
  dialogText: PropTypes.string,
  renderDialogBody: PropTypes.func,
  renderDialogActions: PropTypes.func,
  disabled: PropTypes.bool,
  setOpen: PropTypes.func,
  buttonTooltip: PropTypes.string,
  text: PropTypes.string,
  open: PropTypes.bool,
  handleDialogClose: PropTypes.func,
  buttonIcon: PropTypes.string.required,
};
