import { useEffect } from 'react'
import {
  json,
  redirect,
  useNavigate,
  useRouteLoaderData,
} from 'react-router-dom'
import { toast } from 'react-toastify'

import AttemptForm from '../../components/Content/Forms/AttemptForm'
import { API_URL } from '../../constants/constants'
import { getAuthToken } from '../../util/auth'
import classes from './EditAttemptPage.module.css'

const EditAttemptPage = ({ context }) => {
  const attempt = useRouteLoaderData(`${context}-attempt`)
  const navigate = useNavigate()

  useEffect(() => {
    if (!attempt.is_owner) {
      navigate('/')
    }
  }, [attempt, navigate])

  return (
    <div className={classes['edit-attempt-page']}>
      <h1 className={classes.heading}>Update attempt</h1>
      <hr className={classes.divider} />
      <AttemptForm attempt={attempt} user={attempt.user} />
    </div>
  )
}

export default EditAttemptPage

export const action = async ({ request, params }) => {
  const { username, name, challengeId, attemptId } = params
  const data = await request.formData()

  const token = await getAuthToken()

  // Build correct endpoint based on context
  let endpoint
  if (username) {
    endpoint = `${API_URL}/users/${username}/challenges/${challengeId}/attempts/${attemptId}`
  } else if (name) {
    endpoint = `${API_URL}/games/${name}/challenges/${challengeId}/attempts/${attemptId}`
  } else {
    throw json(
      { message: 'Missing context for attempt update.' },
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
    throw json({ message: 'Could not update attempt' }, { status: 500 })
  }

  const updatedAttempt = await response.json()

  const redirectContext = username
    ? `/users/${username}/challenges/${updatedAttempt.challenge.id}/attempts/${updatedAttempt.id}`
    : `/games/${name}/challenges/${updatedAttempt.challenge.id}/attempts/${updatedAttempt.id}`

  return redirect(redirectContext)
}
