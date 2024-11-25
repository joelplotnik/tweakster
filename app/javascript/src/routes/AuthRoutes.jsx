import AccountRecoveryLayout from '../pages/Sessions/AccountRecoveryLayout'
import AccountRecoveryPage from '../pages/Sessions/AccountRecoveryPage'
import { action as logoutAction } from '../pages/Sessions/logout'
import OauthCallback from '../pages/Sessions/Oauth'
import ResetPasswordPage from '../pages/Sessions/ResetPasswordPage'

const authRoutes = [
  {
    path: 'auth/callback/twitch',
    element: <OauthCallback />,
  },
  {
    path: 'logout',
    action: logoutAction,
  },
  {
    path: 'account-recovery',
    element: <AccountRecoveryLayout />,
    children: [
      {
        index: true,
        element: <AccountRecoveryPage />,
      },
      {
        path: 'reset-password/:token',
        children: [
          {
            index: true,
            element: <ResetPasswordPage />,
          },
        ],
      },
    ],
  },
]

export default authRoutes
