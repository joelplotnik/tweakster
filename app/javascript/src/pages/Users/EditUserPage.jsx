import { useEffect } from 'react'
import {
  json,
  redirect,
  useNavigate,
  useRouteLoaderData,
} from 'react-router-dom'
import { toast } from 'react-toastify'

import UserForm from '../../components/Content/Forms/UserForm'
import { API_URL } from '../../constants/constants'
import store from '../../store/index'
import { fetchUserData } from '../../store/user-actions'
import { tokenLoader } from '../../util/auth'
import classes from './EditUserPage.module.css'

const EditUserPage = () => {
  const user = useRouteLoaderData('user')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user.is_owner) {
      navigate('/')
    }
  }, [user, navigate])

  return (
    <div className={classes['edit-user-page']}>
      <h1 className={classes.heading}>Edit profile</h1>
      <hr className={classes.divider} />
      <UserForm user={user} />
    </div>
  )
}

export default EditUserPage

export const action = async ({ request, params }) => {
  const { username } = params

  const data = await request.formData()

  const currentlyPlaying = data.get('currently_playing')

  data.append('user[currently_playing]', currentlyPlaying || 'none')
  data.append('user[avatar]', data.get('avatar'))
  data.append('user[remove_avatar]', data.get('remove_avatar'))
  data.append('user[username]', data.get('username'))
  data.append('user[bio]', data.get('bio'))
  data.append('user[email]', data.get('email'))
  data.append('user[password]', data.get('password'))

  const newPassword = data.get('newPassword')
  if (newPassword) {
    data.append('user[new_password]', data.get('newPassword'))
  }

  const token = await tokenLoader()

  const response = await fetch(`${API_URL}/users/${username}`, {
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
    throw json({ message: 'Could not edit user' }, { status: 500 })
  }

  const user = await response.json()

  store.dispatch(fetchUserData())

  return redirect(`/users/${user.slug}`)
}
