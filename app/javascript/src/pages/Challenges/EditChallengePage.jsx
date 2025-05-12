import { useEffect } from 'react'
import {
  json,
  redirect,
  useNavigate,
  useRouteLoaderData,
} from 'react-router-dom'
import { toast } from 'react-toastify'

import ChallengeForm from '../../components/Content/Forms/ChallengeForm'
import { API_URL } from '../../constants/constants'
import { getAuthToken } from '../../util/auth'
import classes from './EditChallengePage.module.css'

const EditChallengePage = ({ context }) => {
  const challenge = useRouteLoaderData(`${context}-challenge`)
  const navigate = useNavigate()

  useEffect(() => {
    if (!challenge.is_owner) {
      navigate('/')
    }
  }, [challenge, navigate])

  return (
    <div className={classes['edit-challenge-page']}>
      <h1 className={classes.heading}>Edit challenge</h1>
      <hr className={classes.divider} />
      <ChallengeForm challenge={challenge} />
    </div>
  )
}

export default EditChallengePage

export const action = async ({ request, params }) => {
  const { username, name, challengeId } = params
  const data = await request.formData()

  const gameId = data.get('challenge[game_id]')
  const category = data.get('challenge[category]')

  const missingFields = []
  if (!gameId) missingFields.push('game')
  if (!category) missingFields.push('category')

  if (missingFields.length > 0) {
    const errorMessage = `You must select a ${missingFields.join(
      ' and '
    )} for your challenge`
    toast.error(errorMessage)
    return json({ error: errorMessage }, { status: 400 })
  }

  const token = await getAuthToken()

  // Build correct endpoint based on context
  let endpoint
  if (username) {
    endpoint = `${API_URL}/users/${username}/challenges/${challengeId}`
  } else if (name) {
    endpoint = `${API_URL}/games/${name}/challenges/${challengeId}`
  } else {
    throw json(
      { message: 'Missing context for challenge update.' },
      { status: 400 }
    )
  }

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  })

  if (response.status === 401) {
    toast.error('You are not authorized to perform this action')
    return response
  }

  if (response.status === 422) {
    const responseData = await response.json()
    const errorMessage = responseData.errors[0] || 'Validation failed'
    toast.error(errorMessage)
    return responseData
  }

  if (!response.ok) {
    throw json({ message: 'Could not update challenge' }, { status: 500 })
  }

  const updatedChallenge = await response.json()

  const redirectContext = username
    ? `/users/${username}/challenges/${updatedChallenge.challenge.id}`
    : `/games/${name}/challenges/${updatedChallenge.challenge.id}`

  return redirect(redirectContext)
}
