import AttemptPage, {
  loader as attemptLoader,
} from '../pages/Attempts/AttemptPage'
import AttemptsLayout from '../pages/Attempts/AttemptsLayout'
import AttemptsPage from '../pages/Attempts/AttemptsPage'

const attemptsRoutes = context => [
  {
    path: 'attempts',
    id: `${context}-attempts`,
    element: <AttemptsLayout />,
    children: [
      {
        index: true,
        id: `${context}-attempts-index`,
        element: <AttemptsPage />,
      },
      {
        path: ':attemptId',
        id: `${context}-attempt`,
        loader: attemptLoader,
        element: <AttemptPage />,
      },
    ],
  },
]

export default attemptsRoutes
