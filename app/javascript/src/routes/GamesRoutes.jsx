import GamePage, { loader as gameLoader } from '../pages/Games/GamePage'
import GamesLayout from '../pages/Games/GamesLayout'
import GamesPage from '../pages/Games/GamesPage'
import challengesRoutes from './ChallengesRoutes'

const gamesRoutes = [
  {
    path: 'games',
    element: <GamesLayout />,
    children: [
      {
        index: true,
        element: <GamesPage />,
      },
      {
        path: ':name',
        id: 'game',
        loader: gameLoader,
        children: [
          {
            index: true,
            element: <GamePage />,
          },
          ...challengesRoutes('game'),
          ,
        ],
      },
    ],
  },
]

export default gamesRoutes
