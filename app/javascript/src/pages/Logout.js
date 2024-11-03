import { redirect } from 'react-router-dom'
import { toast } from 'react-toastify'

import { API_URL, CLIENT_ID, CLIENT_SECRET } from '../constants/constants'
import { clearTokens } from '../util/auth'

export const action = async () => {
  try {
    const token = localStorage.getItem('accessToken')

    if (token) {
      const signoutData = {
        token: token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }

      const response = await fetch(`${API_URL}/oauth/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signoutData),
      })

      if (!response.ok) {
        throw new Error('Could not log out user')
      }

      toast.success('Successfully logged out')
    } else {
      toast.warn('No active session found')
    }

    clearTokens()
  } catch (error) {
    console.error('Error: ', error.message)
    toast.error('Failed to log out')
  }

  return redirect('/')
}
