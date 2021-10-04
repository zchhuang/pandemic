import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Roles, QUARANTINE_SPECIALIST, MEDIC } from '../constants/roles';
import {
  CityCards,
  EventCards,
  ATLANTA,
  EPIDEMIC,
  getCityName,
} from '../constants/cards';
import { _ } from 'underscore';

import { check } from 'meteor/check';
import { UNCURED, CURED, ERADICATED } from '../constants/status';
import { TABLE, PLAYING, WON, LOST } from '../constants/stage';
import { Diseases } from '../constants/diseases';

export const Games = new Mongo.Collection('games');
const citiesArray = Object.keys(CityCards);
const rolesArray = Object.keys(Roles);

if (Meteor.isServer) {
  Meteor.publish('games', function gamesPublication() {
    return Games.find({}, { playerDrawPile: 0, infectionDrawPile: 0 });
  });
}

export const INFECTION_INDEX_TO_RATE = [2, 2, 2, 3, 3, 4, 4];

const CitySchema = new SimpleSchema({
  diseaseCubes: [Number],
  hasResearchStation: Boolean,
});

// JS magic to create an object from a list
const cityObjectSchemaDefinition = citiesArray.reduce((result, key) => {
  result[key] = {
    type: CitySchema,
  };
  return result;
}, {});

const CityObjectSchema = new SimpleSchema(cityObjectSchemaDefinition);

Games.schema = new SimpleSchema({
  _id: String,
  playerOrder: [String],
  infectionDrawPile: [String],
  infectionDiscardPile: [String],
  playerDrawPile: [String],
  playerDiscardPile: [String],
  numOutbreaks: Number,
  numEpidemics: {
    type: Number,
    min: 4,
    max: 6,
  },
  diseaseCubesLeft: [Number],
  diseaseStatus: [Number],
  cityObjects: CityObjectSchema,
  infectionIndex: {
    type: Number,
    min: 0,
    max: 6,
  },
  history: Array,
  'history.$': Array,
  'history.$.$': String,
  stage: Number,
  numTurns: Number,
  quietNight: Number,
  researchStationLocations: [String],
});

export const NUM_STARTING_CUBES = 24;

