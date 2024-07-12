import { redirect } from 'react-router-dom'
import { toast } from 'react-toastify'

import { API_URL } from '../constants/constants'

export const action = async () => {
  try {
    const token = localStorage.getItem('token')

    localStorage.clear()

    const response = await fetch(`${API_URL}/users/sign_out`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Could not log out user')
    }
  } catch (error) {
    console.error('Error: ', error.message)
    toast.error('Failed to log out')
  }

  return redirect('/')
}
