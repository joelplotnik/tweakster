import React from 'react';
import ChannelPage, {
  loader as channelLoader,
} from './pages/Channels/ChannelPage';
import EditChannelPage, {
  action as editChannelAction,
} from './pages/Channels/EditChannelPage';
import EditUserPage, {
  action as editUserAction,
} from './pages/Users/EditUserPage';
import NewChannelPage, {
  action as newChannelAction,
} from './pages/Channels/NewChannelPage';
import PiecePage, { loader as pieceLoader } from './pages/Pieces/PiecePage';
import UserPage, { loader as userLoader } from './pages/Users/UserPage';
import { checkAdminAccess, checkAuthLoader, tokenLoader } from './util/auth';

import AboutPage from './pages/AboutPage';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminPage from './pages/Admin/AdminPage';
import ChannelsLayout from './pages/Channels/ChannelsLayout';
import ChannelsPage from './pages/Channels/ChannelsPage';
import ConversationPage from './pages/Conversations/ConversationPage';
import ConversationsLayout from './pages/Conversations/ConversationsLayout';
import ConversationsPage from './pages/Conversations/ConversationsPage';
import EditPiecePage from './pages/Pieces/EditPiecePage';
import ErrorPage from './pages/ErrorPage';
import FollowingPage from './pages/Users/FollowingPage';
import HomePage from './pages/HomePage';
import MainPage from './pages/MainPage';
import NotificationsPage from './pages/NotificationsPage';
import NewPiecePage from './pages/Pieces/NewPiecePage';
import PiecesLayout from './pages/Pieces/PiecesLayout';
import ReportsPage from './pages/Admin/ReportsPage';
import RootLayout from './pages/RootLayout';
import SubscriptionsPage from './pages/Users/SubscriptionsPage';
import UsersLayout from './pages/Users/UsersLayout';
import UsersPage from './pages/Users/UsersPage';
import { action as logoutAction } from './pages/Logout';

const routes = [
  {
    path: '/*',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    id: 'root',
    loader: tokenLoader,
    children: [
      {
        index: true,
        element: tokenLoader() ? <HomePage /> : <MainPage />,
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
              {
                path: 'subscriptions',
                element: <SubscriptionsPage />,
                loader: checkAuthLoader,
              },
              {
                path: 'following',
                element: <FollowingPage />,
                loader: checkAuthLoader,
              },
            ],
          },
        ],
      },
      {
        path: 'channels',
        element: <ChannelsLayout />,
        children: [
          {
            index: true,
            element: <ChannelsPage />,
          },
          {
            path: ':id',
            id: 'channel',
            loader: channelLoader,
            children: [
              {
                index: true,
                element: <ChannelPage />,
              },
              {
                path: 'edit',
                element: <EditChannelPage />,
                action: editChannelAction,
                loader: checkAuthLoader,
              },
              {
                path: 'pieces',
                element: <PiecesLayout />,
                children: [
                  {
                    path: ':id',
                    id: 'piece',
                    loader: pieceLoader,
                    children: [
                      {
                        index: true,
                        element: <PiecePage />,
                      },
                      {
                        path: 'edit',
                        element: <EditPiecePage />,
                        loader: checkAuthLoader,
                      },
                    ],
                  },
                  {
                    path: 'new',
                    element: <NewPiecePage />,
                    loader: checkAuthLoader,
                  },
                ],
              },
            ],
          },
          {
            path: 'new',
            element: <NewChannelPage />,
            action: newChannelAction,
            loader: checkAuthLoader,
          },
        ],
      },
      {
        path: 'admin',
        element: <AdminLayout />,
        loader: checkAdminAccess,
        children: [
          {
            index: true,
            element: <AdminPage />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
        ],
      },
      {
        path: 'messages',
        element: <ConversationsLayout />,
        loader: checkAuthLoader,
        children: [
          {
            index: true,
            element: <ConversationsPage />,
          },
          {
            path: ':id',
            id: 'message',
            children: [
              {
                index: true,
                element: <ConversationPage />,
              },
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
        path: 'main',
        element: <MainPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'new',
        element: <NewPiecePage />,
        loader: checkAuthLoader,
      },
      {
        path: 'logout',
        action: logoutAction,
      },
      {
        path: '*',
        element: <ErrorPage />,
      },
    ],
  },
];

export default routes;
