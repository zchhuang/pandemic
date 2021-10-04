import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { useCookies } from 'react-cookie';
import PropTypes from 'prop-types';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import { Games } from '../api/games';
import { Players } from '../api/players';
import { setGameObject, setPlayers, setPlayerObject } from './redux/actions';
import { TABLE, PLAYING, WON, LOST } from '../constants/stage';
import SpinnerPage from './SpinnerPage';

const GameplayPage = React.lazy(() => import('./GameplayPage/GameplayPage'));
const TablePage = React.lazy(() => import('./TablePage/TablePage'));
const NotFoundPage = React.lazy(() => import('./NotFoundPage'));
const VictoryPage = React.lazy(() => import('./VictoryPage/VictoryPage'));
const DefeatPage = React.lazy(() => import('./DefeatPage/DefeatPage'));

function GameRouter({ match, setGameObject, setPlayers, setPlayerObject }) {
  function getPage() {
    const { gameId } = match.params;
    const [cookies, setCookie, removeCookie] = useCookies([gameId]);

    const isLoading = () =>
      useTracker(() => {
        const players = Meteor.subscribe('players');
        const games = Meteor.subscribe('games');
        return !players.ready() || !games.ready();
      });

    const { players, game } = useTracker(() => {
      const players = Players.find(
        { gameId: { $eq: gameId }, present: { $eq: true } },
        { sort: { createdAt: -1 } }
      ).fetch();
      const game = Games.findOne({ _id: { $eq: gameId } });

      return {
        players,
        game,
      };
    }, []);

    if (isLoading()) {
      return <SpinnerPage />;
    }

    const stageToPage = {
      [TABLE]: (
        <TablePage
          cookies={cookies}
          setCookie={setCookie}
          removeCookie={removeCookie}
        />
      ),
      [PLAYING]: <GameplayPage />,
      [WON]: <VictoryPage />,
      [LOST]: <DefeatPage />,
    };

    console.log({ game, players, cookies });
    if (game) {
      setGameObject(game);
      setPlayers(players);
      setPlayerObject(game.playerOrder.find((id) => id === cookies[game._id]));
      return stageToPage[game.stage];
    } else {
      return <NotFoundPage />;
    }
  }

  return <Suspense fallback={<SpinnerPage />}>{getPage()}</Suspense>;
}

GameRouter.propTypes = {
  match: PropTypes.object,
  setGameObject: PropTypes.func,
  setPlayers: PropTypes.func,
  setPlayerObject: PropTypes.func,
};

export default connect(null, { setGameObject, setPlayers, setPlayerObject })(
  GameRouter
);
