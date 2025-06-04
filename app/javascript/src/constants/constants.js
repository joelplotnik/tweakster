export const API_URL =
  Tweakster.Config.env === 'development'
    ? 'http://localhost:5100/api/v1'
    : 'http://tweakster/api/v1'

export const WS_URL =
  Tweakster.Config.env === 'development'
    ? 'ws://localhost:5100/cable'
    : 'ws://tweakster/cable'

export const TWITCH_REDIRECT_URI =
  Tweakster.Config.env === 'development'
    ? 'http://localhost:5100/api/v1/users/auth/twitch/callback'
    : 'http://tweakster/api/v1/users/auth/twitch/callback'
export const TWITCH_CLIENT_ID = 'c85vwopyrn43u0oythkjgh6k1ta2h4'

export const GOOGLE_OAUTH_REDIRECT_URI =
  Tweakster.Config.env === 'development'
    ? 'http://localhost:5100/api/v1/users/auth/google_oauth2/callback'
    : 'http://tweakster/api/v1/users/auth/google_oauth2/callback'
export const GOOGLE_OAUTH_CLIENT_ID =
  '789776698778-q7ng29jsp1d4stu1ilm4lkuftrsn4gfm.apps.googleusercontent.com'

export const EXPIRED_TOKEN = 'EXPIRED'
