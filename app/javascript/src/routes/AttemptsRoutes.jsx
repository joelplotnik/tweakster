import AttemptPage, {
  loader as attemptLoader,
} from '../pages/Attempts/AttemptPage'
import AttemptsLayout from '../pages/Attempts/AttemptsLayout'
import AttemptsPage from '../pages/Attempts/AttemptsPage'
import EditAttemptPage, {
  action as editAttemptAction,
} from '../pages/Attempts/EditAttemptPage'

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
        children: [
          {
            index: true,
            id: `${context}-attempt-index`,
            element: <AttemptPage context={context} />,
          },
          {
            path: 'edit',
            id: `${context}-attempt-edit`,
            element: <EditAttemptPage context={context} />,
            action: editAttemptAction,
          },
        ],
      },
    ],
  },
]

export default attemptsRoutes
