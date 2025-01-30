import { RiGhostLine, RiSwordLine } from 'react-icons/ri'
import { json, useRouteLoaderData } from 'react-router-dom'

import AttemptsList from '../../components/Content/Lists/AttemptsList'
import ChallengesList from '../../components/Content/Lists/ChallengesList'
import ProfileCard from '../../components/Content/Users/ProfileCard'
import Tabs from '../../components/UI/Tabs'
import { API_URL } from '../../constants/constants'
import { getAuthToken } from '../../util/auth'
import { formatNumber } from '../../util/format'
import classes from './UserPage.module.css'

const UserPage = () => {
  const user = useRouteLoaderData('user')

  const tabs = [
    {
      key: 'attempts',
      label: `Attempts (${formatNumber(user.active_attempts_count)})`,
      icon: <RiGhostLine />,
      content: <AttemptsList />,
    },
    {
      key: 'challenges',
      label: `Challenges (${formatNumber(user.challenges_count)})`,
      icon: <RiSwordLine />,
      content: <ChallengesList />,
    },
  ]

  return (
    <div className={classes['user-page']} key={user.id}>
      <ProfileCard user={user} isOwner={user.is_owner} />
      <Tabs tabs={tabs} isUsersPage={user.is_owner} />
    </div>
  )
}

export default UserPage

export async function loader({ params }) {
  const { username } = params
  const token = await getAuthToken()

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

  return data
}
