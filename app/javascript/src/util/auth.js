import { json, redirect } from 'react-router-dom'

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
    if (refreshedToken) {
      return refreshedToken
    } else {
      return EXPIRED_TOKEN
    }
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

async function refreshAuthToken() {
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

export async function checkAuthLoader({ params }) {
  const token = getAuthToken()

  if (!token) {
    return redirect('/')
  }

  const { id } = params
  const parsedID = parseInt(id, 10)

  // User attempting to edit their profile
  if (parsedID) {
    const response = await fetch(
      `${API_URL}/users/${parsedID}/check_ownership`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      const data = await response.json()

      if (response.status === 401 || !data.belongs_to_user) {
        return redirect('/')
      } else {
        throw json({ message: 'Could not make request.' }, { status: 500 })
      }
    }
  }

  return null
}
