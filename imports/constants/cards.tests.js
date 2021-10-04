import { CityCards } from '../constants/cards';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { BLACK, RED, BLUE, YELLOW } from '../constants/diseases';
import { assert } from 'chai';

describe('CityCard graph', () => {
  it('has its neighbors match up', () => {
    if (Meteor.isServer) {
      for (const city in CityCards) {
        const { neighbors } = CityCards[city];
        neighbors.forEach((neighbor) => {
          const { neighbors: neighborNeighbors } = CityCards[neighbor];
          assert.isTrue(
            neighborNeighbors.includes(city),
            `${neighbor}'s neighbors (${neighborNeighbors}) does not contain ${city}`
          );
        });
      }
    }
  });

  it('has reasonable population', () => {
    for (const cityName in CityCards) {
      const { population } = CityCards[cityName];
      check(population, Number);
      assert.isTrue(population >= 0);
    }
  });

  it('has correct enum for color', () => {
    const allColors = [BLACK, RED, BLUE, YELLOW];
    for (const cityName in CityCards) {
      const { color } = CityCards[cityName];
      assert.isTrue(allColors.includes(color));
    }
  });
});
