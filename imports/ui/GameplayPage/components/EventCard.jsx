import React from 'react';
import PropTypes from 'prop-types';

import {
  ONE_QUIET_NIGHT,
  GOVERNMENT_GRANT,
  AIRLIFT,
  RESILIENT_POPULATION,
  FORECAST,
} from '../../../constants/cards';

import Airlift from './events/Airlift';
import Forecast from './events/Forecast';
import GovernmentGrant from './events/GovernmentGrant';
import OneQuietNight from './events/OneQuietNight';
import ResilientPopulation from './events/ResilientPopulation';

export default function EventCard({
  event,
  zIndex,
  inHand,
  size,
  selectionMode,
  toggleCardSelection,
  selected,
}) {
  const cardToComponent = {
    [AIRLIFT]: <Airlift zIndex={zIndex} inHand={inHand} size={size} />,
    [FORECAST]: <Forecast zIndex={zIndex} inHand={inHand} size={size} />,
    [GOVERNMENT_GRANT]: (
      <GovernmentGrant zIndex={zIndex} inHand={inHand} size={size} />
    ),
    [ONE_QUIET_NIGHT]: (
      <OneQuietNight zIndex={zIndex} inHand={inHand} size={size} />
    ),
    [RESILIENT_POPULATION]: (
      <ResilientPopulation zIndex={zIndex} inHand={inHand} size={size} />
    ),
  };

  const getCard = () => {
    return (
      <span>
        Event:
        <br />
        {event}
      </span>
    );
  };

  const renderSelectionMode = () => {
    return (
      <p>
        {getCard()}
        <input
          type="checkbox"
          onClick={() => {
            toggleCardSelection(event);
          }}
          checked={selected}
        ></input>
      </p>
    );
  };

  if (!selectionMode) {
    return cardToComponent[event];
  } else {
    return renderSelectionMode();
  }
}

EventCard.propTypes = {
  event: PropTypes.string,
  zIndex: PropTypes.number,
  inHand: PropTypes.bool,
  size: PropTypes.string,
  selectionMode: PropTypes.bool,
};
