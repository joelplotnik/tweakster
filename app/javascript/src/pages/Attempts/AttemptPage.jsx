import { useParams, useRouteLoaderData } from 'react-router-dom'

import AttemptCard from '../../components/Content/Attempts/AttemptCard'
import Comments from '../../components/Content/Comments/Comments'
import { API_URL } from '../../constants/constants'
import { getAuthToken } from '../../util/auth'
import classes from './AttemptPage.module.css'

const AttemptPage = ({ context }) => {
  const attempt = useRouteLoaderData(`${context}-attempt`)
  const { username, name: gameName, challengeId } = useParams()
  const basePath = username ? `users/${username}` : `games/${gameName}`

  console.log(attempt)

  return (
    <div className={classes['attempt-page']} key={attempt.id}>
      <AttemptCard
        attempt={attempt}
        // isOwner={attempt.is_owner}
        basePath={basePath}
      />
      <hr className={classes.divider} />
      <h3 className={classes['comment-header']}>Comments</h3>
      <Comments
        basePath={basePath}
        challengeId={attempt.challenge.id}
        attemptId={attempt.id}
      />
    </div>
  )
}

export default AttemptPage

export async function loader({ params }) {
  const { username, name, challengeId, attemptId } = params
  const token = await getAuthToken()

  let url = ''
  if (username) {
    url = `${API_URL}/users/${username}/challenges/${challengeId}/attempts/${attemptId}`
  } else if (name) {
    url = `${API_URL}/games/${name}/challenges/${challengeId}/attempts/${attemptId}`
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
      { message: 'Could not fetch attempt' },
      { status: response.status }
    )
  }

  const data = await response.json()

  return data
}
