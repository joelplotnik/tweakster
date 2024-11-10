import React from 'react'

import AboutPage from './pages/AboutPage'
import ErrorPage from './pages/ErrorPage'
import HomePage from './pages/HomePage'
import { action as logoutAction } from './pages/Logout'
import NotificationsPage from './pages/NotificationsPage'
import OauthCallback from './pages/Oauth'
import PopularPage from './pages/PopularPage'
import RootLayout from './pages/RootLayout'
import EditUserPage, {
  action as editUserAction,
} from './pages/Users/EditUserPage'
import FollowingPage from './pages/Users/FollowingPage'
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
        element: <HomePage />,
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
              // {
              //   path: 'challenges',
              //   element: <ChallengesLayout />,
              //   children: [
              //     {
              //       index: true,
              //       element: <ChallengesPage />,
              //     },
              //     {
              //       path: ':id',
              //       id: 'challenge',
              //       loader: challengeLoader,
              //       children: [
              //         {
              //           index: true,
              //           element: <ChallengePage />,
              //         },
              //       ],
              //     },
              //   ],
              // },
              // {
              //   path: 'activity',
              //   element: <ActivitiesLayout />,
              //   children: [
              //     {
              //       index: true,
              //       element: <ActivitiesPage />,
              //     },
              //     {
              //       path: ':id',
              //       id: 'activity',
              //       loader: activityLoader,
              //       children: [
              //         {
              //           index: true,
              //           element: <ActivityPage />,
              //         },
              //       ],
              //     },
              //   ],
              // },
            ],
          },
        ],
      },
      // {
      //   path: 'games',
      //   element: <GamesLayout />,
      //   children: [
      //     {
      //       index: true,
      //       element: <GamesPage />,
      //     },
      //     {
      //       path: ':id',
      //       id: 'game',
      //       loader: gameLoader,
      //       children: [
      //         {
      //           index: true,
      //           element: <GamePage />,
      //         },
      //         {
      //           path: 'challenges',
      //           element: <ChallengesLayout />,
      //           children: [
      //             {
      //               index: true,
      //               element: <ChallengesPage />,
      //             },
      //             {
      //               path: ':id',
      //               id: 'challenge',
      //               loader: challengeLoader,
      //               children: [
      //                 {
      //                   index: true,
      //                   element: <ChallengePage />,
      //                 },
      //                 {
      //                   path: 'edit',
      //                   element: <EditChallengePage />,
      //                   loader: checkAuthLoader,
      //                 },
      //               ],
      //             },
      //             {
      //               path: 'new',
      //               element: <NewChallengePage />,
      //               loader: checkAuthLoader,
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      // },
      {
        path: 'notifications',
        element: <NotificationsPage />,
        loader: checkAuthLoader,
      },
      {
        path: 'popular',
        element: <PopularPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'auth/callback/twitch',
        element: <OauthCallback />,
      },
      {
        path: 'logout',
        action: logoutAction,
      },
    ],
  },
]

export default routes
