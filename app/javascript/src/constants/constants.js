export const API_URL =
  Tweakster.Config.env === 'development'
    ? 'http://localhost:5100/api/v1'
    : 'https://tweakster.com/api/v1'
export const WS_URL =
  Tweakster.Config.env === 'development'
    ? 'ws://localhost:5100/cable'
    : 'ws://tweakster.com/cable'
export const EXPIRED_TOKEN = 'EXPIRED'
