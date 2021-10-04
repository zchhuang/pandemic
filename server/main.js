import { Meteor } from 'meteor/meteor';
import { Games } from '../imports/api/games.js';
import { Players } from '../imports/api/players.js';

const TTL = 604800;

Meteor.startup(() => {
  // Indices for fast `find()` operations
  Players._ensureIndex({ gameId: 1, username: 1 });
  Players._ensureIndex({ gameId: 1, present: 1, createdAt: -1 });

  // Deleting documents after TTL seconds
  Games._ensureIndex({ creationDate: 1 }, { expireAfterSeconds: TTL });
  Players._ensureIndex({ creationDate: 1 }, { expireAfterSeconds: TTL });
});
