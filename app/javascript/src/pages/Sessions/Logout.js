import { redirect } from 'react-router-dom'
import { toast } from 'react-toastify'

import { API_URL } from '../../constants/constants'
import { clearLocalStorage } from '../../util/auth'

export const action = async () => {
  try {
    const token = localStorage.getItem('token')

    if (token) {
      const response = await fetch(`${API_URL}/users/tokens/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Could not log out user')
      }

      toast.success('Successfully logged out')
    } else {
      toast.warn('No active session found')
    }

    clearLocalStorage()
  } catch (error) {
    console.error('Error: ', error.message)
    toast.error('Failed to log out')
  }

  return redirect('/')
}
