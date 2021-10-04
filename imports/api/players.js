import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import SimpleSchema from 'simpl-schema';

import {
  RESEARCHER,
  SCIENTIST,
  MEDIC,
  OPERATIONS_EXPERT,
  CONTINGENCY_PLANNER,
  DISPATCHER,
} from '../constants/roles';
import {
  CityCards,
  EventCards,
  ATLANTA,
  getCityName,
} from '../constants/cards';
import { Diseases } from '../constants/diseases';

const NUM_PLAYERS_TO_HAND_SIZE = {
  4: 2,
  3: 3,
  2: 4,
};

//const MAX_HAND_SIZE = 7;

if (Meteor.isServer) {
  Meteor.publish('players', function playersPublication() {
    return Players.find();
  });
}

export const Players = new Mongo.Collection('players');

Players.schema = new SimpleSchema({
  username: String,
  gameId: String,
  actionsLeft: Number,
  eventCards: { type: Array },
  'eventCards.$': { type: String },
  cityCards: { type: Array },
  'cityCards.$': { type: String },
  location: String,
  role: String,
  isReady: Boolean,
  present: Boolean,
  contingencyCard: String,
  operationsExpertAction: Number,
});

Meteor.methods({
  'players.create'(username, gameId) {
    // Check for duplicates
    const duplicates = Players.find({ username, gameId }).count();
    if (duplicates > 0) {
      throw new Meteor.Error(
        `found ${duplicates} other player(s) with username ${username} in game ${gameId}`
      );
    }

    const playerId = Players.insert({
      username,
      gameId,
      actionsLeft: 4,
      eventCards: [],
      cityCards: [],
      location: ATLANTA,
      isReady: false,
      present: true,
      role: null,
      contingencyCard: null,
      operationsExpertAction: -1,
    });
    return playerId;
  },
  'players.getStartingHand'(playerId, numPlayers) {
    const startingCards = [];
    for (let i = 0; i < NUM_PLAYERS_TO_HAND_SIZE[numPlayers]; i++) {
      startingCards.push(PlayerMethods.drawPlayerCard(playerId, false));
    }
    const startingCardNames = startingCards.map(getCardName);
    const player = getPlayer(playerId);
    GameMethods.updateHistory(
      player.gameId,
      `${player.username} draws ${startingCardNames
        .slice(0, -1)
        .join(', ')} and ${startingCardNames.slice(-1)}`
    );
    return Players.findOne(playerId).cityCards;
  },
  'players.getRole'(playerId) {
    const { role } = getPlayer(playerId);
    return role;
  },
  'players.getLocation'(playerId) {
    const { location } = getPlayer(playerId);
    return location;
  },
  // TODO: Make this a non-Meteor method function before deploying
  'players.setRole'(playerId, role) {
    check(playerId, String);
    check(role, String);

    Players.update(playerId, { $set: { role: role } });
  },
  'players.endTurn'(playerId) {
    const player = getPlayer(playerId);
    checkIsPlayersTurn(player);

    PlayerMethods.drawPlayerCard(playerId);
    PlayerMethods.drawPlayerCard(playerId);
    GameMethods.infect(player.gameId);
    GameMethods.nextTurn(player.gameId);

    Players.update(playerId, { $set: { actionsLeft: 4 } });
  },
  'players.drawPlayerCard'(playerId, shouldUpdateHistory = true) {
    const player = getPlayer(playerId);

    let playerCard = GameMethods.drawPlayerCard(player.gameId);

    if (playerCard == null) {
      return;
    }
    if (shouldUpdateHistory) {
      GameMethods.updateHistory(
        player.gameId,
        `${player.username} draws ${getCardName(playerCard)}`
      );
    }
    PlayerMethods.getPlayerCard(playerId, playerCard);
    return playerCard;
  },
  'players.playEvent'(playerId, eventCard, eventParams) {
    check(eventCard, String);
    if (checkIfCity(eventCard)) {
      throw new Meteor.Error(`not an event card: ${eventCard}`);
    }

    const { gameId, username, contingencyCard } = getPlayer(playerId);
    const result = EventCards[eventCard].call({ gameId, ...eventParams });

    if (eventCard === contingencyCard) {
      Players.update(playerId, { $set: { contingencyCard: null } });
      GameMethods.updateHistory(
        gameId,
        `${username} played contingency card ${eventCard}; it is now removed from the game 🤩🔥`
      );
    } else {
      PlayerMethods.discardPlayerCard(playerId, eventCard);
      GameMethods.discardPlayerCard(gameId, eventCard);
      GameMethods.updateHistory(gameId, `${username} plays ${eventCard} 🤩`);
    }

    return result;
  },
  'players.buildResearchStation'(playerId, stationToRemove = null) {
    const player = getPlayer(playerId);
    checkActionsAllowed(player);

    if (GameMethods.hasResearchStation(player.gameId, player.location)) {
      throw new Meteor.Error('City already contains research station');
    }

    if (player.role !== OPERATIONS_EXPERT) {
      PlayerMethods.discardPlayerCard(playerId, player.location);
    }

    GameMethods.buildResearchStation(
      player.gameId,
      player.location,
      stationToRemove
    );

    Players.update(playerId, { $inc: { actionsLeft: -1 } });
    GameMethods.updateHistory(
      player.gameId,
      `${player.username} built a research station at ${getCityName(
        player.location
      )} 🔬`
    );
  },
  'players.shareKnowledge'(
    givingPlayerId,
    takingPlayerId,
    cityCard,
    isGivingPlayersTurn
  ) {
    check(cityCard, String);
    check(isGivingPlayersTurn, Boolean);

    if (!checkIfCity(cityCard)) {
      throw new Meteor.Error(`not a city card: ${cityCard}`);
    }
    const givingPlayer = getPlayer(givingPlayerId);
    const takingPlayer = getPlayer(takingPlayerId);

    const currentPlayer = isGivingPlayersTurn ? givingPlayer : takingPlayer;
    const otherPlayer = isGivingPlayersTurn ? takingPlayer : givingPlayer;

    checkActionsAllowed(currentPlayer);

    if (
      givingPlayer.location !== takingPlayer.location ||
      (takingPlayer.location !== cityCard &&
        givingPlayer.role !== RESEARCHER) ||
      givingPlayer.gameId !== takingPlayer.gameId
    ) {
      throw new Meteor.Error(
        `player's location is not the same as other player's location and the city`
      );
    }

    PlayerMethods.discardPlayerCard(givingPlayerId, cityCard);
    PlayerMethods.getPlayerCard(takingPlayerId, cityCard);

    Players.update(currentPlayer._id, {
      $inc: { actionsLeft: -1 },
    });

    GameMethods.updateHistory(
      currentPlayer.gameId,
      `${currentPlayer.username} shared knowledge, ${
        isGivingPlayersTurn ? 'giving' : 'taking'
      } the ${getCityName(cityCard)} card ${
        isGivingPlayersTurn ? 'to' : 'from'
      } ${otherPlayer.username} 🧠`
    );
  },
  // TODO: Make this a non-Meteor method function before deploying
  'players.getPlayerCard'(playerId, playerCard) {
    check(playerId, String);
    check(playerCard, String);

    if (checkIfCity(playerCard)) {
      Players.update(playerId, { $push: { cityCards: playerCard } });
    } else {
      Players.update(playerId, { $push: { eventCards: playerCard } });
    }
  },
  'players.discardPlayerCard'(playerId, playerCard) {
    check(playerCard, String);

    const player = getPlayer(playerId);
    const isCity = checkIfCity(playerCard);
    const cards = isCity ? player.cityCards : player.eventCards;

    let cardIndex = cards.indexOf(playerCard);
    if (cardIndex < 0) {
      throw new Meteor.Error(`player does not have card: ${playerCard}`);
    }
    cards.splice(cardIndex, 1);

    if (isCity) {
      Players.update(playerId, { $set: { cityCards: cards } });
    } else {
      Players.update(playerId, { $set: { eventCards: cards } });
    }
  },
  // TODO: Make this a non-Meteor method function before deploying
  'players.move'(playerId, destination, playerIdControl) {
    const player = getPlayer(playerId);
    const playerControl = getPlayer(playerIdControl);
    if (playerControl.role !== DISPATCHER && playerId !== playerIdControl) {
      throw new Meteor.Error('controller is not dispatcher');
    }
    Players.update(playerId, { $set: { location: destination } });

    Players.update(playerIdControl, {
      $inc: { actionsLeft: -1 },
    });

    if (player.role === MEDIC) {
      GameMethods.autoTreat(player.gameId, destination);
    }
  },
  'players.drive'(playerId, destination, playerIdControl = '') {
    check(destination, String);
    check(playerIdControl, String);

    if (playerIdControl === '') {
      playerIdControl = playerId;
    }

    const player = getPlayer(playerId);
    checkActionsAllowed(player);

    let location = player.location;
    if (CityCards[location].neighbors.includes(destination)) {
      PlayerMethods.move(playerId, destination, playerIdControl);
    } else {
      throw new Meteor.Error(
        `${destination} does not have a direct connection from ${location}`
      );
    }
    GameMethods.updateHistory(
      player.gameId,
      `${player.username} drove from ${getCityName(location)} to ${getCityName(
        destination
      )} 🚘`
    );
  },
  'players.shuttleFlight'(playerId, destination, playerIdControl = '') {
    check(destination, String);
    check(playerIdControl, String);

    if (playerIdControl === '') {
      playerIdControl = playerId;
    }

    const player = getPlayer(playerId);
    checkActionsAllowed(player);

    if (
      !GameMethods.hasResearchStation(player.gameId, player.location) ||
      !GameMethods.hasResearchStation(player.gameId, destination)
    ) {
      throw new Meteor.Error(
        `one or both of these locations do not have research stations`
      );
    }

    GameMethods.updateHistory(
      player.gameId,
      `${player.username} took a shuttle flight from ${getCityName(
        player.location
      )} to ${getCityName(destination)} ✈️`
    );
    PlayerMethods.move(playerId, destination, playerIdControl);
  },
  'players.directFlight'(playerId, destination, playerIdControl = '') {
    check(destination, String);
    check(playerIdControl, String);

    if (playerIdControl === '') {
      playerIdControl = playerId;
    }

    const player = getPlayer(playerId);
    checkActionsAllowed(player);

    PlayerMethods.discardPlayerCard(playerIdControl, destination);
    GameMethods.discardPlayerCard(player.gameId, destination);

    GameMethods.updateHistory(
      player.gameId,
      `${player.username} took a direct flight from ${getCityName(
        player.location
      )} to ${getCityName(destination)}, discarding their ${getCityName(
        destination
      )} card ✈️`
    );
    PlayerMethods.move(playerId, destination, playerIdControl);
  },
  'players.charterFlight'(playerId, destination, playerIdControl = '') {
    check(destination, String);
    check(playerIdControl, String);

    if (playerIdControl === '') {
      playerIdControl = playerId;
    }

    const player = getPlayer(playerId);
    checkActionsAllowed(player);

    PlayerMethods.discardPlayerCard(playerIdControl, player.location);
    GameMethods.discardPlayerCard(player.gameId, player.location);

    GameMethods.updateHistory(
      player.gameId,
      `${player.username} took a charter flight from ${getCityName(
        player.location
      )} to ${getCityName(destination)}, discarding their ${getCityName(
        player.location
      )} card ✈️`
    );
    PlayerMethods.move(playerId, destination, playerIdControl);
  },
  'players.discoverCure'(playerId, selectedCards) {
    check(selectedCards, [String]);

    const player = getPlayer(playerId);
    const cityCards = player.cityCards.slice();
    checkActionsAllowed(player);

    if (!GameMethods.hasResearchStation(player.gameId, player.location)) {
      throw new Meteor.Error("this city doesn't have a research station");
    }

    let numRequiredCards = player.role === SCIENTIST ? 4 : 5;
    if (selectedCards.length !== numRequiredCards) {
      throw new Meteor.Error(
        'player does not have correct amount of cards to cure a disease'
      );
    }

    let disease = CityCards[selectedCards[0]].color;

    selectedCards.forEach((card) => {
      if (!cityCards.includes(card)) {
        throw new Meteor.Error(`player does not have city card: ${card}`);
      } else if (!checkIfCity(card)) {
        throw new Meteor.Error(`not a city card: ${card}`);
      } else if (CityCards[card].color !== disease) {
        throw new Meteor.Error(
          `${card} is not the same color as the other cards`
        );
      }
    });

    selectedCards.forEach((card) => {
      PlayerMethods.discardPlayerCard(playerId, card);
    });
    GameMethods.discardPlayerCard(player.gameId, ...selectedCards);

    GameMethods.cure(player.gameId, disease);

    Players.update(playerId, { $inc: { actionsLeft: -1 } });

    GameMethods.updateHistory(
      player.gameId,
      `${player.username} discovered a cure for ${Diseases[disease].name}! 🧪🎉`
    );
  },
  'players.treatDisease'(playerId, disease) {
    check(disease, Number);
    const player = getPlayer(playerId);
    checkActionsAllowed(player);

    GameMethods.treatDisease(
      player.gameId,
      player.location,
      disease,
      player.role === MEDIC
    );

    Players.update(playerId, { $inc: { actionsLeft: -1 } });
    GameMethods.updateHistory(
      player.gameId,
      `${player.username} treated ${Diseases[disease].name} at ${getCityName(
        player.location
      )} 🚑`
    );
  },
  'players.toggleReady'(playerId) {
    const player = getPlayer(playerId);

    Players.update(playerId, { $set: { isReady: !player.isReady } });
  },
  'players.join'(playerId) {
    Players.update(playerId, { $set: { present: true } });
  },
  'players.leave'(playerId) {
    Players.update(playerId, { $set: { present: false, isReady: false } });
  },
  // TODO: Make this a non-Meteor method function before deploying
  'players.remove'(playerId) {
    Players.remove(playerId);
  },
  'players.airlift'(playerId, destination) {
    let player = getPlayer(playerId);
    if (player.location === destination) {
      throw new Meteor.Error(`Cannot airlift to same city`);
    }
    Players.update(playerId, { $set: { location: destination } });

    if (player.role === MEDIC) {
      GameMethods.autoTreat(player.gameId, destination);
    }
    GameMethods.updateHistory(
      player.gameId,
      `${player.username} was airlifted from ${getCityName(
        player.location
      )} to ${getCityName(destination)} 🚁`
    );
  },
  'players.recycleEvent'(playerId, eventCard) {
    check(eventCard, String);
    const player = getPlayer(playerId);
    checkActionsAllowed(player);

    if (player.role !== CONTINGENCY_PLANNER) {
      throw new Meteor.Error('Wrong role : ' + player.role);
    }

    if (player.contingencyCard != null) {
      throw new Meteor.Error('Already holding a contingency card');
    }
    Players.update(playerId, {
      $set: { contingencyCard: eventCard },
      $inc: { actionsLeft: -1 },
    });
    GameMethods.removeEventCard(player.gameId, eventCard);
    GameMethods.updateHistory(
      player.gameId,
      `${player.username} grabbed contingency card ${eventCard} from the discard pile ♻️`
    );
  },
  'players.operationsExpertMove'(playerId, cityCard, destination) {
    check(cityCard, String);
    check(destination, String);
    // Limit the number of calls to 1 via the frontend (by hiding it after a call)

    const player = getPlayer(playerId);
    checkActionsAllowed(player);

    if (player.role !== OPERATIONS_EXPERT) {
      throw new Meteor.Error('Wrong role : ' + player.role);
    }

    if (!GameMethods.hasResearchStation(player.gameId, player.location)) {
      throw new Meteor.Error('City does not contain research station');
    }

    const currentTurn = GameMethods.getTurn(player.gameId);
    if (player.operationsExpertAction === currentTurn) {
      throw new Meteor.Error('Already used this action this turn');
    }

    PlayerMethods.discardPlayerCard(playerId, cityCard);
    GameMethods.discardPlayerCard(player.gameId, cityCard);

    GameMethods.updateHistory(
      player.gameId,
      `${player.username} discards ${cityCard} to move from ${getCityName(
        player.location
      )} to ${getCityName(destination)} 🚀`
    );
    PlayerMethods.move(playerId, destination, playerId);

    Players.update(playerId, {
      $set: { operationsExpertAction: currentTurn },
    });
  },
  'players.dispatchPlayer'(dispatcherId, playerId, otherPlayerId) {
    const dispatcher = getPlayer(dispatcherId);
    const player = getPlayer(playerId);
    checkActionsAllowed(dispatcher);

    const otherPlayer = getPlayer(otherPlayerId);
    if (dispatcher.role !== DISPATCHER) {
      throw new Meteor.Error('Wrong role : ' + player.role);
    }

    if (player.location === otherPlayer.location) {
      throw new Meteor.Error('They are in the same location');
    }

    GameMethods.updateHistory(
      player.gameId,
      `${dispatcher.username} dispatched ${player.username} to ${otherPlayer.username}'s location, ${otherPlayer.location} ☎️`
    );
    PlayerMethods.move(playerId, otherPlayer.location, dispatcherId);
  },
  // TODO: Make this a non-Meteor method function before deploying
  'players.prune'(gameId, playerIds) {
    // Remove players that joined and left
    Players.remove({ _id: { $nin: playerIds }, gameId });
  },
});

