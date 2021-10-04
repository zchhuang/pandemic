import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
      bounds="parent"
    >
      <Paper {...props} />
    </Draggable>
  );
}

export default function DialogModal({
  open,
  dialogTitle,
  dialogText,
  renderDialogBody,
  handleDialogClose,
  renderDialogActions,
  DialogProps,
  preventExit,
}) {
  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      PaperProps={{
        style: {
          backgroundColor: '#343434',
        },
      }}
      PaperComponent={PaperComponent}
      transitionDuration={0}
      disableBackdropClick={preventExit}
      {...DialogProps}
    >
      <DialogTitle
        style={{ color: '#F0F0F0', cursor: 'grab' }}
        id="draggable-dialog-title"
      >
        <span style={{ display: 'flex', justifyContent: 'space-between' }}>
          {dialogTitle}
          <img draggable={false} src="/draggable_icon.svg" />
        </span>
      </DialogTitle>
      <DialogContent>
        <DialogContentText style={{ color: '#F0F0F0' }}>
          {dialogText}
        </DialogContentText>
        {renderDialogBody()}
      </DialogContent>
      <DialogActions>
        {renderDialogActions()}
        {!preventExit && (
          <Button variant="contained" onClick={handleDialogClose}>
            Exit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

DialogModal.propTypes = {
  open: PropTypes.bool,
  dialogTitle: PropTypes.string,
  dialogText: PropTypes.string,
  renderDialogBody: PropTypes.func,
  renderDialogActions: PropTypes.func,
  handleDialogClose: PropTypes.func,
  DialogProps: PropTypes.object,
  preventExit: PropTypes.bool,
};
