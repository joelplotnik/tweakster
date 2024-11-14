import AttemptPage, {
  loader as attemptLoader,
} from '../pages/Attempts/AttemptPage'
import AttemptsLayout from '../pages/Attempts/AttemptsLayout'
import AttemptsPage from '../pages/Attempts/AttemptsPage'

const attemptsRoutes = [
  {
    path: 'attempts',
    element: <AttemptsLayout />,
    children: [
      {
        index: true,
        element: <AttemptsPage />,
      },
      {
        path: ':id',
        id: 'attempt',
        loader: attemptLoader,
        element: <AttemptPage />,
      },
    ],
  },
]

export default attemptsRoutes
