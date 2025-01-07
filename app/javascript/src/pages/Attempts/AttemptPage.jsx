import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import AttemptCard from '../../components/Content/Attempts/AttemptCard'
import { API_URL } from '../../constants/constants'
import store from '../../store'
import { attemptPageActions } from '../../store/attemptPage'
import { getAuthToken } from '../../util/auth'
import classes from './AttemptPage.module.css'

const AttemptPage = () => {
  const attempt = useSelector(state => state.attemptPage.attempt)
  const { username, name: gameName, challengeId } = useParams()
  const basePath = username
    ? `/users/${username}/challenges/${challengeId}`
    : `/games/${gameName}/challenges/${challengeId}`

  return (
    <div className={classes['attempt-page']} key={attempt.id}>
      <AttemptCard
        attempt={attempt}
        // isOwner={attempt.is_owner}
        basePath={basePath}
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

  store.dispatch(attemptPageActions.setAttempt(data))

  return data
}
