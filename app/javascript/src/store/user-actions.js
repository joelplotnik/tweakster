import { API_URL } from '../constants/constants'
import { getAuthToken } from '../util/auth'
import { userActions } from './user'

export const fetchUserData = () => {
  return async dispatch => {
    const token = await getAuthToken()

    if (!token) {
      return dispatch(userActions.clearUser())
    }

    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return dispatch(userActions.clearUser())
      }

      const data = await response.json()

      if (!data) {
        return dispatch(userActions.clearUser())
      }

      dispatch(userActions.setUser({ ...data }))
    } catch (error) {
      console.error(error)
      dispatch(userActions.clearUser())
    }
  }
}
