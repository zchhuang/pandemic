import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Meteor } from 'meteor/meteor';

import {
  OPERATIONS_EXPERT,
  CONTINGENCY_PLANNER,
} from '../../../constants/roles';
import FlyAction from '../components/actions/FlyAction';
import DiscoverCureAction from '../components/actions/DiscoverCureAction';
import BuildStationAction from '../components/actions/BuildStationAction';
import TreatDiseaseAction from '../components/actions/TreatDiseaseAction';
import ShareKnowledgeAction from '../components/actions/ShareKnowledgeAction';
import OperationsExpertAction from '../components/actions/OperationsExpertAction';
import ContingencyPlannerAction from '../components/actions/ContingencyPlannerAction';
import {
  actionBarStyle,
  ACTIONS_BAR_Z_INDEX,
  canvasStyle,
} from '../../../constants/styles';
import Action from './actions/Action';

const useStyles = makeStyles(() => ({
  bar: {
    position: 'absolute',
    backgroundColor: '#343434',
    width: actionBarStyle.width,
    height: actionBarStyle.height,
    marginTop: '-.5%',
    zIndex: ACTIONS_BAR_Z_INDEX,
  },
  actions: {
    justifyContent: 'center',
    display: 'flex',
  },
  optioncol: {
    listStyleType: 'none',
  },
  colfirst: {
    marginBottom: '5%',
  },
  colend: {
    marginLeft: '50%',
  },
  endTurnButton: {
    marginTop: '2%',
    width: canvasStyle.height / 3,
    height: canvasStyle.height / 7,
    borderRadius: 16,
    whiteSpace: 'normal',
    fontFamily: 'Roboto Condensed',
  },
}));

function ActionsBar({ player, endTurnDisabled, actionsDisabled }) {
  const classes = useStyles();

  const endTurn = () => {
    // TODO: Delete players.endTurn and manually call from frontend
    Meteor.call('players.endTurn', player._id, (err) => {
      if (err) {
        alert(err);
      }
    });
  };

  const endTurnStyle =
    player.actionsLeft > 0
      ? { backgroundColor: 'white' }
      : { color: 'white', backgroundColor: 'red' };

  const renderEndTurn = () => {
    return (
      <span className={classes.endTurnBlock}>
        <Button
          disabled={endTurnDisabled}
          variant="contained"
          onClick={endTurn}
          style={endTurnStyle}
          className={classes.endTurnButton}
        >
          {/* have to use <br /> since <p> tags cause horizontal stacking */}
          End Turn
          <br />({player.actionsLeft} actions left)
        </Button>
      </span>
    );
  };

  const renderRoleButton = React.useCallback(() => {
    if (player.role === OPERATIONS_EXPERT)
      return <OperationsExpertAction actionsDisabled={actionsDisabled} />;
    if (player.role === CONTINGENCY_PLANNER)
      return <ContingencyPlannerAction actionsDisabled={actionsDisabled} />;
    const dummyFn = () => {};
    return (
      <Action
        disabled={true}
        text="No Role Action"
        buttonTooltip={`Role action unavailable for ${player.role}`}
        renderDialogActions={dummyFn}
        renderDialogBody={dummyFn}
      />
    );
  }, [player.role, actionsDisabled]);

  return (
    <div className={classes.bar}>
      <div className={classes.actions}>
        <ul className={classes.optioncol}>
          <li className={classes.colfirst}>
            <FlyAction actionsDisabled={actionsDisabled} />{' '}
          </li>
          <li>
            <DiscoverCureAction actionsDisabled={actionsDisabled} />{' '}
          </li>
        </ul>
        <ul className={classes.optioncol}>
          <li className={classes.colfirst}>
            <ShareKnowledgeAction actionsDisabled={actionsDisabled} />{' '}
          </li>
          <li>
            <TreatDiseaseAction actionsDisabled={actionsDisabled} />{' '}
          </li>
        </ul>
        <ul className={classes.optioncol}>
          <li className={classes.colfirst}>
            {' '}
            <BuildStationAction actionsDisabled={actionsDisabled} />
          </li>
          <li>{renderRoleButton()}</li>
        </ul>
        <ul className={classes.optioncol}>
          <li className={classes.colend}> {renderEndTurn()} </li>
        </ul>
      </div>
    </div>
  );
}

ActionsBar.propTypes = {
  player: PropTypes.object,
  endTurnDisabled: PropTypes.bool,
  actionsDisabled: PropTypes.bool,
};

const mapStateToProps = (state) => {
  return {
    player: state.meteorData.playerObject,
  };
};

export default connect(mapStateToProps)(ActionsBar);
