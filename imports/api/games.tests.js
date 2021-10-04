import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';

import { Games, NUM_STARTING_CUBES } from './games';
import { BLACK, RED, BLUE, YELLOW } from '../constants/diseases';
import { EPIDEMIC, RIYADH, CHICAGO, MONTREAL } from '../constants/cards';
import { TABLE, PLAYING, WON, LOST } from '../constants/stage';
import {
  CityCards,
  ATLANTA,
  LONDON,
  TOKYO,
  WASHINGTON,
  PARIS,
  MUMBAI,
  MIAMI,
  SYDNEY,
  BEIJING,
  AIRLIFT,
} from '../constants/cards';
import { Roles, QUARANTINE_SPECIALIST, MEDIC } from '../constants/roles';
import { _ } from 'underscore';
import { UNCURED, CURED, ERADICATED } from '../constants/status';
import { Players } from './players';

if (Meteor.isServer) {
  describe('Games', () => {
    describe('methods', () => {
      let gameId, players, citiesArray, initialPlayerOrder, rolesArray;

      beforeEach(() => {
        Games.remove({});
        Players.remove({});
        gameId = Meteor.call('games.create', false);
        players = ['dikman', 'nikman', 'ayacie', 'z9040'];
        initialPlayerOrder = ['ayacie', 'dikman', 'nikman', 'z9040'];
        citiesArray = Object.keys(CityCards);
        rolesArray = Object.keys(Roles);
      });

      it('can create a new Game with correct starting fields (needs to pass for others to pass)', () => {
        const game = Games.findOne(gameId);
        assert.isNotNull(game);
        Games.schema.validate(game);
        const {
          infectionDrawPile,
          infectionDiscardPile,
          playerDiscardPile,
          numOutbreaks,
          diseaseCubesLeft,
          diseaseStatus,
          cityObjects,
          infectionIndex,
          stage,
          numTurns,
          quietNight,
          researchStationLocations,
        } = game;
        assert.equal(48, infectionDrawPile.length);
        assert.deepEqual(
          new Set(infectionDrawPile),
          new Set(Object.keys(CityCards)),
          'infectionDrawPile not matching'
        );
        assert.isArray(infectionDiscardPile);
        assert.isEmpty(infectionDiscardPile);
        assert.isArray(playerDiscardPile);
        assert.isEmpty(playerDiscardPile);
        assert.equal(numOutbreaks, 0);
        assert.deepEqual(diseaseCubesLeft, [24, 24, 24, 24]);
        assert.deepEqual(diseaseStatus, [UNCURED, UNCURED, UNCURED, UNCURED]);
        assert.deepEqual(
          Object.keys(CityCards),
          Object.keys(cityObjects),
          'cityObjects not matching'
        );
        assert.equal(stage, TABLE);
        assert.equal(infectionIndex, 0);
        assert.equal(numTurns, 0);
        assert.equal(quietNight, -1);
        assert.deepEqual(researchStationLocations, [ATLANTA]);
      });

      it('can initialize game with players', () => {
        players.forEach((p) => {
          Players.insert({
            _id: p,
            gameId,
          });
        });
        // Add another random player who left during table
        Players.insert({
          _id: 'flake',
          gameId,
        });
        Meteor.call('games.initialize', gameId, initialPlayerOrder);
        const {
          playerOrder,
          playerDrawPile,
          infectionDrawPile,
          infectionDiscardPile,
          numEpidemics,
          stage,
        } = Games.findOne(gameId);
        assert.deepEqual(playerOrder, players);
        const epidemicCount = playerDrawPile.reduce(
          (prev, current) => (current === EPIDEMIC ? prev + 1 : prev),
          0
        );
        assert.equal(epidemicCount, 4);
        assert.equal(numEpidemics, 4);
        assert.equal(stage, PLAYING);
        // Initial cities, plus epidemic cards, minus players' hands, plus event cards
        assert.equal(playerDrawPile.length, 48 + 4 - 8 + 5);
        assert.equal(infectionDrawPile.length, 48 - 9);
        assert.equal(infectionDiscardPile.length, 9);
        assert.deepEqual(
          new Set(infectionDrawPile.concat(infectionDiscardPile)),
          new Set(Object.keys(CityCards))
        );
      });

      it('prevents double initialize', () => {
        players.forEach((p) => {
          Players.insert({
            _id: p,
            gameId,
          });
        });
        // Add another random player who left during table
        Players.insert({
          _id: 'flake',
          gameId,
        });
        Meteor.call('games.initialize', gameId, initialPlayerOrder);
        const {
          playerOrder,
          playerDrawPile,
          infectionDrawPile,
          infectionDiscardPile,
          numEpidemics,
          stage,
        } = Games.findOne(gameId);
        assert.deepEqual(playerOrder, players);
        const epidemicCount = playerDrawPile.reduce(
          (prev, current) => (current === EPIDEMIC ? prev + 1 : prev),
          0
        );
        assert.equal(epidemicCount, 4);
        assert.equal(numEpidemics, 4);
        assert.equal(stage, PLAYING);
        // Initial cities, plus epidemic cards, minus players' hands, plus event cards
        assert.equal(playerDrawPile.length, 48 + 4 - 8 + 5);
        assert.equal(infectionDrawPile.length, 48 - 9);
        assert.equal(infectionDiscardPile.length, 9);
        assert.deepEqual(
          new Set(infectionDrawPile.concat(infectionDiscardPile)),
          new Set(Object.keys(CityCards))
        );
        Meteor.call('games.initialize', gameId, initialPlayerOrder);
        assert.deepEqual(playerOrder, players);
        assert.equal(epidemicCount, 4);
        assert.equal(numEpidemics, 4);
        assert.equal(stage, PLAYING);
        // Initial cities, plus epidemic cards, minus players' hands, plus event cards
        assert.equal(playerDrawPile.length, 48 + 4 - 8 + 5);
        assert.equal(infectionDrawPile.length, 48 - 9);
        assert.equal(infectionDiscardPile.length, 9);
        assert.deepEqual(
          new Set(infectionDrawPile.concat(infectionDiscardPile)),
          new Set(Object.keys(CityCards))
        );
      });

      it('prevents double initialize', () => {
        players.forEach((p) => {
          Players.insert({
            _id: p,
            gameId,
          });
        });
        // Add another random player who left during table
        Players.insert({
          _id: 'flake',
          gameId,
        });
        Meteor.call('games.initialize', gameId, initialPlayerOrder);
        const {
          playerOrder,
          playerDrawPile,
          infectionDrawPile,
          infectionDiscardPile,
          numEpidemics,
          stage,
        } = Games.findOne(gameId);
        assert.deepEqual(playerOrder, players);
        const epidemicCount = playerDrawPile.reduce(
          (prev, current) => (current === EPIDEMIC ? prev + 1 : prev),
          0
        );
        assert.equal(epidemicCount, 4);
        assert.equal(numEpidemics, 4);
        assert.equal(stage, PLAYING);
        // Initial cities, plus epidemic cards, minus players' hands, plus event cards
        assert.equal(playerDrawPile.length, 48 + 4 - 8 + 5);
        assert.equal(infectionDrawPile.length, 48 - 9);
        assert.equal(infectionDiscardPile.length, 9);
        assert.deepEqual(
          new Set(infectionDrawPile.concat(infectionDiscardPile)),
          new Set(Object.keys(CityCards))
        );
        Meteor.call('games.initialize', gameId, initialPlayerOrder);
        assert.deepEqual(playerOrder, players);
        assert.equal(epidemicCount, 4);
        assert.equal(numEpidemics, 4);
        assert.equal(stage, PLAYING);
        // Initial cities, plus epidemic cards, minus players' hands, plus event cards
        assert.equal(playerDrawPile.length, 48 + 4 - 8 + 5);
        assert.equal(infectionDrawPile.length, 48 - 9);
        assert.equal(infectionDiscardPile.length, 9);
        assert.deepEqual(
          new Set(infectionDrawPile.concat(infectionDiscardPile)),
          new Set(Object.keys(CityCards))
        );
      });

      it('ends player turn correctly', () => {
        Meteor.call('games.nextTurn', gameId);
        const { numTurns: expectOne } = Games.findOne(gameId);
        assert.equal(expectOne, 1);
        Meteor.call('games.nextTurn', gameId);
        const { numTurns: expectTwo } = Games.findOne(gameId);
        assert.equal(expectTwo, 2);
      });

      it('gets player turn correctly', () => {
        players.forEach((p) => {
          Players.insert({
            _id: p,
            gameId,
          });
        });
        Meteor.call('games.setNumEpidemics', gameId, 5);
        Meteor.call('games.initialize', gameId, initialPlayerOrder);
        for (let i = 0; i < 12; i++) {
          const player = Meteor.call('games.currentPlayer', gameId);
          assert.equal(player, players[i % players.length], i);
          Meteor.call('games.nextTurn', gameId);
        }
      });

      it('can add one research station', () => {
        Meteor.call('games.buildResearchStation', gameId, LONDON);
        const game = Games.findOne(gameId);
        const { cityObjects, researchStationLocations } = game;
        assert.isTrue(cityObjects[LONDON].hasResearchStation);
        assert.deepEqual([ATLANTA, LONDON], researchStationLocations);
      });

      it('adds up to six, but no more, research stations', () => {
        const stationsToAdd = [LONDON, TOKYO, WASHINGTON, PARIS, MUMBAI];
        stationsToAdd.forEach((station) => {
          Meteor.call('games.buildResearchStation', gameId, station);
        });

        assert.throws(
          () => Meteor.call('games.buildResearchStation', gameId, SYDNEY),
          Meteor.Error
        );

        Meteor.call('games.buildResearchStation', gameId, SYDNEY, PARIS);

        const { cityObjects, researchStationLocations } = Games.findOne(gameId);
        const expectedResearchStations = [
          ATLANTA,
          LONDON,
          TOKYO,
          WASHINGTON,
          MUMBAI,
          SYDNEY,
        ];
        assert.deepEqual(researchStationLocations, expectedResearchStations);
        expectedResearchStations.forEach((station) => {
          assert.isTrue(
            cityObjects[station].hasResearchStation,
            `${station} should be true`
          );
        });
        assert.isFalse(cityObjects[PARIS].hasResearchStation);
      });

      it('checks research station correctly on init', () => {
        assert.isTrue(Meteor.call('games.hasResearchStation', gameId, ATLANTA));
        [LONDON, PARIS].forEach((city) => {
          assert.isFalse(Meteor.call('games.hasResearchStation', gameId, city));
        });
      });

      it('integrates between building and checking research stations', () => {
        const cities = [SYDNEY, BEIJING, PARIS];
        cities.forEach((city) => {
          Meteor.call('games.buildResearchStation', gameId, city);
        });
        cities.forEach((city) => {
          assert.isTrue(Meteor.call('games.hasResearchStation', gameId, city));
        });
      });

      it('discards player card', () => {
        const cards = [ATLANTA, PARIS];
        Meteor.call('games.discardPlayerCard', gameId, ...cards);
        const { playerDiscardPile } = Games.findOne(gameId);
        assert.deepEqual(playerDiscardPile, cards);
      });

      it('draws non-epidemic player card', () => {
        const { playerDrawPile: oldPlayerDrawPile } = Games.findOne(gameId);
        const drawnCard = Meteor.call('games.drawPlayerCard', gameId);
        const { playerDrawPile } = Games.findOne(gameId);
        assert.equal(playerDrawPile.length, 52);
        assert.deepEqual(playerDrawPile, oldPlayerDrawPile.slice(0, 52));
        assert.isFalse(playerDrawPile.includes(drawnCard));
      });

      for (let d = 0; d <= 3; d++) {
        it(`handles epidemic for ${d} existing cubes`, () => {
          // Add fresh epidemic for testing, add cities to discard
          Games.update(gameId, {
            $push: { playerDrawPile: EPIDEMIC },
            $set: {
              infectionDrawPile: citiesArray.slice(0, 30),
              infectionDiscardPile: citiesArray.slice(30),
            },
          });
          const prevState = Games.findOne(gameId);
          const bottomCityCard = prevState.infectionDrawPile[0];
          const disease = CityCards[bottomCityCard].color;
          prevState.cityObjects[bottomCityCard].diseaseCubes[disease] = d;
          Games.update(gameId, {
            $set: {
              cityObjects: prevState.cityObjects,
            },
          });
          assert.isNull(Meteor.call('games.drawPlayerCard', gameId));
          const {
            cityObjects,
            infectionIndex,
            infectionDrawPile,
            infectionDiscardPile,
            numOutbreaks,
            diseaseCubesLeft,
          } = Games.findOne(gameId);
          assert.equal(cityObjects[bottomCityCard].diseaseCubes[disease], 3);
          assert.equal(numOutbreaks, d > 0 ? 1 : 0);
          assert.equal(infectionIndex, 1);
          assert.isEmpty(infectionDiscardPile);
          assert.deepEqual(
            new Set(infectionDrawPile.slice(29)),
            new Set(citiesArray.slice(30).concat(bottomCityCard))
          );
          const expectedDiseaseCubesLeft = [
            NUM_STARTING_CUBES,
            NUM_STARTING_CUBES,
            NUM_STARTING_CUBES,
            NUM_STARTING_CUBES,
          ];
          const cubesPlacedOnBottomCity = 3 - d;
          const cubesOnOutbrokenCities =
            d > 0 ? CityCards[bottomCityCard].neighbors.length : 0;
          expectedDiseaseCubesLeft[disease] =
            NUM_STARTING_CUBES -
            cubesPlacedOnBottomCity -
            cubesOnOutbrokenCities;
          assert.deepEqual(expectedDiseaseCubesLeft, diseaseCubesLeft);
        });
      }

      it('updates diseaseStatus on cure', () => {
        const { cityObjects, diseaseCubesLeft } = Games.findOne(gameId);
        // Simulate infection
        cityObjects[MUMBAI].diseaseCubes[BLACK] = 1;
        diseaseCubesLeft[BLACK] -= 1;
        Games.update(gameId, { $set: { cityObjects, diseaseCubesLeft } });

        Meteor.call('games.cure', gameId, BLACK);
        const { diseaseStatus } = Games.findOne(gameId);
        assert.equal(diseaseStatus[BLACK], CURED);
        [RED, YELLOW, BLUE].forEach((color) => {
          assert.equal(diseaseStatus[color], UNCURED);
        });
      });

      it('eradicates on cure if no cubes of that color', () => {
        Meteor.call('games.cure', gameId, BLACK);
        const { diseaseStatus } = Games.findOne(gameId);
        assert.equal(diseaseStatus[BLACK], ERADICATED);
        [RED, YELLOW, BLUE].forEach((color) => {
          assert.equal(diseaseStatus[color], UNCURED);
        });
      });

      it('integrates between cure and treat', () => {
        const { cityObjects, diseaseCubesLeft } = Games.findOne(gameId);

        // Add 3 to London
        cityObjects[LONDON].diseaseCubes[RED] = 3;
        diseaseCubesLeft[RED] -= 3;
        Games.update(gameId, { $set: { cityObjects, diseaseCubesLeft } });

        Meteor.call('games.cure', gameId, RED);
        Meteor.call('games.treatDisease', gameId, LONDON, RED);
        const { cityObjects: updatedCityObjects } = Games.findOne(gameId);
        assert.equal(updatedCityObjects[LONDON].diseaseCubes[RED], 0);
      });

      it('eradicates properly', () => {
        const { diseaseStatus, cityObjects, diseaseCubesLeft } = Games.findOne(
          gameId
        );
        const colors = [YELLOW, BLUE];
        colors.forEach((color) => {
          cityObjects[SYDNEY].diseaseCubes[color] = 1;
          diseaseCubesLeft[color] -= 1;
        });
        diseaseStatus[YELLOW] = CURED;
        Games.update(gameId, {
          $set: { cityObjects, diseaseCubesLeft, diseaseStatus },
        });
        colors.forEach((color) => {
          Meteor.call('games.treatDisease', gameId, SYDNEY, color);
        });
        const {
          diseaseStatus: newDiseaseStatus,
          cityObjects: newCityObjects,
        } = Games.findOne(gameId);
        assert.equal(newCityObjects[SYDNEY].diseaseCubes[YELLOW], 0);
        assert.equal(newDiseaseStatus[YELLOW], ERADICATED);
        assert.equal(newDiseaseStatus[BLUE], UNCURED);
      });

      it('does not infect when eradicated', () => {
        const { diseaseStatus } = Games.findOne(gameId);
        diseaseStatus[BLUE] = diseaseStatus[RED] = ERADICATED;
        Games.update(gameId, { $set: { diseaseStatus } });
        const discarded = Meteor.call('games.infect', gameId);
        const { cityObjects } = Games.findOne(gameId);
        discarded.forEach((city) => {
          const { color } = CityCards[city];
          const eradicated = color === BLUE || color === RED;
          assert.equal(
            cityObjects[city].diseaseCubes[color],
            eradicated ? 0 : 1
          );
        });
      });

      it('infects two cities and then treats both of them', () => {
        const game = Games.findOne(gameId);
        assert.isNotNull(game);
        const { diseaseCubesLeft, cityObjects } = game;

        // No disease cubes have been placed anywhere at the start of the game
        assert.deepEqual(diseaseCubesLeft, [24, 24, 24, 24]);

        // Calling infect and retrieving non-deterministic discard
        let newInfectionDiscardPile = Meteor.call('games.infect', gameId);

        // These are the two cities that were infected in the above call
        let cardOne = newInfectionDiscardPile[0];
        let cardTwo = newInfectionDiscardPile[1];

        // Both cities initially had no disease cubes of any colors on it
        let cityOneDiseaseCubes = [0, 0, 0, 0];
        let cityTwoDiseaseCubes = [0, 0, 0, 0];
        assert.deepEqual(
          cityOneDiseaseCubes,
          cityObjects[cardOne].diseaseCubes
        );
        assert.deepEqual(
          cityTwoDiseaseCubes,
          cityObjects[cardTwo].diseaseCubes
        );

        // Doling out disease cubes based on the color of cities that were infected
        newInfectionDiscardPile.forEach((cityInfected) => {
          const { color } = CityCards[cityInfected];
          diseaseCubesLeft[color] -= 1;
        });

        // Getting new game state
        let {
          diseaseCubesLeft: newDiseaseCubesLeft,
          cityObjects: cityObjectsNew,
        } = Games.findOne(gameId);

        cityOneDiseaseCubes[CityCards[cardOne].color] += 1;
        cityTwoDiseaseCubes[CityCards[cardTwo].color] += 1;

        let cityOneNew = cityObjectsNew[cardOne];

        let cityTwoNew = cityObjectsNew[cardTwo];

        // The proper number of disease cubes of each color are remaining, and therefore have been doled out
        assert.deepEqual(diseaseCubesLeft, newDiseaseCubesLeft);
        // Each city must have the right number of disease cubes of its color on it
        assert.deepEqual(cityOneDiseaseCubes, cityOneNew.diseaseCubes);
        assert.deepEqual(cityTwoDiseaseCubes, cityTwoNew.diseaseCubes);

        // Now treating disease at one of the cities
        Meteor.call(
          'games.treatDisease',
          gameId,
          cardOne,
          CityCards[cardOne].color
        );
        // Getting new game state
        let {
          diseaseCubesLeft: newDiseaseCubesLeft2,
          cityObjects: cityObjectsNew2,
        } = Games.findOne(gameId);
        //Putting disease cubes back in the pile of cubes
        diseaseCubesLeft[CityCards[cardOne].color] += 1;
        // Number of disease cubes left is accurate
        assert.deepEqual(diseaseCubesLeft, newDiseaseCubesLeft2);
        // City should have no disease cubes of any color on it now
        assert.deepEqual([0, 0, 0, 0], cityObjectsNew2[cardOne].diseaseCubes);

        // Treating disease on the second city
        Meteor.call(
          'games.treatDisease',
          gameId,
          cardTwo,
          CityCards[cardTwo].color
        );
        // Getting new game state
        const {
          diseaseCubesLeft: newDiseaseCubesLeft3,
          cityObjects: cityObjectsNew3,
        } = Games.findOne(gameId);
        //Putting disease cubes back in the pile of cubes
        diseaseCubesLeft[CityCards[cardTwo].color] += 1;
        // Number of disease cubes left is accurate
        assert.deepEqual(diseaseCubesLeft, newDiseaseCubesLeft3);
        // City should have no disease cubes of any color on it now
        assert.deepEqual([0, 0, 0, 0], cityObjectsNew3[cardTwo].diseaseCubes);
      });

      it('infects the same city four times and causes an outbreak', () => {
        const {
          cityObjects,
          infectionDrawPile,
          diseaseCubesLeft,
        } = Games.findOne(gameId);
        assert.deepEqual(diseaseCubesLeft, [24, 24, 24, 24]);
        assert.equal(cityObjects[RIYADH].diseaseCubes[BLACK], 0);

        // Add 3 to RIYADH and then priming it to be the first drawn card so the outbreak will happen there
        cityObjects[RIYADH].diseaseCubes[BLACK] = 3;
        diseaseCubesLeft[BLACK] -= 3;
        let indexRiyadh = infectionDrawPile.indexOf(RIYADH);
        infectionDrawPile.splice(indexRiyadh, 1);
        infectionDrawPile.push(RIYADH);
        Games.update(gameId, {
          $set: { cityObjects, infectionDrawPile, diseaseCubesLeft },
        });
        let {
          cityObjects: cityObjects2,
          infectionDrawPile: infectionDrawPile2,
        } = Games.findOne(gameId);
        assert.equal(cityObjects2[RIYADH].diseaseCubes[BLACK], 3);
        assert.deepEqual(diseaseCubesLeft, [21, 24, 24, 24]);
        assert.equal(infectionDrawPile2[infectionDrawPile2.length - 1], RIYADH);

        // Calling infect and retrieving non-deterministic discard
        let newInfectionDiscardPile = Meteor.call('games.infect', gameId);

        // These are the two cities that were infected in the above call
        let cardOne = newInfectionDiscardPile[0];
        assert.equal(cardOne, RIYADH);
        let cardTwo = newInfectionDiscardPile[1];
        let cityOneDiseaseCubes = [0, 0, 0, 0];
        cityOneDiseaseCubes[BLACK] = 3;
        let cityTwoDiseaseCubes = [0, 0, 0, 0];
        assert.deepEqual(
          cityOneDiseaseCubes,
          cityObjects[cardOne].diseaseCubes
        );
        assert.deepEqual(
          cityTwoDiseaseCubes,
          cityObjects[cardTwo].diseaseCubes
        );

        diseaseCubesLeft[CityCards[cardTwo].color] -= 1;

        let {
          diseaseCubesLeft: diseaseCubesLeft3,
          cityObjects: cityObjects3,
        } = Games.findOne(gameId);

        let colorOutbreak = CityCards[cardOne].color;
        CityCards[cardOne].neighbors.forEach((neighborCity) => {
          diseaseCubesLeft[colorOutbreak] -= 1;
          let numCubesCity = [0, 0, 0, 0];
          numCubesCity[colorOutbreak] += 1;

          if (neighborCity !== cardTwo) {
            assert.deepEqual(
              cityObjects3[neighborCity].diseaseCubes,
              numCubesCity
            );
          } else {
            numCubesCity[CityCards[cardTwo].color] += 1;
            assert.deepEqual(
              cityObjects3[neighborCity].diseaseCubes,
              numCubesCity
            );
          }
        });

        if (!CityCards[cardOne].neighbors.includes(cardTwo)) {
          let numCubesCity = [0, 0, 0, 0];
          numCubesCity[CityCards[cardTwo].color] += 1;
          assert.deepEqual(cityObjects3[cardTwo].diseaseCubes, numCubesCity);
        }

        assert.deepEqual(diseaseCubesLeft3, diseaseCubesLeft);
      });

      it('creates a two-city outbreak chain but does not loop', () => {
        const { cityObjects } = Games.findOne(gameId);
        cityObjects[ATLANTA].diseaseCubes[BLUE] = 3;
        cityObjects[MIAMI].diseaseCubes[YELLOW] = 3;
        cityObjects[WASHINGTON].diseaseCubes[BLUE] = 3;
        // Add ATLANTA and a dummy (RIYADH) to the top of the deck
        Games.update(gameId, {
          $push: { infectionDrawPile: { $each: [RIYADH, ATLANTA] } },
          $set: { cityObjects },
        });
        Meteor.call('games.infect', gameId);
        const { cityObjects: updatedCities, numOutbreaks } = Games.findOne(
          gameId
        );
        assert.equal(numOutbreaks, 2);
        assert.equal(updatedCities[ATLANTA].diseaseCubes[BLUE], 3);
        assert.equal(updatedCities[ATLANTA].diseaseCubes[YELLOW], 0);
        assert.equal(updatedCities[MIAMI].diseaseCubes[BLUE], 2);
        assert.equal(updatedCities[MIAMI].diseaseCubes[YELLOW], 3);
        assert.equal(updatedCities[WASHINGTON].diseaseCubes[BLUE], 3);
        assert.equal(updatedCities[WASHINGTON].diseaseCubes[YELLOW], 0);
        assert.equal(updatedCities[CHICAGO].diseaseCubes[BLUE], 1);
        assert.equal(updatedCities[MONTREAL].diseaseCubes[BLUE], 1);
      });

      it('wins game when all four diseases are cured', () => {
        const diseaseStatus = [CURED, CURED, CURED, CURED];
        diseaseStatus[BLACK] = UNCURED;
        Games.update(gameId, { $set: { diseaseStatus } });
        Meteor.call('games.cure', gameId, BLACK);
        const { stage } = Games.findOne(gameId);
        assert.equal(stage, WON);
      });

      it('loses game when we run out of player cards', () => {
        const { playerDrawPile } = Games.findOne(gameId);
        Games.update(gameId, {
          $set: {
            playerDrawPile: [],
            playerDiscardPile: playerDrawPile.slice(),
          },
        });
        Meteor.call('games.drawPlayerCard', gameId);
        Meteor.call('games.nextTurn', gameId);
        const { stage } = Games.findOne(gameId);
        assert.equal(stage, LOST);
      });

      it('loses game when we run out of disease cubes', () => {
        const { infectionDrawPile } = Games.findOne(gameId);
        const diseaseCubesLeft = [0, 0, 0, 0];
        const topCard = infectionDrawPile[infectionDrawPile.length - 1];
        diseaseCubesLeft[CityCards[topCard].color] = 1;
        Games.update(gameId, { $set: { diseaseCubesLeft } });
        Meteor.call('games.infect', gameId);
        const { stage } = Games.findOne(gameId);
        assert.equal(stage, LOST);
      });

      it('loses game when we reach 8 outbreaks', () => {
        const { infectionDrawPile, cityObjects } = Games.findOne(gameId);
        const topCard = infectionDrawPile[infectionDrawPile.length - 1];
        const { color } = CityCards[topCard];
        cityObjects[topCard].diseaseCubes[color] = 3;
        Games.update(gameId, { $set: { numOutbreaks: 7, cityObjects } });
        Meteor.call('games.infect', gameId);
        Meteor.call('games.nextTurn', gameId);
        const { stage } = Games.findOne(gameId);
        assert.equal(stage, LOST);
      });

      it('one quiet night works', () => {
        // Expected
        Meteor.call('games.oneQuietNight', gameId);
        const {
          quietNight,
          numTurns,
          cityObjects,
          diseaseCubesLeft,
          infectionDrawPile,
          infectionDiscardPile,
        } = Games.findOne(gameId);
        assert.equal(quietNight, numTurns);

        Meteor.call('games.infect', gameId);
        const {
          cityObjects: newCities,
          diseaseCubesLeft: newCubes,
          infectionDrawPile: newDraw,
          infectionDiscardPile: newDiscard,
        } = Games.findOne(gameId);
        assert.deepEqual(newCities, cityObjects);
        assert.deepEqual(newCubes, diseaseCubesLeft);
        assert.deepEqual(newDraw, infectionDrawPile);
        assert.deepEqual(newDiscard, infectionDiscardPile);

        // Unexpected
        assert.throws(
          () => Meteor.call('games.oneQuietNight', gameId),
          Meteor.Error
        );
      });

      it('population is quite resilient', () => {
        Meteor.call('games.infect', gameId);
        Meteor.call('games.infect', gameId);
        const { infectionDiscardPile, infectionDrawPile } = Games.findOne(
          gameId
        );
        const [card0, card1, card2, card3] = infectionDiscardPile;
        const [card4] = infectionDrawPile;
        // Expected
        Meteor.call('games.resilientPopulation', gameId, card0);
        Meteor.call('games.resilientPopulation', gameId, card3);
        const { infectionDiscardPile: newDiscardPile } = Games.findOne(gameId);
        assert.equal(newDiscardPile.length, 2);
        assert.deepEqual(newDiscardPile, [card1, card2]);
        // Unexpected
        assert.throws(
          () => Meteor.call('games.resilientPopulation', gameId, card4),
          Meteor.Error
        );
      });

      it('forecasts correctly', () => {
        // Look
        const { infectionDrawPile } = Games.findOne(gameId);
        const forecast = Meteor.call('games.forecastLook', gameId);
        assert.equal(forecast.length, 6);
        assert.deepEqual(forecast, infectionDrawPile.slice(-6));
        // Rearrange (expected)
        const rearranged = _.shuffle(forecast);
        Meteor.call('games.forecastRearrange', gameId, rearranged);
        const { infectionDrawPile: newPile } = Games.findOne(gameId);
        assert.equal(newPile.length, infectionDrawPile.length);
        assert.deepEqual(new Set(newPile.slice(-6)), new Set(rearranged));
        // Rearrange (unexpected)
        assert.throws(
          () =>
            Meteor.call('games.forecastRearrange', gameId, rearranged.slice(5)),
          Meteor.Error
        );
        assert.throws(
          () =>
            Meteor.call(
              'games.forecastRearrange',
              gameId,
              rearranged.slice(5).concat(infectionDrawPile[0])
            ),
          Meteor.Error
        );
      });

      it('assigns roles to players', () => {
        players.forEach((p) => {
          Players.insert({
            _id: p,
            gameId,
          });
        });
        Meteor.call('games.initialize', gameId, initialPlayerOrder);
        const { playerOrder } = Games.findOne(gameId);

        let assignedRoles = [];
        playerOrder.forEach((playerId) => {
          const { role } = Players.findOne(playerId);
          assignedRoles.push(role);
        });

        assert.equal(assignedRoles.length, 4);

        assignedRoles.forEach((role) => {
          assert.isTrue(rolesArray.includes(role));
        });

        assert.isTrue(new Set(assignedRoles).size === assignedRoles.length);
      });

      it('quarantine specialist prevents infections to nearby cities', () => {
        players.forEach((p) => {
          Players.insert({
            _id: p,
            gameId,
          });
        });
        Meteor.call('games.initialize', gameId, initialPlayerOrder);

        const game = Games.findOne(gameId);
        assert.isNotNull(game);
        const { diseaseCubesLeft, cityObjects, playerOrder } = game;

        playerOrder.forEach((playerId) => {
          Players.update(playerId, {
            $set: { role: QUARANTINE_SPECIALIST, location: MONTREAL },
          });
        });

        // Game has been initalized with 18 disease cubes doled outt
        assert.deepEqual(diseaseCubesLeft, [24, 24, 6, 24]);

        // Calling infect and retrieving non-deterministic discard
        let newInfectionDiscardPile = Meteor.call('games.infect', gameId);

        // These are the two cities that were infected in the above call
        let cardOne =
          newInfectionDiscardPile[newInfectionDiscardPile.length - 2];
        let cardTwo =
          newInfectionDiscardPile[newInfectionDiscardPile.length - 1];

        // Both cities initially had no disease cubes of any colors on it
        let cityOneDiseaseCubes = [0, 0, 0, 0];
        let cityTwoDiseaseCubes = [0, 0, 0, 0];
        assert.deepEqual(
          cityOneDiseaseCubes,
          cityObjects[cardOne].diseaseCubes
        );
        assert.deepEqual(
          cityTwoDiseaseCubes,
          cityObjects[cardTwo].diseaseCubes
        );

        // Disease cubes left do not go down because quarantine specialist protects both cities

        // Getting new game state
        let {
          diseaseCubesLeft: newDiseaseCubesLeft,
          cityObjects: cityObjectsNew,
        } = Games.findOne(gameId);

        // Disease cubes on cities do not go up because quarantine specialist protects both cities

        let cityOneNew = cityObjectsNew[cardOne];

        let cityTwoNew = cityObjectsNew[cardTwo];

        // The proper number of disease cubes of each color are remaining, and therefore have been doled out
        assert.deepEqual(newDiseaseCubesLeft, diseaseCubesLeft);
        // Each city must have the right number of disease cubes of its color on it
        assert.deepEqual(cityOneNew.diseaseCubes, cityOneDiseaseCubes);
        assert.deepEqual(cityTwoNew.diseaseCubes, cityTwoDiseaseCubes);
      });

      it('medic prevents cities from being infected with cured disease', () => {
        players.forEach((p) => {
          Players.insert({
            _id: p,
            gameId,
          });
        });
        Meteor.call('games.initialize', gameId, initialPlayerOrder);

        const game = Games.findOne(gameId);
        assert.isNotNull(game);
        const { diseaseCubesLeft, cityObjects, playerOrder } = game;

        playerOrder.forEach((playerId) => {
          Players.update(playerId, {
            $set: { role: MEDIC, location: MONTREAL },
          });
        });
        const diseaseStatus = [UNCURED, UNCURED, UNCURED, UNCURED];
        diseaseStatus[BLUE] = CURED;
        Games.update(gameId, { $set: { diseaseStatus } });

        // Game has been initalized with 18 disease cubes doled outt
        assert.deepEqual(diseaseCubesLeft, [24, 24, 6, 24]);

        // Calling infect and retrieving non-deterministic discard
        let newInfectionDiscardPile = Meteor.call('games.infect', gameId);

        // These are the two cities that were infected in the above call
        let cardOne =
          newInfectionDiscardPile[newInfectionDiscardPile.length - 2];
        let cardTwo =
          newInfectionDiscardPile[newInfectionDiscardPile.length - 1];

        // Both cities initially had no disease cubes of any colors on it
        let cityOneDiseaseCubes = [0, 0, 0, 0];
        let cityTwoDiseaseCubes = [0, 0, 0, 0];
        assert.deepEqual(
          cityOneDiseaseCubes,
          cityObjects[cardOne].diseaseCubes
        );
        assert.deepEqual(
          cityTwoDiseaseCubes,
          cityObjects[cardTwo].diseaseCubes
        );

        // First city has medic on it, so it is not infected with cured disease. Second city gets infected
        let { color: colorTwo } = CityCards[cardTwo];
        diseaseCubesLeft[colorTwo] -= 1;

        // Getting new game state
        let {
          diseaseCubesLeft: newDiseaseCubesLeft,
          cityObjects: cityObjectsNew,
        } = Games.findOne(gameId);

        // Only the second city gets infected
        cityTwoDiseaseCubes[CityCards[cardTwo].color] += 1;

        let cityOneNew = cityObjectsNew[cardOne];

        let cityTwoNew = cityObjectsNew[cardTwo];

        // The proper number of disease cubes of each color are remaining, and therefore have been doled out
        assert.deepEqual(newDiseaseCubesLeft, diseaseCubesLeft);
        // Each city must have the right number of disease cubes of its color on it
        assert.deepEqual(cityOneNew.diseaseCubes, cityOneDiseaseCubes);
        assert.deepEqual(cityTwoNew.diseaseCubes, cityTwoDiseaseCubes);
      });

      it('remove event card works', () => {
        const cards = [AIRLIFT];
        Meteor.call('games.discardPlayerCard', gameId, ...cards);
        const { playerDiscardPile: oldPlayerDiscardPile } = Games.findOne(
          gameId
        );
        assert.deepEqual(oldPlayerDiscardPile, cards);
        Meteor.call('games.removeEventCard', gameId, AIRLIFT);
        const { playerDiscardPile } = Games.findOne(gameId);
        assert.isEmpty(playerDiscardPile);
      });

      it('treatDisease medic check', () => {
        const { cityObjects, diseaseCubesLeft } = Games.findOne(gameId);

        // Add 3 to London
        cityObjects[LONDON].diseaseCubes[RED] = 3;
        diseaseCubesLeft[RED] -= 3;

        Games.update(gameId, { $set: { diseaseCubesLeft, cityObjects } });

        Meteor.call('games.treatDisease', gameId, LONDON, RED, true);
        const {
          cityObjects: updatedCityObjects,
          diseaseCubesLeft: updatedDiseaseCubesLeft,
        } = Games.findOne(gameId);
        assert.equal(updatedCityObjects[LONDON].diseaseCubes[RED], 0);
        assert.equal(updatedDiseaseCubesLeft[RED], NUM_STARTING_CUBES);
      });

      it('autoTreat check', () => {
        const { cityObjects, diseaseCubesLeft } = Games.findOne(gameId);

        // Add 3 to London
        cityObjects[LONDON].diseaseCubes[RED] = 3;
        diseaseCubesLeft[RED] -= 3;
        cityObjects[LONDON].diseaseCubes[BLACK] = 1;
        diseaseCubesLeft[BLACK] -= 1;
        cityObjects[LONDON].diseaseCubes[YELLOW] = 2;
        diseaseCubesLeft[YELLOW] -= 2;
        cityObjects[LONDON].diseaseCubes[BLUE] = 0;
        Games.update(gameId, { $set: { cityObjects, diseaseCubesLeft } });

        Meteor.call('games.cure', gameId, RED);
        Meteor.call('games.cure', gameId, BLACK);
        Meteor.call('games.autoTreat', gameId, LONDON);
        const { cityObjects: updatedCityObjects } = Games.findOne(gameId);
        assert.equal(updatedCityObjects[LONDON].diseaseCubes[RED], 0);
        assert.equal(updatedCityObjects[LONDON].diseaseCubes[BLACK], 0);
        assert.equal(updatedCityObjects[LONDON].diseaseCubes[YELLOW], 2);
        assert.equal(updatedCityObjects[LONDON].diseaseCubes[BLUE], 0);
      });
    });
  });
}
