import ChallengePage, {
  loader as challengeLoader,
} from '../pages/Challenges/ChallengePage'
import ChallengesLayout from '../pages/Challenges/ChallengesLayout'
import ChallengesPage from '../pages/Challenges/ChallengesPage'
import EditChallengePage, {
  action as editChallengeAction,
} from '../pages/Challenges/EditChallengePage'
import NewChallengePage, {
  action as newChallengeAction,
} from '../pages/Challenges/NewChallengePage'
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
        action: newChallengeAction,
      },
      {
        path: ':challengeId',
        id: `${context}-challenge`,
        loader: challengeLoader,
        children: [
          {
            index: true,
            id: `${context}-challenge-index`,
            element: <ChallengePage context={context} />,
          },
          {
            path: 'edit',
            id: `${context}-challenge-edit`,
            element: <EditChallengePage context={context} />,
            action: editChallengeAction,
          },
          ...attemptsRoutes(`${context}-challenge`),
        ],
      },
    ],
  },
]

export default challengesRoutes
