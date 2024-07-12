import React, { useRef, useState } from 'react'
import { RiImageAddLine } from 'react-icons/ri'
import {
  Form,
  Link,
  useActionData,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from 'react-router-dom'
import { toast } from 'react-toastify'

import defaultVisual from '../../../assets/default-visual.png'
import { API_URL } from '../../../constants/constants'
import useInput from '../../../hooks/use-input'
import { getUserData } from '../../../util/auth'
import ConfirmationModal from '../../UI/Modals/ConfirmationModal'
import classes from './ChannelForm.module.css'

const ChannelForm = ({ method, channel, type }) => {
  const { userRole } = getUserData() || {}
  const data = useActionData()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const [visual, setVisual] = useState(channel?.visual_url || defaultVisual)
  const fileInput = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const token = useRouteLoaderData('root')
  const [removeVisual, setRemoveVisual] = useState(false)

  const {
    value: enteredName,
    hasError: nameInputHasError,
    valueChangeHandler: handleNameChange,
    handleInputBlur: handleNameBlur,
  } = useInput(
    value => {
      const isValid =
        value.trim() !== '' &&
        value.length >= 2 &&
        value.length <= 25 &&
        /^[a-zA-Z0-9_.]+$/.test(value)
      return isValid
    },
    channel ? channel.name : ''
  )

  const handleVisualUpload = event => {
    const uploadedVisual = event.target.files[0]

    if (uploadedVisual) {
      setVisual(URL.createObjectURL(uploadedVisual))
    }

    setRemoveVisual(false)
  }

  const handleRemoveVisual = event => {
    event.preventDefault()
    setVisual(defaultVisual)
    setRemoveVisual(true)
    fileInput.current.value = null
  }

  const handleModalToggle = () => {
    setShowModal(!showModal)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/channels/${channel.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Could not delete channel')
      }

      return navigate('/')
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error deleting channel')
    }
  }

  const nameInvalidClass = nameInputHasError ? `${classes.invalid}` : ''

  return (
    <>
      <Form
        method="POST"
        className={classes['form-container']}
        encType="multipart/form-data"
      >
        {data && data.errors && (
          <ul className={classes['form-error-list']}>
            {Object.values(data.errors).map(err => (
              <li className={classes['form-error']} key={err}>
                {err}
              </li>
            ))}
          </ul>
        )}
        <div className={classes['upload-visual-container']}>
          <div className={classes['visual-container']}>
            <img className={classes.visual} src={visual} alt="User" />
          </div>
          <input
            className={classes['visual-input']}
            type="file"
            id="visual"
            name="visual"
            accept="image/*"
            ref={fileInput}
            onChange={handleVisualUpload}
          />
          <button
            className={classes['upload-visual-btn']}
            onClick={event => {
              event.preventDefault()
              fileInput.current.click()
            }}
          >
            <RiImageAddLine />
          </button>
          {visual !== defaultVisual && (
            <div className={classes['remove-visual-button-container']}>
              <button
                className={classes['remove-visual-button']}
                onClick={handleRemoveVisual}
              >
                Remove current visual
              </button>
            </div>
          )}
          <input
            type="hidden"
            name="remove_visual"
            value={removeVisual ? 'true' : 'false'}
          />
        </div>
        <div className={`${classes['input-wrapper']} ${nameInvalidClass}`}>
          {nameInputHasError && (
            <p className={classes['error-text']}>
              Please enter a valid channel name.
            </p>
          )}
          <input
            className={classes['name-input']}
            type="text"
            id="name"
            name="name"
            placeholder="name"
            value={enteredName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            required
          />
        </div>
        <input
          className={classes['url-input']}
          type="text"
          id="url"
          name="url"
          placeholder="Url"
          defaultValue={channel ? channel.url : ''}
        />
        <textarea
          className={classes['form-textarea']}
          id="summary"
          name="summary"
          placeholder="Summary"
          defaultValue={channel ? channel.summary : ''}
        />
        <textarea
          className={classes['form-textarea']}
          id="protocol"
          name="protocol"
          placeholder="Protocol"
          defaultValue={channel ? channel.protocol : ''}
        />
        <button
          type="submit"
          className={classes['form-submit-button']}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Submitting'
            : method === 'POST'
            ? 'Create'
            : 'Submit'}
        </button>
      </Form>
      {type === 'edit' && userRole === 'admin' && (
        <div className={classes['delete-button-container']}>
          <div className={classes['delete-button-container']}>
            <Link
              className={classes['delete-button']}
              onClick={() => handleModalToggle()}
            >
              Delete Channel
            </Link>
          </div>
        </div>
      )}
      {showModal && (
        <ConfirmationModal
          onConfirm={handleDelete}
          onClick={handleModalToggle}
        />
      )}
    </>
  )
}

export default ChannelForm
