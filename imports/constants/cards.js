import { Meteor } from 'meteor/meteor';
import { BLACK, RED, BLUE, YELLOW } from './diseases';
import { regularCardStyle } from './styles';
import { GameMethods, PlayerMethods } from '../api/players';

// CITIES
export const ALGIERS = 'ALG';
export const ATLANTA = 'ATL';
export const BAGHDAD = 'BAG';
export const BANGKOK = 'BAN';
export const BEIJING = 'BEI';
export const BOGOTA = 'BOG';
export const BUENOS_AIRES = 'BUE';
export const CAIRO = 'CAI';
export const CHENNAI = 'CHE';
export const CHICAGO = 'CHI';
export const DELHI = 'DEL';
export const ESSEN = 'ESS';
export const HO_CHI_MINH_CITY = 'HCM';
export const HONG_KONG = 'HON';
export const ISTANBUL = 'IST';
export const JAKARTA = 'JAK';
export const JOHANNESBURG = 'JOH';
export const KARACHI = 'KAR';
export const KHARTOUM = 'KHA';
export const KINSHASA = 'KIN';
export const KOLKATA = 'KOL';
export const LAGOS = 'LAG';
export const LIMA = 'LIM';
export const LONDON = 'LON';
export const LOS_ANGELES = 'LOS';
export const MADRID = 'MAD';
export const MANILA = 'MAN';
export const MEXICO_CITY = 'MEX';
export const MIAMI = 'MIA';
export const MILAN = 'MIL';
export const MONTREAL = 'MON';
export const MOSCOW = 'MOS';
export const MUMBAI = 'MUM';
export const NEW_YORK_CITY = 'NEW';
export const OSAKA = 'OSA';
export const PARIS = 'PAR';
export const RIYADH = 'RIY';
export const SAN_FRANCISCO = 'SFO';
export const SANTIAGO = 'SAN';
export const SAO_PAULO = 'SAO';
export const SEOUL = 'SEO';
export const SHANGHAI = 'SHA';
export const ST_PETERSBURG = 'STP';
export const SYDNEY = 'SYD';
export const TAIPEI = 'TAI';
export const TEHRAN = 'TEH';
export const TOKYO = 'TOK';
export const WASHINGTON = 'WAS';

// EVENTS
export const ONE_QUIET_NIGHT = 'One Quiet Night';
export const GOVERNMENT_GRANT = 'Government Grant';
export const AIRLIFT = 'Airlift';
export const RESILIENT_POPULATION = 'Resilient Population';
export const FORECAST = 'Forecast';

// EPIDEMIC
export const EPIDEMIC = 'Epidemic';

