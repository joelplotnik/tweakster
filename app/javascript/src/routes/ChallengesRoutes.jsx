import ChallengePage, {
  loader as challengeLoader,
} from '../pages/Challenges/ChallengePage'
import ChallengesLayout from '../pages/Challenges/ChallengesLayout'
import ChallengesPage from '../pages/Challenges/ChallengesPage'
import EditChallengePage from '../pages/Challenges/EditChallengePage'
import NewChallengePage from '../pages/Challenges/NewChallengePage'
import { checkAuthLoader } from '../util/auth'
import attemptsRoutes from './AttemptsRoutes'

const challengesRoutes = [
  {
    path: 'challenges',
    element: <ChallengesLayout />,
    children: [
      {
        index: true,
        element: <ChallengesPage />,
      },
      {
        path: 'new',
        element: <NewChallengePage />,
        loader: checkAuthLoader,
      },
      {
        path: ':id',
        id: 'challenge',
        loader: challengeLoader,
        children: [
          {
            index: true,
            element: <ChallengePage />,
          },
          {
            path: 'edit',
            element: <EditChallengePage />,
            loader: checkAuthLoader,
          },
          ...attemptsRoutes,
        ],
      },
    ],
  },
]

export default challengesRoutes
