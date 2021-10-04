import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Button from '@material-ui/core/Button';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import {
  unhighlightAllCities,
  resetCityOnclick,
  startAction,
  endAction,
} from '../../../redux/actions';
import { FORECAST, REGULAR } from '../../../../constants/cards';
import CityCard from '../CityCard';
import Event from './Event';
import DialogModal from '../DialogModal';

// Because our surrounding react-draggable has `transform: translate` CSS,
// forcibly altering the locations of our `position: fixed` `Draggable`s,
// we must reparent the child cards under a portal when being dragged
const portal = document.createElement('div');
portal.classList.add('draggable-card-portal');
if (!document.body) {
  throw new Error('body not ready for portal creation!');
}
document.body.appendChild(portal);

const Cards = React.memo(function Cards({ cardOrder }) {
  return cardOrder.map((card, index) => (
    <Draggable key={card} draggableId={card} index={index}>
      {(provided, snapshot) => {
        const child = (
          <div
            key={card}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <CityCard city={card} />
          </div>
        );

        // When dragging, place in portal
        if (snapshot.isDragging) {
          return ReactDOM.createPortal(child, portal);
        }

        // Otherwise, return regular div
        return child;
      }}
    </Draggable>
  ));
});

Cards.propTypes = {
  cardOrder: PropTypes.array,
};

function Forecast({
  zIndex,
  inHand,
  size,
  game,
  playerId,
  unhighlightAllCities,
  resetCityOnclick,
  startAction,
  endAction,
}) {
  const [open, setOpen] = useState(false);
  const [cardOrder, setCardOrder] = useState([]);

  const forecastLook = () => {
    startAction();
    unhighlightAllCities();
    resetCityOnclick();
    Meteor.call('games.forecastLook', game._id, (err, result) => {
      if (err) {
        alert(err);
      }
      setCardOrder(result);
      setOpen(true);
    });
  };

  const forecastRearrange = () => {
    setOpen(false);
    Meteor.call('players.playEvent', playerId, FORECAST, {
      cityCards: cardOrder,
    });
    endAction();
  };

  const onDragEnd = (result) => {
    if (
      result.destination &&
      result.destination.index !== result.source.index
    ) {
      const newOrder = Array.from(cardOrder);
      const [removed] = newOrder.splice(result.source.index, 1);
      newOrder.splice(result.destination.index, 0, removed);

      setCardOrder(newOrder);
    }
  };

  const renderDialogBody = () => {
    return (
      <>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="list" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Cards cardOrder={cardOrder} />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </>
    );
  };

  const renderDialogActions = () => {
    return (
      <Button variant="contained" onClick={forecastRearrange}>
        Done
      </Button>
    );
  };

  return (
    <>
      <Event
        event={FORECAST}
        handleEvent={forecastLook}
        zIndex={zIndex}
        inHand={inHand}
        size={size}
      />
      <DialogModal
        open={open}
        dialogTitle="Event: Forecast"
        dialogText="Rearrange the top 6 cards of the infection deck."
        renderDialogBody={renderDialogBody}
        handleDialogClose={() => setOpen(false)}
        renderDialogActions={renderDialogActions}
        DialogProps={{ maxWidth: 'lg' }}
        preventExit
      />
    </>
  );
}

Forecast.defaultProps = {
  size: REGULAR,
};

Forecast.propTypes = {
  zIndex: PropTypes.number,
  inHand: PropTypes.bool,
  size: PropTypes.string,
  playerId: PropTypes.string,
  game: PropTypes.object,
  unhighlightAllCities: PropTypes.func,
  resetCityOnclick: PropTypes.func,
  startAction: PropTypes.func,
  endAction: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    playerId: state.meteorData.playerObject?._id,
    game: state.meteorData.gameObject,
  };
};

export default connect(mapStateToProps, {
  unhighlightAllCities,
  resetCityOnclick,
  startAction,
  endAction,
})(Forecast);
