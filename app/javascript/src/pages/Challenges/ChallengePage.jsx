import { useState } from 'react'
import { RiChat3Line, RiGhostLine } from 'react-icons/ri'
import { json, useParams, useRouteLoaderData } from 'react-router-dom'

import ChallengeCard from '../../components/Content/Challenges/ChallengeCard'
import Comments from '../../components/Content/Comments/Comments'
import AttemptsList from '../../components/Content/Lists/AttemptsList'
import Tabs from '../../components/UI/Tabs'
import { API_URL } from '../../constants/constants'
import { getAuthToken } from '../../util/auth'
import { formatNumber } from '../../util/format'
import classes from './ChallengePage.module.css'

const ChallengePage = ({ context }) => {
  const challenge = useRouteLoaderData(`${context}-challenge`)
  const { username, name: gameName } = useParams()
  const basePath = username ? `users/${username}` : `games/${gameName}`
  const [commentsCount, setCommentsCount] = useState(challenge.comments_count)

  const tabs = [
    {
      key: 'attempts',
      label: `Attempts (${formatNumber(challenge.active_attempts_count)})`,
      icon: <RiGhostLine />,
      content: <AttemptsList />,
    },
    {
      key: 'comments',
      label: `Comments (${formatNumber(commentsCount)})`,
      icon: <RiChat3Line />,
      content: (
        <Comments
          basePath={basePath}
          challengeId={challenge.id}
          commentsCount={commentsCount}
          setCommentsCount={setCommentsCount}
        />
      ),
    },
  ]

  return (
    <div className={classes['challenge-page']} key={challenge.id}>
      <ChallengeCard
        challenge={challenge}
        isOwner={challenge.is_owner}
        basePath={basePath}
      />
      <Tabs tabs={tabs} />
    </div>
  )
}

export default ChallengePage

export async function loader({ params }) {
  const { username, name, challengeId } = params
  const token = await getAuthToken()

  let url = ''
  if (username) {
    url = `${API_URL}/users/${username}/challenges/${challengeId}`
  } else if (name) {
    url = `${API_URL}/games/${name}/challenges/${challengeId}`
  } else {
    throw json({ message: 'Invalid route context' }, { status: 400 })
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw json(
      { message: 'Could not fetch challenge' },
      { status: response.status }
    )
  }

  const data = await response.json()

  return data
}
