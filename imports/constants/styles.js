import { makeStyles } from '@material-ui/core/styles';
import { sizeToCardSizeRatio, sizeToFontSizeRatio } from './cards';

export function getDialogStyle() {
  const top = 50;
  const left = 50;
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

export const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

// All cards
export const getCardStyle = () => ({
  card: ({ size, zIndex, color, inHand }) => ({
    whiteSpace: 'normal',
    position: 'relative',
    borderRadius: '10px',
    border: `4px solid white`,
    height: `${sizeToCardSizeRatio[size] * regularCardStyle.height}px`,
    width: `${sizeToCardSizeRatio[size] * regularCardStyle.width}px`,
    background: color || '#EEEEEE',
    boxSizing: 'border-box',
    zIndex: zIndex,
    '&:hover': {
      transform: inHand ? 'translate(0, -20%)' : 'translate(0, 0)',
    },
  }),
  name: ({ size, fontColor, fontWeight, top }) => ({
    display: 'block',
    position: 'relative',
    left: '3px',
    marginRight: 3,
    top,
    fontSize: `${sizeToFontSizeRatio[size] * 18}px`,
    fontFamily: 'Roboto Condensed',
    fontStyle: 'normal',
    fontWeight,
    lineHeight: '24px',
    letterSpacing: '0.05px',
    color: fontColor,
    wordBreak: 'break-word',
  }),
});

export const regularCardStyle = {
  width: 156,
  height: 215,
};

// this is the dimension of the larger canvas housing the map
export const canvasStyle = {
  width: 1100,
  height: 660,
};

export const actionBarStyle = {
  width: canvasStyle.width * 1.25,
  height: (canvasStyle.width * 1.25) / 9.2,
};

export const topBarHeight = 64;
export const cardOverlap = regularCardStyle.height / 2.7;

// z-indices
export const CITY_Z_INDEX = 2;
export const PLAYER_Z_INDEX = CITY_Z_INDEX + 1;
export const MAP_DISCARD_OVERLAY_Z_INDEX = PLAYER_Z_INDEX + 1;
export const PLAYER_CARD_START_Z_INDEX = MAP_DISCARD_OVERLAY_Z_INDEX + 1;
export const ACTIONS_BAR_Z_INDEX = PLAYER_CARD_START_Z_INDEX + 20;
export const ACTIONS_BAR_OVERLAY_Z_INDEX = 100;

// Fonts
export const gameplayFontFamilies = {
  fontFamily: ['Roboto Condensed', 'Lato'].join(','),
};

export const listHeaderStyle = {
  ...gameplayFontFamilies,
  fontWeight: 'normal',
  fontSize: '1.1rem',
  textAlign: 'center',
};

export const listSubheaderStyle = {
  ...gameplayFontFamilies,
  fontSize: '1rem',
};
