import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { json, redirect, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import ChallengeForm from '../../components/Content/Forms/ChallengeForm'
import { API_URL } from '../../constants/constants'
import { getAuthToken } from '../../util/auth'
import classes from './NewChallengePage.module.css'

const NewChallengePage = () => {
  const token = useSelector(state => state.token.token)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/')
    }
  }, [token, navigate])

  return (
    <div className={classes['new-challenge-page']}>
      <h1 className={classes.heading}>Create a challenge</h1>
      <hr className={classes.divider} />
      <ChallengeForm />
    </div>
  )
}

export default NewChallengePage

export const action = async ({ request, params }) => {
  const { username } = params

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

  const response = await fetch(`${API_URL}/users/${username}/challenges`, {
    method: 'POST',
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
    throw json({ message: 'Could not create challenge' }, { status: 500 })
  }

  const newChallenge = await response.json()

  return redirect(`/users/${username}/challenges/${newChallenge.challenge.id}`)
}