Meteor.methods({
  /** @param shuffled - false for deterministic testing */
  'games.create'(shuffled = true) {
    const gameId = Games.insert({
      playerOrder: [],
      infectionDrawPile: getInfectionDrawPile(shuffled),
      infectionDiscardPile: [],
      playerDrawPile: getPlayerDrawPile(shuffled),
      playerDiscardPile: [],
      numOutbreaks: 0,
      numEpidemics: 4,
      diseaseCubesLeft: [
        NUM_STARTING_CUBES,
        NUM_STARTING_CUBES,
        NUM_STARTING_CUBES,
        NUM_STARTING_CUBES,
      ],
      diseaseStatus: [UNCURED, UNCURED, UNCURED, UNCURED],
      cityObjects: getCityObjects(),
      infectionIndex: 0,
      history: [[]],
      stage: TABLE,
      numTurns: 0,
      quietNight: -1,
      researchStationLocations: [ATLANTA],
    });
    return gameId;
  },
  'games.getTurn'(gameId) {
    const { numTurns } = getGame(gameId);
    return numTurns;
  },
  'games.nextTurn'(gameId) {
    const { numOutbreaks, playerDrawPile } = getGame(gameId);
    if (numOutbreaks >= 8 || playerDrawPile.length === 0) {
      loseGame(gameId);
    }
    Games.update(gameId, { $inc: { numTurns: 1 }, $push: { history: [] } });
  },
  'games.currentPlayer'(gameId) {
    const { playerOrder, numTurns } = getGame(gameId);
    return playerOrder[numTurns % playerOrder.length];
  },
  'games.buildResearchStation'(gameId, cityCard, stationToRemove) {
    const { cityObjects, researchStationLocations } = getGame(gameId);
    if (cityObjects[cityCard].hasResearchStation) {
      throw new Meteor.Error(`${cityCard} already contains research station`);
    }

    if (stationToRemove) {
      if (!cityObjects[stationToRemove].hasResearchStation) {
        throw new Meteor.Error(
          `cannot remove nonexistent station in ${stationToRemove}`
        );
      }
      cityObjects[stationToRemove].hasResearchStation = false;
      const removeIndex = researchStationLocations.indexOf(stationToRemove);
      researchStationLocations.splice(removeIndex, 1);
      updateHistory(
        gameId,
        `Research station at ${CityCards[stationToRemove].name} removed (max 6 stations)`
      );
    }

    if (researchStationLocations.length >= 6) {
      throw new Meteor.Error('cannot have more than 6 research stations');
    }
    cityObjects[cityCard].hasResearchStation = true;
    researchStationLocations.push(cityCard);
    Games.update(gameId, { $set: { cityObjects, researchStationLocations } });
  },
  'games.treatDisease'(gameId, cityCard, disease, isMedic = false) {
    const { cityObjects, diseaseStatus, diseaseCubesLeft } = getGame(gameId);
    if (cityObjects[cityCard].diseaseCubes[disease] === 0) {
      throw new Meteor.Error(
        `${cityCard} has no disease cubes of this color left`
      );
    }
    const cured = diseaseStatus[disease] === CURED;
    const numCubes =
      cured || isMedic ? cityObjects[cityCard].diseaseCubes[disease] : 1;

    // If cured, remove all; otherwise, remove just one
    cityObjects[cityCard].diseaseCubes[disease] -= numCubes;
    diseaseCubesLeft[disease] += numCubes;

    if (diseaseCubesLeft[disease] >= 24 && cured) {
      diseaseStatus[disease] = ERADICATED;
    }
    Games.update(gameId, {
      $set: { cityObjects, diseaseStatus, diseaseCubesLeft },
    });
  },
  'games.autoTreat'(gameId, cityCard) {
    const { diseaseStatus, cityObjects } = getGame(gameId);

    diseaseStatus.forEach((status, disease) => {
      if (status === CURED && cityObjects[cityCard].diseaseCubes[disease] > 0) {
        Meteor.call('games.treatDisease', gameId, cityCard, disease, true);
      }
    });
  },
  'games.hasResearchStation'(gameId, city) {
    const { cityObjects } = getGame(gameId);
    return cityObjects[city].hasResearchStation;
  },
  'games.drawPlayerCard'(gameId) {
    const {
      cityObjects,
      playerDrawPile,
      playerDiscardPile,
      infectionDrawPile,
      infectionDiscardPile,
      diseaseStatus,
      diseaseCubesLeft,
      playerOrder,
    } = getGame(gameId);

    if (playerDrawPile.length === 0) {
      return null;
    }
    const poppedCard = playerDrawPile.pop();
    let outbreakTotal = 0;
    if (poppedCard === EPIDEMIC) {
      // INFECT
      const bottomCityCard = infectionDrawPile.shift();
      const disease = CityCards[bottomCityCard].color;

      updateHistory(
        gameId,
        `An epidemic has occurred ☣️!! ${getCityName(
          bottomCityCard
        )} has been infected with three ${
          Diseases[disease].name
        }s. The infection discard pile has been shuffled and placed on the infection draw pile 😷`
      );

      for (let i = 0; i < 3 && outbreakTotal === 0; i++) {
        outbreakTotal += infectCity(
          gameId,
          disease,
          bottomCityCard,
          cityObjects,
          diseaseCubesLeft,
          diseaseStatus,
          playerOrder,
          false
        );
      }
      // INTENSIFY
      infectionDrawPile.push(
        ..._.shuffle(infectionDiscardPile.concat(bottomCityCard))
      );
      Games.update(gameId, {
        $inc: {
          // INCREASE
          infectionIndex: 1,
          numOutbreaks: outbreakTotal,
        },
        $set: {
          playerDrawPile,
          playerDiscardPile,
          infectionDrawPile,
          infectionDiscardPile: [],
          cityObjects,
          diseaseCubesLeft,
        },
      });
      return null;
    }
    Games.update(gameId, { $set: { playerDrawPile } });

    return poppedCard;
  },
  async 'games.initialize'(gameId, playerIds) {
    const game = await getAndInitializeGameAtomically(gameId);
    if (!game || game.stage === PLAYING) return;

    let roles = getRoles(true);
    check(playerIds, Array);
    if (playerIds.length < 2 || playerIds.length > 4) {
      throw new Meteor.Error(`Invalid players length: ${playerIds.length}`);
    }

    const idsToHands = {};

    Meteor.call('players.prune', gameId, playerIds);
    playerIds.forEach((p) => {
      let role = roles.pop();
      Meteor.call('players.setRole', p, role);
      idsToHands[p] = Meteor.call(
        'players.getStartingHand',
        p,
        playerIds.length
      );
    });

    const {
      numEpidemics,
      playerDrawPile,
      infectionDrawPile,
      cityObjects,
      diseaseCubesLeft,
    } = getGame(gameId);
    [1, 2, 3].forEach((n) => {
      infectionDrawPile
        .slice(-3 * n, infectionDrawPile.length - 3 * (n - 1))
        .forEach((c) => {
          for (let i = 0; i < n; i++) {
            addDiseaseCube(
              gameId,
              diseaseCubesLeft,
              getDiseaseColor(c),
              cityObjects[c]
            );
          }
        });
    });

    Games.update(gameId, {
      $set: {
        playerOrder: getPlayerOrder(idsToHands),
        playerDrawPile: insertEpidemicCards(numEpidemics, playerDrawPile),
        numEpidemics,
        infectionDrawPile: infectionDrawPile.slice(0, -9),
        infectionDiscardPile: infectionDrawPile.slice(-9),
        cityObjects,
        diseaseCubesLeft,
      },
    });
  },
  'games.setNumEpidemics'(gameId, numEpidemics) {
    check(gameId, String);
    check(numEpidemics, Number);
    if (numEpidemics < 4 || numEpidemics > 6) {
      throw new Meteor.Error(`Invalid number of epidemics: ${numEpidemics}`);
    }

    Games.update(gameId, {
      $set: {
        numEpidemics,
      },
    });
  },
  'games.cure'(gameId, disease) {
    check(disease, Number);
    const { diseaseStatus, diseaseCubesLeft } = getGame(gameId);
    diseaseStatus[disease] =
      diseaseCubesLeft[disease] < NUM_STARTING_CUBES ? CURED : ERADICATED;
    Games.update(gameId, {
      $set: {
        diseaseStatus,
      },
    });
    if (diseaseStatus.every((d) => d !== UNCURED)) {
      winGame(gameId);
    }
  },
  'games.discardPlayerCard'(gameId, ...cityCards) {
    const { playerDiscardPile } = getGame(gameId);
    playerDiscardPile.push(...cityCards);
    Games.update(gameId, { $set: { playerDiscardPile } });
  },
  'games.infect'(gameId) {
    const currentGame = Games.findOne(gameId);
    let {
      infectionIndex,
      infectionDrawPile,
      infectionDiscardPile,
      cityObjects,
      numOutbreaks,
      diseaseCubesLeft,
      diseaseStatus,
      playerOrder,
      quietNight,
      numTurns,
    } = currentGame;
    if (quietNight === numTurns) {
      updateHistory(
        gameId,
        'Currently one quiet night, no cities will be infected! 😌'
      );
      return;
    }
    const infectionRate = INFECTION_INDEX_TO_RATE[infectionIndex];
    for (let i = 0; i < infectionRate; i++) {
      const infectionCard = infectionDrawPile.pop();
      infectionDiscardPile.push(infectionCard);
      numOutbreaks += infectCity(
        gameId,
        getDiseaseColor(infectionCard),
        infectionCard,
        cityObjects,
        diseaseCubesLeft,
        diseaseStatus,
        playerOrder
      );
    }

    Games.update(gameId, {
      $set: {
        infectionDrawPile,
        infectionDiscardPile,
        cityObjects,
        numOutbreaks,
        diseaseCubesLeft,
      },
    });
    return infectionDiscardPile;
  },
  'games.oneQuietNight'(gameId) {
    const { numTurns, quietNight } = getGame(gameId);
    if (numTurns === quietNight) {
      throw new Meteor.Error('one quiet night already active');
    }
    Games.update(gameId, { $set: { quietNight: numTurns } });
  },
  'games.forecastLook'(gameId) {
    const { infectionDrawPile } = getGame(gameId);
    return infectionDrawPile.slice(-6);
  },
  'games.forecastRearrange'(gameId, cityCards) {
    const { infectionDrawPile } = getGame(gameId);
    check(cityCards, Array);
    if (!_.isEqual([...cityCards].sort(), infectionDrawPile.slice(-6).sort())) {
      throw new Meteor.Error(
        `input cards ${cityCards} don't match ${infectionDrawPile.slice(-6)}`
      );
    }
    Games.update(gameId, {
      $push: {
        infectionDrawPile: {
          $each: cityCards,
          $position: -6,
          $slice: infectionDrawPile.length,
        },
      },
    });
  },
  'games.getInfectionDiscardPile'(gameId) {
    const { infectionDiscardPile } = getGame(gameId);
    return infectionDiscardPile;
  },
  'games.resilientPopulation'(gameId, infectionCard) {
    check(infectionCard, String);
    const { infectionDiscardPile } = getGame(gameId);
    const numOccurences = infectionDiscardPile.reduce(
      (total, card) => total + (card === infectionCard),
      0
    );
    if (numOccurences !== 1) {
      throw new Meteor.Error(
        `${infectionCard} has ${numOccurences} !== 1 occurences in discard pile`
      );
    }
    Games.update(gameId, { $pull: { infectionDiscardPile: infectionCard } });
    updateHistory(
      gameId,
      `${CityCards[infectionCard].name}'s infection card has been removed from the game!`
    );
  },
  'games.getDiscardedEvents'(gameId) {
    const { playerDiscardPile } = getGame(gameId);
    return playerDiscardPile.filter((card) => card in EventCards);
  },
  'games.removeEventCard'(gameId, eventCard) {
    check(eventCard, String);
    Games.update(gameId, { $pull: { playerDiscardPile: eventCard } });
  },
  'games.updateHistory'(gameId, message) {
    updateHistory(gameId, message);
  },
});

