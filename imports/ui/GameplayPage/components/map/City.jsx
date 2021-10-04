import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import { Diseases } from '../../../../constants/diseases';
import { canvasStyle, CITY_Z_INDEX } from '../../../../constants/styles';

const citySize = 100 * (18 / canvasStyle.width);

const useStyles = makeStyles({
  city: ({ position, color, lit, outbreak }) => ({
    borderRadius: '50%',
    border: '1px solid white',
    height: 0,
    width: `${citySize}%`,
    paddingBottom: `${citySize}%`,
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -50%)',
    backgroundColor: Diseases[color].color,
    position: 'absolute',
    display: 'inline-block',
    boxShadow: lit
      ? '0px 0px 4px 3px #FFFFFF'
      : outbreak
        ? '0px 0px 5px 4px #FF9142'
        : '0px 0px 0px 0px #FFFFFF',
    '&:hover': {
      boxShadow: lit
        ? '0px 0px 2px 1px #FFFFFF'
        : outbreak
          ? '0px 0px 5px 4px #FF9142'
          : '0px 0px 0px 0px #FFFFFF', // Could also do this individually on disease
      cursor: lit ? 'pointer' : 'default',
    },
    zIndex: CITY_Z_INDEX,
  }),
  station: {
    width: '60%',
    bottom: '-1px',
    left: '-1px',
    position: 'absolute',
  },
  disease: ({ canvasDimensions }) => ({
    position: 'absolute',
    width: `${100 * (15 / canvasDimensions.width)}%`,
    height: `${100 * (15 / canvasDimensions.height)}%`,
    transform: 'translate(-50%, -50%)',
  }),
  markerContainer: ({ position }) => ({
    width: `${citySize + 1}%`,
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
    left: position.x,
    top: position.y,
  }),
  rotate: {
    width: '100%',
    paddingBottom: '100%',
    transformOrigin: 'center',
    animation: '$rotation 10s linear infinite',
  },
  marker: {
    width: '0',
    height: '0',
    borderLeft: '3px solid transparent',
    borderRight: '3px solid transparent',
    borderBottom: '12px solid white',
    opacity: '0.75',
    position: 'absolute',
    transformOrigin: 'center',
  },
  '@keyframes rotation': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
});

function City({
  name,
  position,
  color,
  canvasDimensions,
  city,
  hasResearchStation,
  diseaseCubes,
  playersOnCity,
  currentPlayerLocation,
}) {
  const onClick = () => {
    city.onClick(name);
  };

  const outbreakDanger = () => {
    for (let i = 0; i < diseaseCubes.length; i++) {
      if (diseaseCubes[i] === 3) {
        return true;
      }
    }
    return false;
  };

  const classes = useStyles({
    position,
    color,
    lit: city.lit,
    outbreak: outbreakDanger(),
    canvasDimensions,
  });

  const CUBE_DISTANCE = 1.4;

  const renderDiseaseCubes = () => {
    const startAngle = Math.PI;
    const endAngle = playersOnCity.length > 0 ? 2 * Math.PI : 3 * Math.PI;
    const flattenedCubes = diseaseCubes.reduce((arr, numCubes, color) => {
      for (let i = 0; i < numCubes; i++) {
        arr.push(color);
      }
      return arr;
    }, []);

    // When we don't use the full circle (since player is on the city),
    // we use one less division to signify that we want a disease cube
    // on the start and end point
    const numDivisions =
      playersOnCity.length > 0 && flattenedCubes.length > 1
        ? flattenedCubes.length - 1
        : flattenedCubes.length;

    const radiusX = CUBE_DISTANCE;
    const radiusY =
      (CUBE_DISTANCE * canvasDimensions.width) / canvasDimensions.height;

    return flattenedCubes.map((color, i) => {
      const angle = startAngle + (i * (endAngle - startAngle)) / numDivisions;
      const cubeStyle = {
        left: `${parseFloat(position.x) + Math.cos(angle) * radiusX}%`,
        top: `${parseFloat(position.y) - Math.sin(angle) * radiusY}%`,
      };
      return (
        <img
          key={city + i}
          src={Diseases[color].image}
          className={classes.disease}
          style={cubeStyle}
        />
      );
    });
  };

  const renderMarkers = () => {
    return (
      <div className={classes.markerContainer}>
        <div className={classes.rotate}>
          <span
            className={classes.marker}
            style={{
              left: '0%',
              top: '0%',
              transform: 'translate(-50%, -50%) rotate(135deg)',
            }}
          ></span>
          <span
            className={classes.marker}
            style={{
              right: '0%',
              top: '0%',
              transform: 'translate(50%, -50%) rotate(-135deg)',
            }}
          ></span>
          <span
            className={classes.marker}
            style={{
              left: '0%',
              bottom: '0%',
              transform: 'translate(-50%, 50%) rotate(45deg)',
            }}
          ></span>
          <span
            className={classes.marker}
            style={{
              right: '0%',
              bottom: '0%',
              transform: 'translate(50%, 50%) rotate(-45deg)',
            }}
          ></span>
        </div>
      </div>
    );
  };

  return (
    <>
      {currentPlayerLocation === name && renderMarkers()}
      <span onClick={onClick} className={classes.city}>
        {hasResearchStation && (
          <img src="/station.svg" className={classes.station} />
        )}
      </span>
      {renderDiseaseCubes()}
    </>
  );
}

City.propTypes = {
  name: PropTypes.string,
  position: PropTypes.shape({
    x: PropTypes.string.isRequired,
    y: PropTypes.string.isRequired,
  }).isRequired,
  color: PropTypes.number,
  canvasDimensions: PropTypes.object,
  city: PropTypes.object,
  hasResearchStation: PropTypes.bool,
  diseaseCubes: PropTypes.array,
  playersOnCity: PropTypes.array,
  currentPlayerLocation: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => {
  const city = ownProps.name;
  const {
    hasResearchStation,
    diseaseCubes,
  } = state.meteorData.gameObject.cityObjects[city];
  const playersOnCity = state.meteorData.players.filter(
    (p) => p.location === city
  );
  const currentPlayerLocation = state.meteorData.playerObject?.location || '';

  return {
    city: state.cities[city],
    hasResearchStation,
    diseaseCubes,
    playersOnCity,
    currentPlayerLocation,
  };
};

export default connect(mapStateToProps)(City);
