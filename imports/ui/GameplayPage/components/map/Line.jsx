import React from 'react';
import PropTypes from 'prop-types';
import {
  Positions,
  onWestBorder,
  onEastBorder,
} from '../../../../constants/positions';

const add = (a, b) => `${parseFloat(a) + parseFloat(b)}%`;

const midpoint = (a, b) => `${(parseFloat(a) + parseFloat(b)) / 2}%`;

export default function Line({ city, otherCity }) {
  const from = Positions[city].cityPosition;
  const to = Positions[otherCity].cityPosition;

  const mid = {
    x: midpoint(from.x, to.x),
    y: midpoint(from.y, to.y),
  };

  // Special cases for when we're crossing the pacific ocean
  if (onWestBorder(city) && onEastBorder(otherCity)) {
    mid.x = add(to.x, '-100%');
    mid.y = to.y;
  } else if (onEastBorder(city) && onWestBorder(otherCity)) {
    mid.x = add(to.x, '100%');
    mid.y = to.y;
  }

  const lineStyle = {
    strokeWidth: '2px',
    stroke: 'rgba(255, 255, 255, 0.5)',
    position: 'absolute',
  };
  return (
    <line x1={from.x} y1={from.y} x2={mid.x} y2={mid.y} style={lineStyle} />
  );
}

Line.propTypes = {
  city: PropTypes.string,
  otherCity: PropTypes.string,
};