// Helper functions -- should be pure

function getGame(gameId) {
  check(gameId, String);
  const game = Games.findOne(gameId);
  if (game == null) {
    throw new Meteor.Error(`could not find a game for gameId: ${gameId}`);
  }
  return game;
}

async function getAndInitializeGameAtomically(gameId) {
  check(gameId, String);
  // To prevent rawCollection from running if we're not on server
  // Otherwise client-side simulation will throw error and white screen :()
  if (!Meteor.isServer) {
    return;
  }

  const game = await Games.rawCollection().findOneAndUpdate(
    { _id: gameId },
    { $set: { stage: PLAYING } }
  );
  if (game?.value == null) {
    throw new Meteor.Error(`could not find a game for gameId: ${gameId}`);
  }
  return game.value;
}

function getCityObjects() {
  return citiesArray.reduce((result, city) => {
    result[city] = {
      diseaseCubes: [0, 0, 0, 0],
      hasResearchStation: city === ATLANTA,
    };
    return result;
  }, {});
}

function loseGame(gameId) {
  Games.update(gameId, { $set: { stage: LOST } });
}

function winGame(gameId) {
  Games.update(gameId, { $set: { stage: WON } });
}

function getDiseaseColor(infectionCard) {
  return CityCards[infectionCard].color;
}

