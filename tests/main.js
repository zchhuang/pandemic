import assert from 'assert';
import '../imports/constants/cards.tests';
import '../imports/api/games.tests';
import '../imports/api/players.tests';
import { Meteor } from 'meteor/meteor';

describe('meteor-todos', function () {
  it('package.json has correct name', async function () {
    const { name } = await import('../package.json');
    assert.strictEqual(name, 'meteor-todos');
  });

  if (Meteor.isClient) {
    it('client is not server', function () {
      assert.strictEqual(Meteor.isServer, false);
    });
  }

  if (Meteor.isServer) {
    it('server is not client', function () {
      assert.strictEqual(Meteor.isClient, false);
    });
  }
});
