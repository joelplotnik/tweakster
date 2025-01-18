import EditUserPage, {
  action as editUserAction,
} from '../pages/Users/EditUserPage'
import FollowingPage from '../pages/Users/FollowingPage'
import UserPage, { loader as userLoader } from '../pages/Users/UserPage'
import UsersLayout from '../pages/Users/UsersLayout'
import UsersPage from '../pages/Users/UsersPage'
import challengesRoutes from './ChallengesRoutes'

const usersRoutes = [
  {
    path: 'users',
    element: <UsersLayout />,
    children: [
      {
        index: true,
        element: <UsersPage />,
      },
      {
        path: ':username',
        id: 'user',
        loader: userLoader,
        children: [
          {
            index: true,
            element: <UserPage />,
          },
          {
            path: 'edit',
            element: <EditUserPage />,
            action: editUserAction,
          },
          {
            path: 'following',
            element: <FollowingPage />,
          },
          ...challengesRoutes('user'),
        ],
      },
    ],
  },
]

export default usersRoutes
