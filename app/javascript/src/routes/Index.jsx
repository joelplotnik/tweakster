import ErrorPage from '../pages/General/ErrorPage'
import HomePage from '../pages/Main/HomePage'
import RootLayout from '../pages/RootLayout'
import { tokenLoader } from '../util/auth'
import authRoutes from './AuthRoutes'
import generalRoutes from './GeneralRoutes'
import usersRoutes from './UsersRoutes'

const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    id: 'root',
    loader: tokenLoader,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      ...generalRoutes,
      ...authRoutes,
      ...usersRoutes,
      // ...gamesRoutes,
    ],
  },
]

export default routes
