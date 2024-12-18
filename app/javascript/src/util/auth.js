import { API_URL, EXPIRED_TOKEN } from '../constants/constants'

export function storeTokens(token, refresh, expiration) {
  localStorage.setItem('token', token)
  localStorage.setItem('refresh', refresh)

  const expirationDate = new Date()
  expirationDate.setSeconds(expirationDate.getSeconds() + expiration)
  localStorage.setItem('expiration', expirationDate.toISOString())
}

export function clearLocalStorage() {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh')
  localStorage.removeItem('expiration')
}

export function tokenLoader() {
  return getAuthToken()
}

export async function getAuthToken() {
  const token = localStorage.getItem('token')
  const tokenDuration = getTokenDuration()

  if (!token) {
    return null
  }

  if (tokenDuration < 0) {
    const refreshedToken = await refreshAuthToken()
    return refreshedToken || EXPIRED_TOKEN
  }

  return token
}

export function getTokenDuration() {
  const storedExpirationDate = localStorage.getItem('expiration')
  const expirationDate = new Date(storedExpirationDate)
  const now = new Date()
  const duration = expirationDate.getTime() - now.getTime()

  return duration
}

export async function refreshAuthToken() {
  const refresh = localStorage.getItem('refresh')

  if (!refresh) {
    return null
  }

  const response = await fetch(`${API_URL}/users/tokens/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refresh}`,
    },
  })

  if (!response.ok) {
    console.error('Failed to refresh token')
    clearLocalStorage()
    return null
  }

  const data = await response.json()
  const { token, refresh_token, expires_in } = data

  storeTokens(token, refresh_token, expires_in)

  return token
}
