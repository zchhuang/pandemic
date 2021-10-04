import { Meteor } from 'meteor/meteor';
import { assert, expect } from 'chai';
import sinon from 'sinon';

import { Players, PlayerMethods, GameMethods } from './players';

import {
  ATLANTA,
  TOKYO,
  CHICAGO,
  LONDON,
  MADRID,
  MIAMI,
  PARIS,
  EPIDEMIC,
  AIRLIFT,
  ONE_QUIET_NIGHT,
  FORECAST,
  RESILIENT_POPULATION,
  GOVERNMENT_GRANT,
  SYDNEY,
} from '../constants/cards';

import {
  RESEARCHER,
  MEDIC,
  OPERATIONS_EXPERT,
  CONTINGENCY_PLANNER,
  DISPATCHER,
  SCIENTIST,
} from '../constants/roles';
import { BLUE } from '../constants/diseases';

const username = 'username';
const otherUsername = 'otherUsername';
const yetAnotherUsername = 'yetAnotherUsername';
const gameId = 'game_id';
let playerId;
let otherPlayerId;

if (Meteor.isServer) {
  describe('Players', () => {
    describe('methods', () => {
      beforeEach(() => {
        playerId = Meteor.call('players.create', username, gameId);
        sinon.stub(GameMethods, 'updateHistory');
        sinon.stub(GameMethods, 'currentPlayer').returns(playerId);
      });

      afterEach(() => {
        Players.remove({});
        sinon.restore();
      });

      it('players.create', () => {
        let player = Players.findOne(playerId);
        assert.isNotNull(player);
        assert.equal(player.username, username);
        assert.equal(player.gameId, gameId);
        assert.equal(player.actionsLeft, 4);
        expect(player.eventCards).to.be.empty;
        expect(player.cityCards).to.be.empty;
        assert.equal(player.location, ATLANTA);
      });

      it('players.create prevents duplicates', () => {
        expect(
          () => Meteor.call('players.create', username, gameId),
          'duplicate player should throw error'
        ).to.throw(Meteor.Error);
        let players = Players.find({ username, gameId }).fetch();
        let player = Players.findOne(playerId);
        assert.equal(players.length, 1, 'should have exactly one player in db');
        assert.deepEqual(players[0], player, 'players do not deeply match');
      });

      it('players.getStartingHand', () => {
        let stub = sinon.stub(PlayerMethods, 'drawPlayerCard');

        Meteor.call('players.getStartingHand', playerId, 4);
        assert.equal(stub.callCount, 2);
      });

      it('players.endTurn', () => {
        let stub1 = sinon.stub(PlayerMethods, 'drawPlayerCard');
        let stub2 = sinon.stub(GameMethods, 'nextTurn');
        let stub3 = sinon.stub(GameMethods, 'infect');

        Meteor.call('players.endTurn', playerId);
        assert.equal(stub1.callCount, 2);
        assert.equal(stub2.callCount, 1);
        assert.equal(stub3.callCount, 1);
        assert.equal(Players.findOne(playerId).actionsLeft, 4);
      });

      it('players.drawPlayerCard', () => {
        let stub = sinon.stub(GameMethods, 'drawPlayerCard');
        let stub2 = sinon.stub(PlayerMethods, 'getPlayerCard');
        stub.returns('test');
        Meteor.call('players.drawPlayerCard', playerId);

        assert.equal(stub.callCount, 1);
        assert.equal(stub2.callCount, 1);
      });

      it('players.drawPlayerCard endgame', () => {
        let stub = sinon.stub(GameMethods, 'drawPlayerCard');
        let stub2 = sinon.stub(PlayerMethods, 'getPlayerCard');
        stub.returns(null);
        Meteor.call('players.drawPlayerCard', playerId);

        assert.equal(stub.callCount, 1);
        assert.equal(stub2.callCount, 0);
      });

      it('players.playEvent', () => {
        const eventsInfo = {
          [AIRLIFT]: {
            eventStub: sinon.stub(PlayerMethods, 'airlift'),
            eventParams: { playerId: otherPlayerId, destination: LONDON },
            args: [otherPlayerId, LONDON],
          },
          [FORECAST]: {
            eventStub: sinon.stub(GameMethods, 'forecastRearrange'),
            eventParams: {
              cityCards: [TOKYO, LONDON, SYDNEY, ATLANTA, CHICAGO, MIAMI],
            },
            args: [gameId, [TOKYO, LONDON, SYDNEY, ATLANTA, CHICAGO, MIAMI]],
          },
          [ONE_QUIET_NIGHT]: {
            eventStub: sinon.stub(GameMethods, 'oneQuietNight'),
            eventParams: {},
            args: [gameId],
          },
          [RESILIENT_POPULATION]: {
            eventStub: sinon.stub(GameMethods, 'resilientPopulation'),
            eventParams: { infectionCard: TOKYO },
            args: [gameId, TOKYO],
          },
          [GOVERNMENT_GRANT]: {
            eventStub: sinon.stub(GameMethods, 'buildResearchStation'),
            eventParams: { city: SYDNEY },
            args: [gameId, SYDNEY],
          },
        };
        const discardStub1 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        const discardStub2 = sinon.stub(GameMethods, 'discardPlayerCard');

        Object.entries(eventsInfo).forEach(
          ([eventCard, { eventStub, eventParams, args }], i) => {
            Meteor.call('players.playEvent', playerId, eventCard, eventParams);
            assert.equal(eventStub.callCount, 1, `${eventCard} fn not called`);
            assert.isTrue(discardStub1.calledWith(playerId, eventCard));
            assert.isTrue(discardStub2.calledWith(gameId, eventCard));
            assert.isTrue(
              eventStub.calledWith(...args),
              `${eventCard} fn did not call expected args ${args}`
            );
            assert.equal(discardStub1.callCount, i + 1);
            assert.equal(discardStub2.callCount, i + 1);
          }
        );
      });

      it('players.airlift success', () => {
        Meteor.call('players.airlift', playerId, LONDON);
        const { location } = Players.findOne(playerId);
        assert.equal(location, LONDON);
      });

      it('players.airlift same destination as current', () => {
        assert.throws(
          () => Meteor.call('players.airlift', playerId, ATLANTA),
          Meteor.Error
        );
      });

      it('players.buildResearchStation success', () => {
        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(GameMethods, 'buildResearchStation');
        stub1.returns(false);
        Meteor.call('players.buildResearchStation', playerId);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 1);
        assert.equal(stub3.callCount, 1);
        let player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 3);
      });

      it('players.buildResearchStation already with researchstation', () => {
        let stub = sinon.stub(GameMethods, 'hasResearchStation');
        stub.returns(true);
        expect(() => {
          Meteor.call('players.buildResearchStation', playerId);
        }).to.throw(Meteor.Error);
        let player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 4);
      });

      it('players.shareKnowledge success', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        Players.update(playerId, {
          $set: { cityCards: [TOKYO], location: TOKYO },
        });
        Players.update(otherPlayerId, { $set: { location: TOKYO } });

        let stub1 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(PlayerMethods, 'getPlayerCard');
        Meteor.call(
          'players.shareKnowledge',
          playerId,
          otherPlayerId,
          TOKYO,
          true
        );

        let stub1playerId = stub1.getCall(0).args[0];
        let stub1cityCard = stub1.getCall(0).args[1];
        let stub2otherPlayerId = stub2.getCall(0).args[0];
        let stub2cityCard = stub2.getCall(0).args[1];

        assert.equal(stub1playerId, playerId);
        assert.equal(stub2otherPlayerId, otherPlayerId);
        assert.equal(stub1cityCard, TOKYO);
        assert.equal(stub2cityCard, TOKYO);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 1);
        let player = Players.findOne(playerId);
        let otherPlayer = Players.findOne(otherPlayerId);
        assert.equal(player.actionsLeft, 3);
        assert.equal(otherPlayer.actionsLeft, 4);
      });

      it('players.shareKnowledge otherPlayer giving', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        Players.update(otherPlayerId, {
          $set: { cityCards: [TOKYO], location: TOKYO },
        });
        Players.update(playerId, { $set: { location: TOKYO } });

        let stub1 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(PlayerMethods, 'getPlayerCard');
        Meteor.call(
          'players.shareKnowledge',
          otherPlayerId,
          playerId,
          TOKYO,
          false
        );

        let stub1playerId = stub1.getCall(0).args[0];
        let stub1cityCard = stub1.getCall(0).args[1];
        let stub2otherPlayerId = stub2.getCall(0).args[0];
        let stub2cityCard = stub2.getCall(0).args[1];

        assert.equal(stub1playerId, otherPlayerId);
        assert.equal(stub2otherPlayerId, playerId);
        assert.equal(stub1cityCard, TOKYO);
        assert.equal(stub2cityCard, TOKYO);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 1);
        let player = Players.findOne(playerId);
        let otherPlayer = Players.findOne(otherPlayerId);
        assert.equal(player.actionsLeft, 3);
        assert.equal(otherPlayer.actionsLeft, 4);
      });

      it('players.shareKnowledge wrong city card', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        Players.update(playerId, {
          $set: { cityCards: [ATLANTA], location: TOKYO },
        });
        Players.update(otherPlayerId, { $set: { location: TOKYO } });

        let stub = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(PlayerMethods, 'getPlayerCard');
        expect(() => {
          Meteor.call(
            'players.shareKnowledge',
            playerId,
            otherPlayerId,
            ATLANTA,
            true
          );
        }).to.throw(Meteor.Error);
        assert.equal(stub.callCount, 0);
        assert.equal(stub2.callCount, 0);
        let player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 4);
      });

      it('players.shareKnowledge different locations', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        Players.update(playerId, {
          $set: { cityCards: [TOKYO], location: TOKYO },
        });
        Players.update(otherPlayerId, { $set: { location: ATLANTA } });

        let stub = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(PlayerMethods, 'getPlayerCard');
        expect(() => {
          Meteor.call(
            'players.shareKnowledge',
            playerId,
            otherPlayerId,
            TOKYO,
            true
          );
        }).to.throw(Meteor.Error);
        assert.equal(stub.callCount, 0);
        assert.equal(stub2.callCount, 0);
        let player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 4);
      });

      it('players.shareKnowledge sharer in wrong city', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        Players.update(playerId, {
          $set: { cityCards: [ATLANTA], location: TOKYO },
        });
        Players.update(otherPlayerId, { $set: { location: ATLANTA } });

        let stub = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(PlayerMethods, 'getPlayerCard');
        expect(() => {
          Meteor.call(
            'players.shareKnowledge',
            playerId,
            otherPlayerId,
            ATLANTA,
            true
          );
        }).to.throw(Meteor.Error);
        assert.equal(stub.callCount, 0);
        assert.equal(stub2.callCount, 0);
        let player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 4);
      });

      it('players.getPlayerCard event', () => {
        Meteor.call('players.getPlayerCard', playerId, AIRLIFT);
        let player = Players.findOne(playerId);
        assert.equal(player.eventCards.length, 1);
        assert.equal(player.cityCards.length, 0);
      });

      it('players.getPlayerCard city', () => {
        Meteor.call('players.getPlayerCard', playerId, ATLANTA);
        let player = Players.findOne(playerId);
        assert.equal(player.eventCards.length, 0);
        assert.equal(player.cityCards.length, 1);
      });

      it('players.getPlayerCard invalid', () => {
        expect(() => {
          Meteor.call('players.getPlayerCard', playerId, EPIDEMIC);
        }).to.throw(Meteor.Error);
        let player = Players.findOne(playerId);
        assert.equal(player.eventCards.length, 0);
        assert.equal(player.cityCards.length, 0);
      });

      it('players.getPlayerCard handsize', () => {
        // TODO: figure out the over 7 cards logic first
      });

      it('players.discardPlayerCard city', () => {
        Players.update(playerId, { $set: { cityCards: [ATLANTA] } });
        let player = Players.findOne(playerId);
        assert.equal(player.cityCards.length, 1);

        Meteor.call('players.discardPlayerCard', playerId, ATLANTA);
        player = Players.findOne(playerId);
        assert.equal(player.cityCards.length, 0);
      });

      it('players.discardPlayerCard event', () => {
        Players.update(playerId, { $set: { eventCards: [AIRLIFT] } });
        let player = Players.findOne(playerId);
        assert.equal(player.eventCards.length, 1);

        Meteor.call('players.discardPlayerCard', playerId, AIRLIFT);
        player = Players.findOne(playerId);
        assert.equal(player.eventCards.length, 0);
      });

      it('players.discardPlayerCard empty hand', () => {
        expect(() => {
          Meteor.call('players.discardPlayerCard', playerId, EPIDEMIC);
        }).to.throw(Meteor.Error);
        expect(() => {
          Meteor.call('players.discardPlayerCard', playerId, AIRLIFT);
        }).to.throw(Meteor.Error);
        expect(() => {
          Meteor.call('players.discardPlayerCard', playerId, ATLANTA);
        }).to.throw(Meteor.Error);
      });

      it('players.move success', () => {
        let stub = sinon.stub(GameMethods, 'autoTreat');
        Meteor.call('players.move', playerId, MIAMI, playerId);
        let player = Players.findOne(playerId);

        assert.equal(player.location, MIAMI);
        assert.equal(player.actionsLeft, 3);
        assert.equal(stub.callCount, 0);
      });

      it('players.move failure bad controller', () => {
        let stub = sinon.stub(GameMethods, 'autoTreat');
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        expect(() => {
          Meteor.call('players.move', playerId, MIAMI, otherPlayerId);
        }).to.throw(Meteor.Error);

        assert.equal(stub.callCount, 0);
      });

      it('players.move dispatcher', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        Players.update(otherPlayerId, { $set: { role: DISPATCHER } });
        let stub = sinon.stub(GameMethods, 'autoTreat');
        Meteor.call('players.move', playerId, MIAMI, otherPlayerId);

        let player = Players.findOne(playerId);
        let otherPlayer = Players.findOne(otherPlayerId);

        assert.equal(player.location, MIAMI);
        assert.equal(otherPlayer.actionsLeft, 3);
        assert.equal(stub.callCount, 0);
      });

      it('players.move medic', () => {
        Players.update(playerId, { $set: { role: MEDIC } });
        let stub = sinon.stub(GameMethods, 'autoTreat');
        Meteor.call('players.move', playerId, MIAMI, playerId);

        let player = Players.findOne(playerId);

        assert.equal(player.location, MIAMI);
        assert.equal(player.actionsLeft, 3);
        assert.equal(stub.callCount, 1);
      });

      it('players.drive success', () => {
        let stub = sinon.stub(PlayerMethods, 'move');

        Meteor.call('players.drive', playerId, MIAMI);

        assert.equal(stub.callCount, 1);
      });

      it('players.drive playerIdControl success', () => {
        let stub = sinon.stub(PlayerMethods, 'move');
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);

        Meteor.call('players.drive', playerId, MIAMI, otherPlayerId);

        assert.equal(stub.callCount, 1);
      });

      it('players.drive failure', () => {
        let stub = sinon.stub(PlayerMethods, 'move');

        expect(() => {
          Meteor.call('players.drive', playerId, TOKYO);
        }).to.throw(Meteor.Error);

        assert.equal(stub.callCount, 0);
      });

      it('players.shuttleFlight success', () => {
        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'move');

        stub1.returns(true);
        Meteor.call('players.shuttleFlight', playerId, TOKYO);

        assert.equal(stub2.callCount, 1);
      });

      it('players.shuttleFlight playerIdControl success', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'move');
        stub1.returns(true);
        Meteor.call('players.shuttleFlight', playerId, TOKYO, otherPlayerId);

        assert.equal(stub2.callCount, 1);
      });

      it('players.shuttleFlight failure', () => {
        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'move');

        stub1.returns(false);
        expect(() => {
          Meteor.call('players.shuttleFlight', playerId, TOKYO);
        }).to.throw(Meteor.Error);
        assert.equal(stub2.callCount, 0);
      });

      it('players.directFlight success', () => {
        let stub1 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(PlayerMethods, 'move');
        Players.update(playerId, { $set: { cityCards: [TOKYO] } });
        Meteor.call('players.directFlight', playerId, TOKYO);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 1);
        assert.equal(stub3.callCount, 1);
      });

      it('players.directFlight playerIdControl success', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        let stub1 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(PlayerMethods, 'move');
        Players.update(otherPlayerId, { $set: { cityCards: [TOKYO] } });
        Meteor.call('players.directFlight', playerId, TOKYO, otherPlayerId);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 1);
        assert.equal(stub3.callCount, 1);
      });

      it('players.charterFlight success', () => {
        let stub1 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(PlayerMethods, 'move');

        Players.update(playerId, { $set: { cityCards: [ATLANTA] } });
        Meteor.call('players.charterFlight', playerId, TOKYO);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 1);
        assert.equal(stub3.callCount, 1);
      });

      it('players.charterFlight playerIdControl success', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        let stub1 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(PlayerMethods, 'move');

        Players.update(otherPlayerId, { $set: { cityCards: [ATLANTA] } });
        Meteor.call('players.charterFlight', playerId, TOKYO, otherPlayerId);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 1);
        assert.equal(stub3.callCount, 1);
      });

      it('players.discoverCure success', () => {
        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub4 = sinon.stub(GameMethods, 'cure');
        stub1.returns(true);
        let player = Players.findOne(playerId);
        Players.update(playerId, {
          $set: { cityCards: [ATLANTA, MADRID, LONDON, PARIS, CHICAGO, TOKYO] },
        });
        Meteor.call('players.discoverCure', playerId, [
          ATLANTA,
          MADRID,
          LONDON,
          PARIS,
          CHICAGO,
        ]);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 5);
        assert.equal(stub3.callCount, 1);
        assert.equal(stub4.callCount, 1);
        player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 3);
      });

      it('players.discoverCure scientist success', () => {
        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub4 = sinon.stub(GameMethods, 'cure');
        stub1.returns(true);
        let player = Players.findOne(playerId);
        Players.update(playerId, {
          $set: {
            cityCards: [ATLANTA, MADRID, LONDON, CHICAGO, TOKYO],
            role: SCIENTIST,
          },
        });
        Meteor.call('players.discoverCure', playerId, [
          ATLANTA,
          MADRID,
          LONDON,
          CHICAGO,
        ]);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 4);
        assert.equal(stub3.callCount, 1);
        assert.equal(stub4.callCount, 1);
        player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 3);
      });

      it('players.discoverCure research station failure', () => {
        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub4 = sinon.stub(GameMethods, 'cure');
        stub1.returns(false);
        let player = Players.findOne(playerId);
        Players.update(playerId, {
          $set: { cityCards: [ATLANTA, MADRID, LONDON, PARIS, CHICAGO, TOKYO] },
        });
        expect(() => {
          Meteor.call('players.discoverCure', playerId, [
            ATLANTA,
            MADRID,
            LONDON,
            PARIS,
            CHICAGO,
          ]);
        }).to.throw(Meteor.Error);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 0);
        assert.equal(stub3.callCount, 0);
        assert.equal(stub4.callCount, 0);
        player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 4);
      });

      it('players.discoverCure card count failure', () => {
        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub4 = sinon.stub(GameMethods, 'cure');
        stub1.returns(true);
        let player = Players.findOne(playerId);
        Players.update(playerId, {
          $set: { cityCards: [ATLANTA, MADRID, LONDON, PARIS, CHICAGO, TOKYO] },
        });
        expect(() => {
          Meteor.call('players.discoverCure', playerId, [
            ATLANTA,
            MADRID,
            LONDON,
            PARIS,
            CHICAGO,
            TOKYO,
          ]);
        }).to.throw(Meteor.Error);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 0);
        assert.equal(stub3.callCount, 0);
        assert.equal(stub4.callCount, 0);
        player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 4);
      });

      it('players.discoverCure not same color failure', () => {
        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub4 = sinon.stub(GameMethods, 'cure');
        stub1.returns(true);
        let player = Players.findOne(playerId);
        Players.update(playerId, {
          $set: {
            cityCards: [ATLANTA, MADRID, LONDON, PARIS, CHICAGO, TOKYO],
            eventCards: [AIRLIFT],
          },
        });
        expect(() => {
          Meteor.call('players.discoverCure', playerId, [
            ATLANTA,
            MADRID,
            LONDON,
            PARIS,
            TOKYO,
          ]);
        }).to.throw(Meteor.Error);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 0);
        assert.equal(stub3.callCount, 0);
        assert.equal(stub4.callCount, 0);
        player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 4);
      });

      it('players.discoverCure not city card', () => {
        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub4 = sinon.stub(GameMethods, 'cure');
        stub1.returns(true);
        let player = Players.findOne(playerId);
        Players.update(playerId, {
          $set: {
            cityCards: [ATLANTA, MADRID, LONDON, PARIS, CHICAGO, TOKYO],
            eventCards: [AIRLIFT],
          },
        });
        expect(() => {
          Meteor.call('players.discoverCure', playerId, [
            ATLANTA,
            MADRID,
            LONDON,
            PARIS,
            AIRLIFT,
          ]);
        }).to.throw(Meteor.Error);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 0);
        assert.equal(stub3.callCount, 0);
        assert.equal(stub4.callCount, 0);
        player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 4);
      });

      it('players.discoverCure player does not have card', () => {
        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub4 = sinon.stub(GameMethods, 'cure');
        stub1.returns(true);
        let player = Players.findOne(playerId);
        Players.update(playerId, {
          $set: {
            cityCards: [ATLANTA, MADRID, LONDON, PARIS, TOKYO],
            eventCards: [AIRLIFT],
          },
        });
        expect(() => {
          Meteor.call('players.discoverCure', playerId, [
            ATLANTA,
            MADRID,
            LONDON,
            PARIS,
            CHICAGO,
          ]);
        }).to.throw(Meteor.Error);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 0);
        assert.equal(stub3.callCount, 0);
        assert.equal(stub4.callCount, 0);
        player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 4);
      });

      it('players.treatDisease', () => {
        let stub = sinon.stub(GameMethods, 'treatDisease');
        Meteor.call('players.treatDisease', playerId, 0);
        assert.equal(stub.callCount, 1);
        let player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 3);
      });

      it('players.treatDisease medic', () => {
        let stub = sinon.stub(GameMethods, 'treatDisease');
        Players.update(playerId, {
          $set: {
            role: MEDIC,
          },
        });
        Meteor.call('players.treatDisease', playerId, 0);
        assert.equal(stub.callCount, 1);
        let player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 3);
      });

      it('players.shareKnowledge researcher give', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        Players.update(playerId, {
          $set: { cityCards: [ATLANTA], location: TOKYO, role: RESEARCHER },
        });
        Players.update(otherPlayerId, { $set: { location: TOKYO } });

        let stub1 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(PlayerMethods, 'getPlayerCard');
        Meteor.call(
          'players.shareKnowledge',
          playerId,
          otherPlayerId,
          ATLANTA,
          true
        );

        let stub1playerId = stub1.getCall(0).args[0];
        let stub1cityCard = stub1.getCall(0).args[1];
        let stub2otherPlayerId = stub2.getCall(0).args[0];
        let stub2cityCard = stub2.getCall(0).args[1];

        assert.equal(stub1playerId, playerId);
        assert.equal(stub2otherPlayerId, otherPlayerId);
        assert.equal(stub1cityCard, ATLANTA);
        assert.equal(stub2cityCard, ATLANTA);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 1);
        let player = Players.findOne(playerId);
        let otherPlayer = Players.findOne(otherPlayerId);
        assert.equal(player.actionsLeft, 3);
        assert.equal(otherPlayer.actionsLeft, 4);
      });

      it('players.shareKnowledge otherPlayer researcher giving', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        Players.update(otherPlayerId, {
          $set: { cityCards: [ATLANTA], location: TOKYO, role: RESEARCHER },
        });
        Players.update(playerId, { $set: { location: TOKYO } });

        let stub1 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(PlayerMethods, 'getPlayerCard');
        Meteor.call(
          'players.shareKnowledge',
          otherPlayerId,
          playerId,
          ATLANTA,
          false
        );

        let stub1playerId = stub1.getCall(0).args[0];
        let stub1cityCard = stub1.getCall(0).args[1];
        let stub2otherPlayerId = stub2.getCall(0).args[0];
        let stub2cityCard = stub2.getCall(0).args[1];

        assert.equal(stub1playerId, otherPlayerId);
        assert.equal(stub2otherPlayerId, playerId);
        assert.equal(stub1cityCard, ATLANTA);
        assert.equal(stub2cityCard, ATLANTA);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 1);
        let player = Players.findOne(playerId);
        let otherPlayer = Players.findOne(otherPlayerId);
        assert.equal(player.actionsLeft, 3);
        assert.equal(otherPlayer.actionsLeft, 4);
      });

      it('players.recycleEvent success', () => {
        Players.update(playerId, {
          $set: { role: CONTINGENCY_PLANNER, actionsLeft: 4 },
        });

        let stub = sinon.stub(GameMethods, 'removeEventCard');
        Meteor.call('players.recycleEvent', playerId, AIRLIFT);

        assert.equal(stub.callCount, 1);
        let player = Players.findOne(playerId);
        assert.equal(player.contingencyCard, AIRLIFT);
        assert.equal(player.actionsLeft, 3);
      });

      it('players.recycleEvent role check', () => {
        let stub = sinon.stub(GameMethods, 'removeEventCard');
        expect(() => {
          Meteor.call('players.recycleEvent', playerId, AIRLIFT);
        }).to.throw(Meteor.Error);

        assert.equal(stub.callCount, 0);
        let player = Players.findOne(playerId);
        assert.equal(player.contingencyCard, null);
      });

      it('players.recycleEvent failure', () => {
        Players.update(playerId, {
          $set: {
            role: CONTINGENCY_PLANNER,
            contingencyCard: AIRLIFT,
            actionsLeft: 4,
          },
        });

        let stub = sinon.stub(GameMethods, 'removeEventCard');
        expect(() => {
          Meteor.call('players.recycleEvent', playerId, GOVERNMENT_GRANT);
        }).to.throw(Meteor.Error);

        let player = Players.findOne(playerId);
        assert.equal(stub.callCount, 0);
        assert.equal(player.contingencyCard, AIRLIFT);
      });

      it('players.playEvent contingency success', () => {
        Players.update(playerId, {
          $set: { role: CONTINGENCY_PLANNER, contingencyCard: ONE_QUIET_NIGHT },
        });

        let playerDiscardPlayerCard = sinon.stub(
          PlayerMethods,
          'discardPlayerCard'
        );
        let gameDiscardPlayerCard = sinon.stub(
          GameMethods,
          'discardPlayerCard'
        );
        let oneQuietNight = sinon.stub(GameMethods, 'oneQuietNight');

        Meteor.call('players.playEvent', playerId, ONE_QUIET_NIGHT, {});

        let player = Players.findOne(playerId);
        assert.equal(playerDiscardPlayerCard.callCount, 0);
        assert.equal(gameDiscardPlayerCard.callCount, 0);
        assert.equal(oneQuietNight.callCount, 1);
        assert.equal(player.contingencyCard, null);
      });

      it('players.operationsExpertMove success', () => {
        Players.update(playerId, {
          $set: { role: OPERATIONS_EXPERT, cityCards: [TOKYO] },
        });

        let numTurns = 10;

        let stub1 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(PlayerMethods, 'move');
        let stub4 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub5 = sinon.stub(GameMethods, 'getTurn');
        stub4.returns(true);
        stub5.returns(numTurns);

        Meteor.call('players.operationsExpertMove', playerId, TOKYO, MADRID);
        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 1);
        assert.equal(stub3.callCount, 1);
        assert.equal(stub4.callCount, 1);
        assert.equal(stub5.callCount, 1);
        let player = Players.findOne(playerId);
        assert.equal(player.operationsExpertAction, numTurns);
      });

      it('players.operationsExpertMove role check', () => {
        Players.update(playerId, { $set: { cityCards: [TOKYO] } });

        let stub1 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub2 = sinon.stub(GameMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(PlayerMethods, 'move');
        let stub4 = sinon.stub(GameMethods, 'hasResearchStation');
        stub4.returns(true);

        expect(() => {
          Meteor.call('players.operationsExpertMove', playerId, TOKYO, MADRID);
        }).to.throw(Meteor.Error);
        assert.equal(stub1.callCount, 0);
        assert.equal(stub2.callCount, 0);
        assert.equal(stub3.callCount, 0);
        assert.equal(stub4.callCount, 0);
      });

      it('players.buildResearchStation success with operation expert', () => {
        Players.update(playerId, { $set: { role: OPERATIONS_EXPERT } });

        let stub1 = sinon.stub(GameMethods, 'hasResearchStation');
        let stub2 = sinon.stub(PlayerMethods, 'discardPlayerCard');
        let stub3 = sinon.stub(GameMethods, 'buildResearchStation');
        stub1.returns(false);
        Meteor.call('players.buildResearchStation', playerId);

        assert.equal(stub1.callCount, 1);
        assert.equal(stub2.callCount, 0);
        assert.equal(stub3.callCount, 1);
        let player = Players.findOne(playerId);
        assert.equal(player.actionsLeft, 3);
      });

      it('players.dispatchPlayer success', () => {
        let otherPlayer1Id = Meteor.call(
          'players.create',
          otherUsername,
          gameId
        );
        let otherPlayer2Id = Meteor.call(
          'players.create',
          yetAnotherUsername,
          gameId
        );
        let stub1 = sinon.stub(PlayerMethods, 'move');

        Players.update(playerId, { $set: { role: DISPATCHER } });
        Players.update(otherPlayer1Id, { $set: { location: MADRID } });
        Players.update(otherPlayer2Id, { $set: { location: TOKYO } });

        Meteor.call(
          'players.dispatchPlayer',
          playerId,
          otherPlayer1Id,
          otherPlayer2Id
        );
        assert.equal(stub1.callCount, 1);
      });

      it('players.dispatchPlayer role check', () => {
        let otherPlayer1Id = Meteor.call(
          'players.create',
          otherUsername,
          gameId
        );
        let otherPlayer2Id = Meteor.call(
          'players.create',
          yetAnotherUsername,
          gameId
        );
        let stub1 = sinon.stub(PlayerMethods, 'move');

        Players.update(otherPlayer1Id, { $set: { location: MADRID } });
        Players.update(otherPlayer2Id, { $set: { location: TOKYO } });

        expect(() => {
          Meteor.call(
            'players.dispatchPlayer',
            playerId,
            otherPlayer1Id,
            otherPlayer2Id
          );
        }).to.throw(Meteor.Error);

        assert.equal(stub1.callCount, 0);
      });

      it('players.prune', () => {
        Meteor.call('players.prune', gameId, [playerId]);
        assert.isDefined(Players.findOne(playerId));
        Meteor.call('players.prune', gameId, []);
        assert.isUndefined(Players.findOne(playerId));
      });

      it('should not allow players to take actions with 0 actionsLeft', () => {
        Players.update(playerId, { $set: { actionsLeft: 0 } });
        assertPlayerActionsFail(playerId);
      });

      it('should not allow players to take actions outside their turn', () => {
        otherPlayerId = Meteor.call('players.create', otherUsername, gameId);
        assertPlayerActionsFail(otherPlayerId);
      });
    });
  });
}

// Helper to check that actions throw exceptions
const assertPlayerActionsFail = (playerId) => {
  const expectedPlayer = Players.findOne(playerId);
  const examplePlayerActions = [
    ['players.drive', playerId, MIAMI],
    ['players.buildResearchStation', playerId],
    ['players.shareKnowledge', playerId, otherPlayerId, ATLANTA, false],
    ['players.shuttleFlight', playerId, MIAMI],
    ['players.directFlight', playerId, MIAMI],
    ['players.charterFlight', playerId, MIAMI],
    ['players.discoverCure', playerId, [MIAMI]],
    ['players.treatDisease', playerId, BLUE],
    ['players.recycleEvent', playerId, ONE_QUIET_NIGHT],
    ['players.operationsExpertMove', playerId, ATLANTA, ATLANTA],
    ['players.dispatchPlayer', playerId, playerId, otherPlayerId],
  ];

  examplePlayerActions.forEach(([name, ...args]) => {
    expect(() => Meteor.call(name, ...args), name).to.throw(Meteor.Error);
    const actualPlayer = Players.findOne(playerId);
    assert.isNotNull(actualPlayer, name);
    assert.deepEqual(actualPlayer, expectedPlayer, name);
  });
};
