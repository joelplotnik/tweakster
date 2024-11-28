import { RiGhostLine, RiSwordLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'
import { json, useRouteLoaderData } from 'react-router-dom'

import AttemptsList from '../../components/Content/Lists/AttemptsList'
import ChallengesList from '../../components/Content/Lists/ChallengesList'
import ProfileCard from '../../components/Content/Users/ProfileCard'
import Tabs from '../../components/UI/Tabs'
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

  const attemptsCount = 34 // temporary
  const challengesCount = 189 // temporary

  const tabs = [
    {
      key: 'attempts',
      label: `Attempts (${attemptsCount})`,
      icon: <RiGhostLine />,
      content: <AttemptsList entity={user} />,
    },
    {
      key: 'challenges',
      label: `Challenges (${challengesCount})`,
      icon: <RiSwordLine />,
      content: <ChallengesList entity={user} />,
    },
  ]

  return (
    <div className={classes['user-page']}>
      <ProfileCard user={user} isOwner={isOwner} />
      <Tabs tabs={tabs} />
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
