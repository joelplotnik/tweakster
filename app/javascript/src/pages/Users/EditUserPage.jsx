import React from 'react'
import { json, redirect, useRouteLoaderData } from 'react-router-dom'
import { toast } from 'react-toastify'

import UserForm from '../../components/Content/Forms/UserForm'
import { API_URL } from '../../constants/constants'
import store from '../../store/index'
import { userActions } from '../../store/user'
import { tokenLoader } from '../../util/auth'
import classes from './EditUserPage.module.css'

const EditUserPage = () => {
  const user = useRouteLoaderData('user')

  return (
    <div className={classes['edit-user-page']}>
      <h1 className={classes.heading}>Edit profile</h1>
      <hr className={classes.divider} />
      <UserForm method="PUT" user={user} />
    </div>
  )
}

export default EditUserPage

export const action = async ({ request, params }) => {
  const { id } = params
  const userIdParam = parseInt(id)

  const data = await request.formData()

  data.append('user[avatar]', data.get('avatar'))
  data.append('user[remove_avatar]', data.get('remove_avatar'))
  data.append('user[username]', data.get('username'))
  data.append('user[url]', data.get('url'))
  data.append('user[bio]', data.get('bio'))
  data.append('user[email]', data.get('email'))
  data.append('user[password]', data.get('password'))

  const newPassword = data.get('newPassword')
  if (newPassword) {
    data.append('user[new_password]', data.get('newPassword'))
  }

  const token = tokenLoader()

  const response = await fetch(`${API_URL}/users/${id}`, {
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
    toast.error(responseData.message || 'Validation failed')
    return response
  }

  if (!response.ok) {
    throw json({ message: 'Could not edit user' }, { status: 500 })
  }

  // const { userId, userRole } = getUserData() || {}
  // const userIdParsed = parseInt(userId)

  // const user = await response.json()

  // if (userRole === 'admin' && userIdParsed === userIdParam) {
  //   store.dispatch(userActions.setUser(user))
  // } else if (userRole !== 'admin' && userIdParsed === userIdParam) {
  //   store.dispatch(userActions.setUser(user))
  // }

  return redirect(`/users/${user.id}`)
}
