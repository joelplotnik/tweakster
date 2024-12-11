import ChallengePage, {
  loader as challengeLoader,
} from '../pages/Challenges/ChallengePage'
import ChallengesLayout from '../pages/Challenges/ChallengesLayout'
import ChallengesPage from '../pages/Challenges/ChallengesPage'
import EditChallengePage from '../pages/Challenges/EditChallengePage'
import NewChallengePage from '../pages/Challenges/NewChallengePage'
import { checkAuthLoader } from '../util/auth'
import attemptsRoutes from './AttemptsRoutes'

const challengesRoutes = context => [
  {
    path: 'challenges',
    id: `${context}-challenges`,
    element: <ChallengesLayout />,
    children: [
      {
        index: true,
        id: `${context}-challenges-index`,
        element: <ChallengesPage />,
      },
      {
        path: 'new',
        id: `${context}-challenges-new`,
        element: <NewChallengePage />,
        loader: checkAuthLoader,
      },
      {
        path: ':id',
        id: `${context}-challenge`,
        loader: challengeLoader,
        children: [
          {
            index: true,
            id: `${context}-challenge-index`,
            element: <ChallengePage />,
          },
          {
            path: 'edit',
            id: `${context}-challenge-edit`,
            element: <EditChallengePage />,
            loader: checkAuthLoader,
          },
          ...attemptsRoutes(`${context}-challenge`),
        ],
      },
    ],
  },
]

export default challengesRoutes