export const CityCards = {
  //BLACK
  [ALGIERS]: {
    name: 'Algiers',
    neighbors: [CAIRO, MADRID, ISTANBUL, PARIS],
    population: 2946000,
    populationByArea: 6500,
    country: 'Algeria',
    color: BLACK,
  },
  [CAIRO]: {
    name: 'Cairo',
    neighbors: [ALGIERS, BAGHDAD, RIYADH, ISTANBUL, KHARTOUM],
    population: 14718000,
    populationByArea: 8900,
    country: 'Egypt',
    color: BLACK,
  },
  [RIYADH]: {
    name: 'Riyadh',
    neighbors: [CAIRO, BAGHDAD, KARACHI],
    population: 5037000,
    populationByArea: 3400,
    country: 'Saudi Arabia',
    color: BLACK,
  },
  [BAGHDAD]: {
    name: 'Baghdad',
    neighbors: [CAIRO, ISTANBUL, TEHRAN, KARACHI, RIYADH],
    population: 6204000,
    populationByArea: 10400,
    country: 'Iraq',
    color: BLACK,
  },
  [ISTANBUL]: {
    name: 'Istanbul',
    neighbors: [ALGIERS, CAIRO, BAGHDAD, MOSCOW, MILAN, ST_PETERSBURG],
    population: 13576000,
    populationByArea: 9700,
    country: 'Turkey',
    color: BLACK,
  },
  [TEHRAN]: {
    name: 'Tehran',
    neighbors: [MOSCOW, BAGHDAD, KARACHI, DELHI],
    population: 7419000,
    populationByArea: 9500,
    country: 'Iran',
    color: BLACK,
  },
  [DELHI]: {
    name: 'Delhi',
    neighbors: [KOLKATA, CHENNAI, MUMBAI, KARACHI, TEHRAN],
    population: 22242000,
    populationByArea: 11500,
    ccountry: 'India',
    color: BLACK,
  },
  [MUMBAI]: {
    name: 'Mumbai',
    neighbors: [CHENNAI, KARACHI, DELHI],
    population: 16910000,
    populationByArea: 30900,
    country: 'India',
    color: BLACK,
  },
  [CHENNAI]: {
    name: 'Chennai',
    neighbors: [MUMBAI, JAKARTA, BANGKOK, DELHI, KOLKATA],
    population: 8865000,
    populationByArea: 14600,
    country: 'India',
    color: BLACK,
  },
  [KOLKATA]: {
    name: 'Kolkata',
    neighbors: [BANGKOK, CHENNAI, HONG_KONG, DELHI],
    population: 14374000,
    populationByArea: 11900,
    country: 'India',
    color: BLACK,
  },
  [MOSCOW]: {
    name: 'Moscow',
    neighbors: [ST_PETERSBURG, TEHRAN, ISTANBUL],
    population: 15512000,
    populationByArea: 3500,
    country: 'Russia',
    color: BLACK,
  },
  [KARACHI]: {
    name: 'Karachi',
    neighbors: [BAGHDAD, RIYADH, MUMBAI, DELHI, TEHRAN],
    population: 20711000,
    populationByArea: 25800,
    country: 'Pakistan',
    color: BLACK,
  },

  //RED
  [BEIJING]: {
    name: 'Beijing',
    neighbors: [SEOUL, SHANGHAI],
    population: 17311000,
    populationByArea: 5000,
    country: "People's Republic of China",
    color: RED,
  },
  [SEOUL]: {
    name: 'Seoul',
    neighbors: [BEIJING, SHANGHAI, TOKYO],
    population: 22547000,
    populationByArea: 10400,
    country: 'South Korea',
    color: RED,
  },
  [SHANGHAI]: {
    name: 'Shanghai',
    neighbors: [BEIJING, SEOUL, TOKYO, TAIPEI, HONG_KONG],
    population: 13482000,
    populationByArea: 2200,
    country: "People's Republic of China",
    color: RED,
  },
  [TOKYO]: {
    name: 'Tokyo',
    neighbors: [SEOUL, SHANGHAI, SAN_FRANCISCO, OSAKA],
    population: 13189000,
    populationByArea: 6030,
    country: 'Japan',
    color: RED,
  },
  [OSAKA]: {
    name: 'Osaka',
    neighbors: [TAIPEI, TOKYO],
    population: 2871000,
    populationByArea: 13000,
    country: 'Japan',
    color: RED,
  },
  [HONG_KONG]: {
    name: 'Hong Kong',
    neighbors: [SHANGHAI, TAIPEI, BANGKOK, HO_CHI_MINH_CITY, MANILA, KOLKATA],
    population: 7106000,
    populationByArea: 25900,
    country: "People's Republic of China",
    color: RED,
  },
  [MANILA]: {
    name: 'Manila',
    neighbors: [TAIPEI, HONG_KONG, HO_CHI_MINH_CITY, SAN_FRANCISCO, SYDNEY],
    population: 20767000,
    populationByArea: 14400,
    country: 'Philippines',
    color: RED,
  },
  [SYDNEY]: {
    name: 'Sydney',
    neighbors: [MANILA, LOS_ANGELES, JAKARTA],
    population: 3785000,
    populationByArea: 2100,
    country: 'Australia',
    color: RED,
  },
  [JAKARTA]: {
    name: 'Jakarta',
    neighbors: [HO_CHI_MINH_CITY, CHENNAI, SYDNEY, BANGKOK],
    population: 26063000,
    populationByArea: 9400,
    country: 'Indonesia',
    color: RED,
  },
  [HO_CHI_MINH_CITY]: {
    name: 'Ho Chi Minh City',
    neighbors: [HONG_KONG, BANGKOK, JAKARTA, MANILA],
    population: 8314000,
    populationByArea: 9900,
    country: 'Vietnam',
    color: RED,
  },
  [TAIPEI]: {
    name: 'Taipei',
    neighbors: [SHANGHAI, OSAKA, MANILA, HONG_KONG],
    population: 8338000,
    populationByArea: 7300,
    country: 'Taiwan',
    color: RED,
  },
  [BANGKOK]: {
    name: 'Bangkok',
    neighbors: [KOLKATA, HONG_KONG, CHENNAI, JAKARTA, HO_CHI_MINH_CITY],
    population: 7151000,
    populationByArea: 3200,
    country: 'Thailand',
    color: RED,
  },

  //"YELLOW"
  [KHARTOUM]: {
    name: 'Khartoum',
    neighbors: [CAIRO, LAGOS, KINSHASA, JOHANNESBURG],
    population: 4887000,
    populationByArea: 4500,
    country: 'Sudan',
    color: YELLOW,
  },
  [JOHANNESBURG]: {
    name: 'Johannesburg',
    neighbors: [KINSHASA, KHARTOUM],
    population: 3888000,
    populationByArea: 2400,
    country: 'South Africa',
    color: YELLOW,
  },
  [KINSHASA]: {
    name: 'Kinshasa',
    neighbors: [LAGOS, KHARTOUM, JOHANNESBURG],
    population: 9046000,
    populationByArea: 15500,
    country: 'Democratic Republic of the Congo',
    color: YELLOW,
  },
  [LAGOS]: {
    name: 'Lagos',
    neighbors: [KHARTOUM, KINSHASA, SAO_PAULO],
    population: 11547000,
    populationByArea: 12700,
    country: 'Nigeria',
    color: YELLOW,
  },
  [SAO_PAULO]: {
    name: 'São Paulo',
    neighbors: [BUENOS_AIRES, BOGOTA, LAGOS, MADRID],
    population: 20186000,
    populationByArea: 6400,
    country: 'Brazil',
    color: YELLOW,
  },
  [BUENOS_AIRES]: {
    name: 'Buenos Aires',
    neighbors: [SAO_PAULO, BOGOTA],
    population: 13639000,
    populationByArea: 5200,
    country: 'Argentina',
    color: YELLOW,
  },
  [SANTIAGO]: {
    name: 'Santiago',
    neighbors: [LIMA],
    population: 6015000,
    populationByArea: 6500,
    country: 'Chile',
    color: YELLOW,
  },
  [LIMA]: {
    name: 'Lima',
    neighbors: [MEXICO_CITY, BOGOTA, SANTIAGO],
    population: 9121000,
    populationByArea: 14100,
    country: 'Peru',
    color: YELLOW,
  },
  [BOGOTA]: {
    name: 'Bogotá',
    neighbors: [MEXICO_CITY, MIAMI, LIMA, BUENOS_AIRES, SAO_PAULO],
    population: 8702000,
    populationByArea: 21000,
    country: 'Colombia',
    color: YELLOW,
  },
  [MIAMI]: {
    name: 'Miami',
    neighbors: [MEXICO_CITY, BOGOTA, ATLANTA, WASHINGTON],
    population: 5582000,
    populationByArea: 1700,
    country: 'United States',
    color: YELLOW,
  },
  [MEXICO_CITY]: {
    name: 'Mexico City',
    neighbors: [CHICAGO, LOS_ANGELES, MIAMI, BOGOTA, LIMA],
    population: 19463000,
    populationByArea: 9500,
    country: 'Mexico',
    color: YELLOW,
  },
  [LOS_ANGELES]: {
    name: 'Los Angeles',
    neighbors: [SAN_FRANCISCO, CHICAGO, MEXICO_CITY, SYDNEY],
    population: 14900000,
    populationByArea: 2400,
    country: 'United States',
    color: YELLOW,
  },

  //"BLUE"
  [SAN_FRANCISCO]: {
    name: 'San Francisco',
    neighbors: [CHICAGO, LOS_ANGELES, TOKYO, MANILA],
    population: 5864000,
    populationByArea: 2100,
    country: 'United States',
    color: BLUE,
  },
  [CHICAGO]: {
    name: 'Chicago',
    neighbors: [SAN_FRANCISCO, LOS_ANGELES, MEXICO_CITY, ATLANTA, MONTREAL],
    population: 9121000,
    populationByArea: 1300,
    country: 'United States',
    color: BLUE,
  },
  [MONTREAL]: {
    name: 'Montréal',
    neighbors: [CHICAGO, WASHINGTON, NEW_YORK_CITY],
    population: 3429000,
    populationByArea: 2200,
    country: 'Canada',
    color: BLUE,
  },
  [NEW_YORK_CITY]: {
    name: 'New York City',
    neighbors: [WASHINGTON, MONTREAL, MADRID, LONDON],
    population: 20464000,
    populationByArea: 1800,
    country: 'United States',
    color: BLUE,
  },
  [ATLANTA]: {
    name: 'Atlanta',
    neighbors: [CHICAGO, WASHINGTON, MIAMI],
    population: 4715000,
    populationByArea: 700,
    country: 'United States',
    color: BLUE,
  },
  [WASHINGTON]: {
    name: 'Washington',
    neighbors: [MONTREAL, NEW_YORK_CITY, ATLANTA, MIAMI],
    population: 4679000,
    populationByArea: 1400,
    country: 'United States',
    color: BLUE,
  },
  [LONDON]: {
    name: 'London',
    neighbors: [MADRID, PARIS, ESSEN, NEW_YORK_CITY],
    population: 8586000,
    populationByArea: 5300,
    country: 'United Kingdom',
    color: BLUE,
  },
  [ST_PETERSBURG]: {
    name: 'St. Petersburg',
    neighbors: [MOSCOW, ESSEN, ISTANBUL],
    population: 4879000,
    populationByArea: 4100,
    country: 'Russia',
    color: BLUE,
  },
  [MADRID]: {
    name: 'Madrid',
    neighbors: [LONDON, NEW_YORK_CITY, PARIS, ALGIERS, SAO_PAULO],
    population: 5427000,
    populationByArea: 5700,
    country: 'Spain',
    color: BLUE,
  },
  [PARIS]: {
    name: 'Paris',
    neighbors: [LONDON, ESSEN, MILAN, MADRID, ALGIERS],
    population: 10755000,
    populationByArea: 3800,
    country: 'France',
    color: BLUE,
  },
  [MILAN]: {
    name: 'Milan',
    neighbors: [PARIS, ESSEN, ISTANBUL],
    population: 5232000,
    populationByArea: 2800,
    country: 'Italy',
    color: BLUE,
  },
  [ESSEN]: {
    name: 'Essen',
    neighbors: [LONDON, PARIS, MILAN, ST_PETERSBURG],
    population: 575000,
    populationByArea: 2800,
    country: 'Germany',
    color: BLUE,
  },
};

