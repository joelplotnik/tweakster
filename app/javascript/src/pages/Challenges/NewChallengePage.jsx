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

export const action = async ({ request }) => {
  const data = await request.formData()

  data.append('challenge[title]', data.get('title'))
  data.append('challenge[description]', data.get('description'))
  data.append('challenge[category]', data.get('category'))
  data.append('challenge[game]', data.get('game'))
  data.append('challenge[image]', data.get('image'))

  const token = await getAuthToken()

  const response = await fetch(`${API_URL}/challenges`, {
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
    toast.error(responseData.message || 'Validation failed')
    return response
  }

  if (!response.ok) {
    throw json({ message: 'Could not create challenge' }, { status: 500 })
  }

  const challenge = await response.json()

  return redirect(`/challenges/${challenge.id}`)
}
