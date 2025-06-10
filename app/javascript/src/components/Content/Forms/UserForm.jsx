import { useRef, useState } from 'react'
import { RiEyeFill, RiEyeOffFill, RiImageAddLine } from 'react-icons/ri'
import { useDispatch, useSelector } from 'react-redux'
import {
  Form,
  Link,
  useActionData,
  useNavigate,
  useNavigation,
} from 'react-router-dom'
import { toast } from 'react-toastify'

import placeholderAvatar from '../../../assets/default_avatar.png'
import { API_URL } from '../../../constants/constants'
import useInput from '../../../hooks/useInput'
import { userActions } from '../../../store/user'
import { clearTokens } from '../../../util/auth'
import GameSelectDropdown from '../../UI/Buttons/GameSelectDropdown'
import ConfirmationModal from '../../UI/Modals/ConfirmationModal'
import classes from './UserForm.module.css'

const UserForm = ({ user }) => {
  const data = useActionData()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const [avatar, setAvatar] = useState(user?.avatar_url)
  const fileInput = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const dispatch = useDispatch()
  const token = useSelector(state => state.token.token)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [selectedGame, setSelectedGame] = useState(user?.currently_playing)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleGameSelect = game => {
    setSelectedGame(game)
  }

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
    setAvatar(placeholderAvatar)
    setRemoveAvatar(true)
    fileInput.current.value = null
  }

  const handleModalToggle = () => {
    setShowModal(!showModal)
  }

  const togglePasswordFields = () => {
    setShowPasswordFields(prevState => {
      if (prevState) {
        handlePasswordChange({ target: { value: '' } })
        handleNewPasswordChange({ target: { value: '' } })
        handleConfirmPasswordChange({ target: { value: '' } })
      }
      return !prevState
    })
  }

  const handleDelete = async () => {
    try {
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

      clearTokens()
      dispatch(userActions.clearUser())

      return navigate('/')
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error deleting user')
    }
  }

  return (
    <>
      <Form
        method={'PUT'}
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
            name="user[avatar]"
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
          {avatar && !avatar.endsWith('default_avatar.png') && (
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
            name="user[remove_avatar]"
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
            name="user[username]"
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
            name="user[email]"
            placeholder="Email"
            value={enteredEmail}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            required
          />
        </div>
        <textarea
          className={classes['form-textarea']}
          id="bio"
          name="user[bio]"
          placeholder="Bio"
          defaultValue={user ? user.bio : ''}
        />
        <div className={classes['input-wrapper']}>
          <GameSelectDropdown
            onGameSelect={handleGameSelect}
            selectedGame={selectedGame}
          />
        </div>
        <div className={classes['input-wrapper']}>
          <button
            type="button"
            onClick={togglePasswordFields}
            className={classes['change-password-btn']}
          >
            {showPasswordFields ? 'Hide password fields' : 'Change password?'}
          </button>
        </div>
        {showPasswordFields && (
          <>
            <div
              className={`${classes['input-wrapper']} ${newPasswordInvalid}`}
            >
              {newPasswordInputHasError && (
                <p className={classes['error-text']}>
                  Please enter a valid password.
                </p>
              )}
              <div className={classes['password-wrapper']}>
                <input
                  className={classes['form-input']}
                  type={showNewPassword ? 'text' : 'password'}
                  id="new_password"
                  name="user[new_password]"
                  onChange={handleNewPasswordChange}
                  onBlur={handleNewPasswordBlur}
                  placeholder="New password"
                />
                <span
                  className={classes['eye-icon']}
                  onClick={() => setShowNewPassword(prev => !prev)}
                >
                  {showNewPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                </span>
              </div>
            </div>
            <div
              className={`${classes['input-wrapper']} ${confirmPasswordInvalidClass}`}
            >
              {confirmPasswordInputHasError && (
                <p className={classes['error-text']}>Passwords do not match.</p>
              )}
              <div className={classes['password-wrapper']}>
                <input
                  className={classes['form-input']}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm_password"
                  name="user[confirm_password]"
                  onChange={handleConfirmPasswordChange}
                  onBlur={handleConfirmPasswordBlur}
                  placeholder="Confirm password"
                  required={enteredNewPassword.trim().length > 0}
                />
                <span
                  className={classes['eye-icon']}
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                >
                  {showConfirmPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                </span>
              </div>
            </div>
            {user.password_set && (
              <div className={`${classes['input-wrapper']} ${passwordInvalid}`}>
                {passwordInputHasError && (
                  <p className={classes['error-text']}>
                    Please enter a valid password.
                  </p>
                )}
                <div className={classes['password-wrapper']}>
                  <input
                    className={classes['form-input']}
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="password"
                    name="user[password]"
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    placeholder="Current password"
                  />
                  <span
                    className={classes['eye-icon']}
                    onClick={() => setShowCurrentPassword(prev => !prev)}
                  >
                    {showCurrentPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                  </span>
                </div>
              </div>
            )}{' '}
          </>
        )}
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
          {isSubmitting ? 'Submitting' : 'Submit'}
        </button>
      </Form>
      <div className={classes['delete-button-container']}>
        <Link
          className={classes['delete-button']}
          onClick={() => handleModalToggle()}
        >
          Delete account
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