const ensureParamsExist = (params, ...keys) => {
  const missingKeys = keys.filter((key) => !(key in params));
  if (missingKeys.length) {
    throw new Meteor.Error(`${missingKeys} not present in params`);
  }
};

export const EventCards = {
  [ONE_QUIET_NIGHT]: {
    name: 'One Quiet Night',
    text:
      'Skip the next infect cities step (Do not flip over any infection cards).',
    call: (params) => {
      ensureParamsExist(params, 'gameId');
      const { gameId } = params;
      return GameMethods.oneQuietNight(gameId);
    },
  },
  [GOVERNMENT_GRANT]: {
    name: 'Government Grant',
    text: 'Add 1 research station to any city.',
    call: (params) => {
      ensureParamsExist(params, 'gameId', 'city');
      const { gameId, city } = params;
      return GameMethods.buildResearchStation(
        gameId,
        city,
        params?.stationToRemove
      );
    },
  },
  [AIRLIFT]: {
    name: 'Airlift',
    text: 'Move any 1 pawn to any city.',
    call: (params) => {
      ensureParamsExist(params, 'playerId', 'destination');
      const { playerId, destination } = params;
      return PlayerMethods.airlift(playerId, destination);
    },
  },
  [RESILIENT_POPULATION]: {
    name: 'Resilient Population',
    text: 'Remove any 1 card in the infection discard pile from the game.',
    call: (params) => {
      ensureParamsExist(params, 'gameId', 'infectionCard');
      const { gameId, infectionCard } = params;
      return GameMethods.resilientPopulation(gameId, infectionCard);
    },
  },
  [FORECAST]: {
    name: 'Forecast',
    text: 'Draw, look at, and rearrange the top 6 cards of the infection deck.',
    call: (params) => {
      ensureParamsExist(params, 'gameId', 'cityCards');
      const { gameId, cityCards } = params;
      return GameMethods.forecastRearrange(gameId, cityCards);
    },
  },
};

// For getting correct order of players when rendering on map / teaminfo
export const getOrderedPlayers = (players, playerObject, playerOnTop) => {
  if (!playerObject) return players;
  const otherPlayers = players.filter((p) => p._id !== playerObject._id);
  return playerOnTop
    ? [playerObject, ...otherPlayers]
    : [...otherPlayers, playerObject];
};

// Sizing
export const SMALL = 'small';
export const REGULAR = 'regular';

export const sizeToCardSizeRatio = {
  [SMALL]: 80 / regularCardStyle.width,
  [REGULAR]: 1,
};

export const sizeToFontSizeRatio = {
  [SMALL]: 11 / 20,
  [REGULAR]: 1,
};

export const getCityName = (city) => {
  return CityCards[city].name;
};

export const MAX_HAND_SIZE = 7;

export const getHandSize = (player) => {
  if (!player) return 0;
  return player.cityCards.length + player.eventCards.length;
};

export const getPlayersWaitingOn = (players, playerId) => {
  if (!playerId) return [];
  return players
    .filter((player) => player._id !== playerId)
    .filter((player) => getHandSize(player) > MAX_HAND_SIZE);
};
