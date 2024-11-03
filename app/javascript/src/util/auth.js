import jwt_decode from 'jwt-decode'
import { json, redirect } from 'react-router-dom'

import { API_URL, EXPIRED_TOKEN } from '../constants/constants'

export function storeTokens(accessToken, refreshToken, expiresIn) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)

  const expirationDate = new Date()
  expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn)
  localStorage.setItem('expiration', expirationDate.toISOString())
}

export function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('expiration')
}

export function tokenLoader() {
  return getAuthToken()
}

export async function getAuthToken() {
  const token = localStorage.getItem('accessToken')
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
  const refreshToken = localStorage.getItem('refreshToken')

  if (!refreshToken) {
    return null
  }

  const response = await fetch(`${API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })

  if (!response.ok) {
    console.error('Failed to refresh token')
    clearTokens()
    return null
  }

  const data = await response.json()
  const { access_token, refresh_token, expires_in } = data

  storeTokens(access_token, refresh_token, expires_in)

  return access_token
}

export function getUserData() {
  const token = getAuthToken()
  const tokenDuration = getTokenDuration()

  if (!token) {
    return null
  }

  if (tokenDuration < 0) {
    return EXPIRED_TOKEN
  }

  try {
    const decodedToken = jwt_decode(token)
    const userId = decodedToken.sub
    const username = decodedToken.username
    const userRole = decodedToken.role

    return { userId, username, userRole }
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
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

export async function checkAdminAccess() {
  const token = getAuthToken()

  if (!token) {
    return false
  }

  const { userRole } = getUserData() || {}

  if (userRole !== 'admin') {
    return redirect('/')
  }

  return null
}
