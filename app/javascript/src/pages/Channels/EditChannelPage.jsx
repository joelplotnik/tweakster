import React from 'react'
import { json, redirect, useRouteLoaderData } from 'react-router-dom'
import { toast } from 'react-toastify'

import ChannelForm from '../../components/Content/Forms/ChannelForm'
import { API_URL } from '../../constants/constants'
import { tokenLoader } from '../../util/auth'
import classes from './EditChannelPage.module.css'

const EditChannelPage = () => {
  const channel = useRouteLoaderData('channel')

  return (
    <div className={classes['edit-channel-page']}>
      <h1 className={classes.heading}>Edit channel</h1>
      <hr className={classes.divider} />
      <ChannelForm method="PUT" channel={channel} type="edit" />
    </div>
  )
}

export default EditChannelPage

export const action = async ({ request, params }) => {
  const { id } = params

  const data = await request.formData()

  data.append('channel[visual]', data.get('visual'))
  data.append('channel[remove_visual]', data.get('remove_visual'))
  data.append('channel[name]', data.get('name'))
  data.append('channel[url]', data.get('url'))
  data.append('channel[summary]', data.get('summary'))
  data.append('channel[protocol]', data.get('protocol'))

  const token = tokenLoader()

  const response = await fetch(`${API_URL}/channels/${id}`, {
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
    throw json({ message: 'Could not edit channel' }, { status: 500 })
  }

  const channel = await response.json()

  return redirect(`/channels/${channel.id}`)
}
