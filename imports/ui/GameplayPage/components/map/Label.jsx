import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  label: ({ position }) => ({
    fontFamily: 'Roboto Condensed',
    fontSize: '10px',
    letterSpacing: '0.15px',
    color: '#FFFFFF',
    textShadow: '0px 4px 4px rgba(0, 0, 0, 0.5)',
    left: position.x,
    top: position.y,
    textAlign: 'center',
    transform: 'translate(-50%, 0)',
    position: 'absolute',
    display: 'inline-block',
    cursor: 'default',
  }),
});

export default function Label({ position, name }) {
  const classes = useStyles({ position });
  return (
    <span
      className={classes.label}
      dominantBaseline="middle"
      textAnchor="middle"
    >
      {name.toUpperCase()}
    </span>
  );
}

Label.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.string.isRequired,
    y: PropTypes.string.isRequired,
  }),
  name: PropTypes.string.isRequired,
};
