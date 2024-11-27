import { useSelector } from 'react-redux'
import { json, useRouteLoaderData } from 'react-router-dom'

import { API_URL } from '../../constants/constants'
import store from '../../store'
import { userPageActions } from '../../store/userPage'
import { getAuthToken } from '../../util/auth'
import classes from './UserPage.module.css'

const UserPage = () => {
  const token = useRouteLoaderData('root')
  const user = useSelector(state => state.userPage.user)
  const currentUser = useSelector(state => state.user.user)
  const isOwner = currentUser?.username === user.username

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      {isOwner ? (
        <button>Edit Profile</button>
      ) : (
        <p>You can only view this profile.</p>
      )}
    </div>
  )
}

export default UserPage

export async function loader({ params }) {
  const { username } = params
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/users/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw json({ message: 'Could not find user' }, { status: 500 })
  }

  const data = await response.json()

  store.dispatch(userPageActions.setUser(data))

  return data
}
