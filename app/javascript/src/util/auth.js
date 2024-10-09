import jwt_decode from 'jwt-decode'
import { json, redirect } from 'react-router-dom'

import { API_URL, EXPIRED_TOKEN } from '../constants/constants'

export function getTokenDuration() {
  const storedExpirationDate = localStorage.getItem('expiration')
  const expirationDate = new Date(storedExpirationDate)
  const now = new Date()
  const duration = expirationDate.getTime() - now.getTime()

  return duration
}

export function getAuthToken() {
  const token = localStorage.getItem('token')
  const tokenDuration = getTokenDuration()

  if (!token) {
    return null
  }

  if (tokenDuration < 0) {
    return EXPIRED_TOKEN
  }

  return token
}

export function tokenLoader() {
  return getAuthToken()
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
