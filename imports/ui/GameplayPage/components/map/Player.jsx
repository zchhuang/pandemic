import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { VelocityComponent } from 'velocity-react';
import { makeStyles } from '@material-ui/core/styles';
import { canvasStyle, PLAYER_Z_INDEX } from '../../../../constants/styles';

// Params for adjusting size and speed
const ICON_WIDTH = 100 * (36 / canvasStyle.width);
const ICON_HEIGHT = 100 * (40 / canvasStyle.height);

const center = (position, offset) => ({
  x: `${
    parseFloat(position.x) + ((offset - ICON_WIDTH / 2) * ICON_WIDTH) / 2
  }%`,
  y: `${parseFloat(position.y) - ICON_HEIGHT}%`,
});

const SPEED = 20;

const distance = (position1, position2) => {
  const { x: x1, y: y1 } = position1;
  const { x: x2, y: y2 } = position2;
  return Math.sqrt(
    (parseFloat(x1) - parseFloat(x2)) ** 2 +
      (parseFloat(y1) - parseFloat(y2)) ** 2
  );
};

const useStyles = makeStyles({
  player: {
    width: `${ICON_WIDTH}%`,
    height: `${ICON_HEIGHT}%`,
    position: 'absolute',
    willChange: 'transform',
    zIndex: PLAYER_Z_INDEX,
  },
});

export default function Player({ position, roleInfo, offset }) {
  const [lastPosition, setLastPosition] = useState(center(position, offset));
  const [animationDuration, setAnimationDuration] = useState(0);
  const currentPosition = center(position, offset);

  const classes = useStyles();

  useEffect(() => {
    setAnimationDuration(
      1000 * (distance(currentPosition, lastPosition) / SPEED)
    );
    setLastPosition(currentPosition);
  }, [position]);

  const animation = {
    translateX: `${100 * (parseFloat(currentPosition.x) / ICON_WIDTH)}%`,
    translateY: `${100 * (parseFloat(currentPosition.y) / ICON_HEIGHT)}%`,
  };

  return (
    <VelocityComponent
      animation={animation}
      interruptBehavior="finish"
      duration={animationDuration}
    >
      <img src={roleInfo?.icon} className={classes.player} />
    </VelocityComponent>
  );
}

Player.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.string.isRequired,
    y: PropTypes.string.isRequired,
  }).isRequired,
  roleInfo: PropTypes.object.isRequired,
  offset: PropTypes.number.isRequired,
};
