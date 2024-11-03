export const API_URL =
  Tweakster.Config.env === 'development'
    ? import.meta.env.VITE_APP_API_URL_DEV
    : import.meta.env.VITE_APP_API_URL_PROD

export const WS_URL =
  Tweakster.Config.env === 'development'
    ? import.meta.env.VITE_APP_WS_URL_DEV
    : import.meta.env.VITE_APP_WS_URL_PROD

export const CLIENT_ID = import.meta.env.VITE_APP_CLIENT_ID
export const CLIENT_SECRET = import.meta.env.VITE_APP_CLIENT_SECRET

export const EXPIRED_TOKEN = import.meta.env.VITE_APP_EXPIRED_TOKEN
