import { action as logoutAction } from '../pages/Sessions/logout'
import OauthCallback from '../pages/Sessions/Oauth'

const authRoutes = [
  {
    path: 'auth/callback/twitch',
    element: <OauthCallback />,
  },
  {
    path: 'logout',
    action: logoutAction,
  },
]

export default authRoutes