export const PlayerMethods = {
  getPlayerCard(playerId, playerCard) {
    return Meteor.call('players.getPlayerCard', playerId, playerCard);
  },
  drawPlayerCard(playerId, shouldUpdateHistory) {
    return Meteor.call('players.drawPlayerCard', playerId, shouldUpdateHistory);
  },
  discardPlayerCard(playerId, location) {
    return Meteor.call('players.discardPlayerCard', playerId, location);
  },
  airlift(playerId, destination) {
    Meteor.call('players.airlift', playerId, destination);
  },
  playEvent(playerId, eventCard, eventParams) {
    Meteor.call('players.playEvent', playerId, eventCard, eventParams);
  },
  move(playerId, destination, playerIdControl) {
    Meteor.call('players.move', playerId, destination, playerIdControl);
  },
};

export const GameMethods = {
  hasResearchStation(gameId, city) {
    return Meteor.call('games.hasResearchStation', gameId, city);
  },
  drawPlayerCard(gameId) {
    return Meteor.call('games.drawPlayerCard', gameId);
  },
  treatDisease(gameId, city, disease, isMedic) {
    return Meteor.call('games.treatDisease', gameId, city, disease, isMedic);
  },
  discardPlayerCard(gameId, ...card) {
    return Meteor.call('games.discardPlayerCard', gameId, ...card);
  },
  buildResearchStation(gameId, city, stationToRemove) {
    return Meteor.call(
      'games.buildResearchStation',
      gameId,
      city,
      stationToRemove
    );
  },
  cure(gameId, disease) {
    return Meteor.call('games.cure', gameId, disease);
  },
  nextTurn(gameId) {
    return Meteor.call('games.nextTurn', gameId);
  },
  infect(gameId) {
    return Meteor.call('games.infect', gameId);
  },
  oneQuietNight(gameId) {
    return Meteor.call('games.oneQuietNight', gameId);
  },
  forecastLook(gameId) {
    return Meteor.call('games.forecastLook', gameId);
  },
  forecastRearrange(gameId, cityCards) {
    return Meteor.call('games.forecastRearrange', gameId, cityCards);
  },
  resilientPopulation(gameId, infectionCard) {
    return Meteor.call('games.resilientPopulation', gameId, infectionCard);
  },
  getRole(gameId) {
    return Meteor.call('games.getRole', gameId);
  },
  autoTreat(gameId, cityCard) {
    return Meteor.call('games.autoTreat', gameId, cityCard);
  },
  removeEventCard(gameId, eventCard) {
    return Meteor.call('games.removeEventCard', gameId, eventCard);
  },
  updateHistory(gameId, message) {
    return Meteor.call('games.updateHistory', gameId, message);
  },
  getTurn(gameId) {
    return Meteor.call('games.getTurn', gameId);
  },
  currentPlayer(gameId) {
    return Meteor.call('games.currentPlayer', gameId);
  },
};

function getPlayer(playerId) {
  check(playerId, String);
  const player = Players.findOne(playerId);
  if (player == null) {
    throw new Meteor.Error(`could not find a player for playerId: ${playerId}`);
  }
  return player;
}

function checkIfCity(playerCard) {
  if (playerCard in CityCards) {
    return true;
  } else if (playerCard in EventCards) {
    return false;
  } else {
    throw new Meteor.Error(
      `this card is not a city or an event card: ${playerCard}`
    );
  }
}

function getCardName(playerCard) {
  return playerCard in CityCards ? getCityName(playerCard) : playerCard;
}

// Ensure that it's our turn and we have > 0 actions left
function checkActionsAllowed(player) {
  checkIsPlayersTurn(player);
  if (player.actionsLeft <= 0) {
    throw new Meteor.Error(
      `player has ${player.actionsLeft} actions left, cannot take action`
    );
  }
}

// Ensure that it's our turn
function checkIsPlayersTurn(player) {
  const currentPlayerId = GameMethods.currentPlayer(player.gameId);
  if (player._id !== currentPlayerId) {
    throw new Meteor.Error(
      `currentPlayer is ${currentPlayerId}, not ${player._id}`
    );
  }
}
