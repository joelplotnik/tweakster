import React from 'react'

import AboutPage from './pages/AboutPage'
import ErrorPage from './pages/ErrorPage'
import { action as logoutAction } from './pages/Logout'
import MainPage from './pages/MainPage'
import NotificationsPage from './pages/NotificationsPage'
import NewPiecePage from './pages/Pieces/NewPiecePage'
import RootLayout from './pages/RootLayout'
import EditUserPage, {
  action as editUserAction,
} from './pages/Users/EditUserPage'
import FollowingPage from './pages/Users/FollowingPage'
import SubscriptionsPage from './pages/Users/SubscriptionsPage'
import UserPage, { loader as userLoader } from './pages/Users/UserPage'
import UsersLayout from './pages/Users/UsersLayout'
import UsersPage from './pages/Users/UsersPage'
import { checkAuthLoader, tokenLoader } from './util/auth'

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
        element: <MainPage />,
      },
      {
        path: 'users',
        element: <UsersLayout />,
        children: [
          {
            index: true,
            element: <UsersPage />,
          },
          {
            path: ':id',
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
                loader: checkAuthLoader,
              },
              // {
              //   path: 'following',
              //   element: <FollowingPage />,
              //   loader: checkAuthLoader,
              // },
            ],
          },
        ],
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
        loader: checkAuthLoader,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      // {
      //   path: 'new',
      //   element: <NewPiecePage />,
      //   loader: checkAuthLoader,
      // },
      {
        path: 'logout',
        action: logoutAction,
      },
    ],
  },
]

export default routes
