import React, { useRef, useState } from 'react'
import { RiImageAddLine } from 'react-icons/ri'
import { useDispatch } from 'react-redux'
import {
  Form,
  Link,
  useActionData,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from 'react-router-dom'
import { toast } from 'react-toastify'

import { API_URL } from '../../../constants/constants'
import useInput from '../../../hooks/use-input'
import { userActions } from '../../../store/user'
import ConfirmationModal from '../../UI/Modals/ConfirmationModal'
import classes from './UserForm.module.css'

const UserForm = ({ method, user }) => {
  const data = useActionData()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const [avatar, setAvatar] = useState(user?.avatar_url)
  const fileInput = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const dispatch = useDispatch()
  const token = useRouteLoaderData('root')
  const currentUser = useSelector(state => state.userPage.user)
  const [removeAvatar, setRemoveAvatar] = useState(false)

  const {
    value: enteredUsername,
    hasError: usernameInputHasError,
    valueChangeHandler: handleUsernameChange,
    handleInputBlur: handleUsernameBlur,
  } = useInput(
    value => {
      const isValid =
        value.trim() !== '' &&
        value.length >= 2 &&
        value.length <= 25 &&
        /^[a-zA-Z0-9_.]+$/.test(value)
      return isValid
    },
    user ? user.username : ''
  )

  const {
    value: enteredEmail,
    hasError: emailInputHasError,
    valueChangeHandler: handleEmailChange,
    handleInputBlur: handleEmailBlur,
  } = useInput(
    value => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    user ? user.email : ''
  )

  const {
    hasError: passwordInputHasError,
    valueChangeHandler: handlePasswordChange,
    handleInputBlur: handlePasswordBlur,
  } = useInput(value => {
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
    return passwordRegex.test(value)
  })

  const {
    value: enteredNewPassword,
    hasError: newPasswordInputHasError,
    valueChangeHandler: handleNewPasswordChange,
    handleInputBlur: handleNewPasswordBlur,
  } = useInput(value => {
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
    return passwordRegex.test(value)
  })

  const {
    hasError: confirmPasswordInputHasError,
    valueChangeHandler: handleConfirmPasswordChange,
    handleInputBlur: handleConfirmPasswordBlur,
  } = useInput(value => value === enteredNewPassword)

  const emailInvalidClass = emailInputHasError ? `${classes.invalid}` : ''
  const usernameInvalidClass = usernameInputHasError ? `${classes.invalid}` : ''
  const passwordInvalid = passwordInputHasError ? `${classes.invalid}` : ''
  const newPasswordInvalid = newPasswordInputHasError
    ? `${classes.invalid}`
    : ''
  const confirmPasswordInvalidClass = confirmPasswordInputHasError
    ? `${classes.invalid}`
    : ''

  const handleAvatarUpload = event => {
    const uploadedAvatar = event.target.files[0]

    if (uploadedAvatar) {
      setAvatar(URL.createObjectURL(uploadedAvatar))
    }

    setRemoveAvatar(false)
  }

  const handleRemoveAvatar = event => {
    event.preventDefault()
    setRemoveAvatar(true)
    fileInput.current.value = null
  }

  const handleModalToggle = () => {
    setShowModal(!showModal)
  }

  const handleDelete = async () => {
    try {
      const userIdInt = parseInt(currentUser.id, 10)

      if (currentUser.role === 'admin' || userIdInt === user.id) {
        const response = await fetch(`${API_URL}/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Could not delete user')
        }

        if (currentUser.role === 'admin' && userIdInt === user.id) {
          dispatch(userActions.clearUser())
          localStorage.clear()
        } else if (currentUser.role !== 'admin' && userIdInt === user.id) {
          dispatch(userActions.clearUser())
          localStorage.clear()
        }
      }
      return navigate('/')
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error deleting user')
    }
  }

  return (
    <>
      <Form
        method={method}
        className={classes['form-container']}
        encType="multipart/form-data"
      >
        <div className={classes['upload-avatar-container']}>
          <div className={classes['avatar-container']}>
            <img className={classes.avatar} src={avatar} alt="User" />
          </div>
          <input
            className={classes['avatar-input']}
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            ref={fileInput}
            onChange={handleAvatarUpload}
          />
          <button
            className={classes['upload-avatar-btn']}
            onClick={event => {
              event.preventDefault()
              fileInput.current.click()
            }}
          >
            <RiImageAddLine />
          </button>
          {avatar && (
            <div className={classes['remove-avatar-button-container']}>
              <button
                className={classes['remove-avatar-button']}
                onClick={handleRemoveAvatar}
              >
                Remove current avatar
              </button>
            </div>
          )}
          <input
            type="hidden"
            name="remove_avatar"
            value={removeAvatar ? 'true' : 'false'}
          />
        </div>
        <div className={`${classes['input-wrapper']} ${usernameInvalidClass}`}>
          {usernameInputHasError && (
            <p className={classes['error-text']}>
              Please enter a valid username.
            </p>
          )}
          <input
            className={classes['form-input']}
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={enteredUsername}
            onChange={handleUsernameChange}
            onBlur={handleUsernameBlur}
            required
          />
        </div>
        <div className={`${classes['input-wrapper']} ${emailInvalidClass}`}>
          {emailInputHasError && (
            <p className={classes['error-text']}>Please enter a valid email.</p>
          )}
          <input
            className={classes['form-input']}
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={enteredEmail}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            required
          />
        </div>
        <input
          className={classes['url-input']}
          type="text"
          id="url"
          name="url"
          placeholder="Url"
          defaultValue={user ? user.url : ''}
        />
        <textarea
          className={classes['form-textarea']}
          id="bio"
          name="bio"
          placeholder="Bio"
          defaultValue={user ? user.bio : ''}
        />
        <div className={`${classes['input-wrapper']} ${newPasswordInvalid}`}>
          {newPasswordInputHasError && (
            <p className={classes['error-text']}>
              Please enter a valid password.
            </p>
          )}
          <input
            className={classes['form-input']}
            type="password"
            id="newPassword"
            name="newPassword"
            onChange={handleNewPasswordChange}
            onBlur={handleNewPasswordBlur}
            placeholder="New Password"
          />
        </div>
        <div
          className={`${classes['input-wrapper']} ${confirmPasswordInvalidClass}`}
        >
          {confirmPasswordInputHasError && (
            <p className={classes['error-text']}>Passwords do not match.</p>
          )}
          <input
            className={classes['form-input']}
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            onChange={handleConfirmPasswordChange}
            onBlur={handleConfirmPasswordBlur}
            placeholder="Confirm Password"
            required={enteredNewPassword.trim().length > 0}
          />
        </div>
        <div className={`${classes['input-wrapper']} ${passwordInvalid}`}>
          {passwordInputHasError && (
            <p className={classes['error-text']}>
              Please enter a valid password.
            </p>
          )}
          <input
            className={classes['form-input']}
            type="password"
            id="password"
            name="password"
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            placeholder="Current Password"
            required={currentUser.role !== 'admin'}
          />
        </div>
        {data && data.error && (
          <ul className={classes['form-error-list']}>
            <li className={classes['form-error']}>{data.error}</li>
          </ul>
        )}
        <button
          type="submit"
          className={classes['form-submit-button']}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Submitting'
            : method === 'POST'
            ? 'Create User'
            : 'Submit'}
        </button>
      </Form>
      <div className={classes['delete-button-container']}>
        <Link
          className={classes['delete-button']}
          onClick={() => handleModalToggle()}
        >
          Delete Account
        </Link>
      </div>
      {showModal && (
        <ConfirmationModal
          onConfirm={handleDelete}
          onClick={handleModalToggle}
        />
      )}
    </>
  )
}

export default UserForm