function getInfectionDrawPile(shuffled) {
  return shuffled ? _.shuffle(citiesArray) : citiesArray;
}

function getRoles(shuffled) {
  return shuffled ? _.shuffle(rolesArray) : rolesArray;
}

function getPlayerDrawPile(shuffled) {
  const unshuffled = Object.keys(EventCards).concat(citiesArray);
  return shuffled ? _.shuffle(unshuffled) : unshuffled;
}

/** Insert 4, 5, or 6 epidemic cards into our deck, shuffled evenly */
function insertEpidemicCards(epidemicCount, shuffledDeck) {
  check(shuffledDeck, Array);
  const chunkSize = Math.ceil(shuffledDeck.length / epidemicCount);
  return _.chain(shuffledDeck)
    .chunk(chunkSize) // Split into chunks
    .map((deckChunk) => deckChunk.concat(EPIDEMIC)) // Slide in an epidemic
    .map(_.shuffle) // Shuffle each subdeck
    .flatten()
    .value();
}

/** Infects a City, returns the number of outbreaks */
function infectCity(
  gameId,
  disease,
  initialCity,
  cityObjects,
  diseaseCubesLeft,
  diseaseStatus,
  playerOrder,
  shouldUpdateHistory = true
) {
  let quarantineSpecialistLocations = new Set();
  let medicLocation = '';
  playerOrder.forEach((p) => {
    let role = Meteor.call('players.getRole', p);
    if (role === QUARANTINE_SPECIALIST) {
      let location = Meteor.call('players.getLocation', p);
      quarantineSpecialistLocations = new Set(CityCards[location].neighbors);
      quarantineSpecialistLocations.add(location);
    } else if (role === MEDIC) {
      medicLocation = Meteor.call('players.getLocation', p);
    }
  });
  let outbreaks = 0;
  const outbrokenCities = new Set();
  const queue = [initialCity];
  while (queue.length > 0) {
    const city = queue.pop();
    if (
      outbrokenCities.has(city) ||
      (city === medicLocation && diseaseStatus[disease] === CURED)
    ) {
      continue;
    } else if (diseaseStatus[disease] === ERADICATED) {
      if (shouldUpdateHistory)
        updateHistory(
          gameId,
          `${getCityName(city)} would have been infected, but ${
            Diseases[disease].name
          } has been eradicated 🤩`
        );
    } else if (quarantineSpecialistLocations.has(city)) {
      if (shouldUpdateHistory)
        updateHistory(
          gameId,
          `The quarantine specialist prevented an infection at ${getCityName(
            city
          )}! 💪`
        );
    } else if (cityObjects[city].diseaseCubes[disease] < 3) {
      addDiseaseCube(gameId, diseaseCubesLeft, disease, cityObjects[city]);
      if (shouldUpdateHistory)
        updateHistory(
          gameId,
          `${getCityName(city)} has been infected with one ${
            Diseases[disease].name
          } 🤒`
        );
    } else {
      // outbreaks here
      CityCards[city].neighbors.forEach((n) => queue.push(n));
      outbrokenCities.add(city);
      outbreaks += 1;
      updateHistory(
        gameId,
        `${getCityName(city)} has encountered an outbreak of ${
          Diseases[disease].name
        }! 🤢🤮`
      );
    }
  }
  return outbreaks;
}

function addDiseaseCube(gameId, diseaseCubesLeft, disease, cityObject) {
  if (diseaseCubesLeft[disease] > 0) {
    cityObject.diseaseCubes[disease]++;
    diseaseCubesLeft[disease]--;
  } else {
    loseGame(gameId);
  }
}

function getPlayerOrder(idsToCards) {
  return _.sortBy(
    Object.entries(idsToCards),
    ([, cards]) => -_.max(cards.map((card) => CityCards[card].population))
  ).map(([id]) => id);
}

function updateHistory(gameId, message) {
  check(message, String);
  const { history } = getGame(gameId);
  history[history.length - 1].push(message);
  Games.update(gameId, { $set: { history } });
}
