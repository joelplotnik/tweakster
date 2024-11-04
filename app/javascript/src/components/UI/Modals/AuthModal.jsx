import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { RiCloseLine } from 'react-icons/ri'
import { useDispatch } from 'react-redux'
import { Form, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { API_URL, CLIENT_ID, CLIENT_SECRET } from '../../../constants/constants'
import useInput from '../../../hooks/use-input'
import { userActions } from '../../../store/user'
import { storeTokens } from '../../../util/auth'
import classes from './AuthModal.module.css'
import { Backdrop } from './Backdrop'

export function AuthModal({ authType, onClick }) {
  const dispatch = useDispatch()
  const [modalType, setModalType] = useState(authType)
  const [signupError, setSignupError] = useState(null)
  const [loginError, setLoginError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const {
    value: enteredUsername,
    isValid: enteredUsernameIsValid,
    hasError: usernameInputHasError,
    valueChangeHandler: handleUsernameChange,
    handleInputBlur: handleUsernameBlur,
    reset: resetUsernameInput,
  } = useInput(value => {
    const isValid =
      value.trim() !== '' &&
      value.length >= 2 &&
      value.length <= 25 &&
      /^[a-zA-Z0-9_.]+$/.test(value)
    return isValid
  })

  const {
    value: enteredEmail,
    isValid: enteredEmailIsValid,
    hasError: emailInputHasError,
    valueChangeHandler: handleEmailChange,
    handleInputBlur: handleEmailBlur,
    reset: resetEmailInput,
  } = useInput(value => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  })

  const {
    value: enteredPassword,
    isValid: enteredPasswordIsValid,
    hasError: passwordInputHasError,
    valueChangeHandler: handlePasswordChange,
    handleInputBlur: handlePasswordBlur,
    reset: resetPasswordInput,
  } = useInput(value => {
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
    return passwordRegex.test(value)
  })

  const {
    isValid: enteredConfirmPasswordIsValid,
    hasError: confirmPasswordInputHasError,
    valueChangeHandler: handleConfirmPasswordChange,
    handleInputBlur: handleConfirmPasswordBlur,
    reset: resetConfirmPasswordInput,
  } = useInput(value => value === enteredPassword)

  const storeUserData = async response => {
    const responseData = await response.json()
    const { access_token, refresh_token, expires_in } = responseData

    storeTokens(access_token, refresh_token, expires_in)

    const meResponse = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!meResponse.ok) {
      throw new Error('Failed to fetch user data.')
    }

    const meData = await meResponse.json()
    const { id, username, role, avatar_url } = meData

    dispatch(userActions.setUser({ id, username, role, avatar_url }))
  }

  const handleSubmit = async event => {
    event.preventDefault()

    try {
      if (modalType === 'signup') {
        if (
          !enteredUsernameIsValid ||
          !enteredEmailIsValid ||
          !enteredPasswordIsValid ||
          !enteredConfirmPasswordIsValid
        ) {
          return
        }

        const signupData = {
          client_id: CLIENT_ID,
          email: enteredEmail,
          username: enteredUsername,
          password: enteredPassword,
        }

        const response = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signupData),
        })

        if (response.status === 422) {
          const responseData = await response.json()
          setSignupError(responseData.status.errors)
          return
        }

        if (!response.ok) {
          throw new Error('Could not create user.')
        }

        await storeUserData(response)

        resetUsernameInput()
        resetEmailInput()
        resetPasswordInput()
        resetConfirmPasswordInput()
        onClick()
        navigate(location.pathname)
      } else {
        if (!enteredEmailIsValid || !enteredPasswordIsValid) {
          return
        }

        const loginData = {
          grant_type: 'password',
          email: enteredEmail,
          password: enteredPassword,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }

        const response = await fetch(`${API_URL}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        })

        if (response.status === 422 || response.status === 401) {
          setLoginError(['Username or Password incorrect'])
          return
        }

        if (!response.ok) {
          throw new Error('Could not authenticate user.')
        }

        await storeUserData(response)

        resetUsernameInput()
        resetPasswordInput()
        onClick()
        navigate(location.pathname)
      }
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error logging in user')
    }
  }

  let formIsValid = false
  if (
    modalType === 'signup' &&
    enteredUsernameIsValid &&
    enteredEmailIsValid &&
    enteredPasswordIsValid &&
    enteredConfirmPasswordIsValid
  ) {
    formIsValid = true
  }
  if (modalType === 'login' && enteredEmailIsValid && enteredPasswordIsValid) {
    formIsValid = true
  }

  const emailInvalidClass = emailInputHasError ? `${classes.invalid}` : ''
  const usernameInvalidClass = usernameInputHasError ? `${classes.invalid}` : ''
  const passwordInvalid = passwordInputHasError ? `${classes.invalid}` : ''
  const confirmPasswordInvalidClass = confirmPasswordInputHasError
    ? `${classes.invalid}`
    : ''

  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop
          onClick={event => {
            event.stopPropagation()
            onClick()
          }}
        />,
        document.getElementById('backdrop-root')
      )}
      {ReactDOM.createPortal(
        <>
          <div className={classes.modal}>
            <button
              className={classes['close-icon']}
              onClick={event => {
                event.stopPropagation()
                onClick()
              }}
            >
              <RiCloseLine />
            </button>
            <div
              className={classes['modal-content']}
              onClick={e => e.stopPropagation()}
            >
              {modalType === 'login' && <h2>Log In</h2>}
              {modalType === 'signup' && <h2>Sign Up</h2>}
              {signupError && (
                <div className={classes['error-text']}>
                  {signupError.map(error => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
              {loginError && (
                <div className={classes['error-text']}>
                  {loginError.map(error => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
              <Form onSubmit={handleSubmit}>
                <div className={emailInvalidClass}>
                  <label>
                    <span>Email:</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                  />
                  {emailInputHasError && (
                    <p className={classes['error-text']}>
                      Please enter a valid email.
                    </p>
                  )}
                </div>
                {modalType === 'signup' && (
                  <div className={usernameInvalidClass}>
                    <label>
                      <span>Username:</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      onChange={handleUsernameChange}
                      onBlur={handleUsernameBlur}
                    />
                    {usernameInputHasError && (
                      <p className={classes['error-text']}>
                        Please enter a valid username.
                      </p>
                    )}
                  </div>
                )}
                <div className={passwordInvalid}>
                  <label>
                    <span>Password:</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                  />
                  {passwordInputHasError && (
                    <p className={classes['error-text']}>
                      Please enter a valid password.
                    </p>
                  )}
                </div>
                {modalType === 'signup' && (
                  <div className={confirmPasswordInvalidClass}>
                    <label>
                      <span>Confirm Password:</span>
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      onChange={handleConfirmPasswordChange}
                      onBlur={handleConfirmPasswordBlur}
                    />
                    {confirmPasswordInputHasError && (
                      <p className={classes['error-text']}>
                        Passwords do not match.
                      </p>
                    )}
                  </div>
                )}
                <button
                  type="submit"
                  className={classes['submit-btn']}
                  disabled={!formIsValid}
                >
                  {modalType === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              </Form>
              {modalType === 'login' && (
                <div>
                  {' '}
                  New to Tweakster?
                  <button
                    type="button"
                    id="swith-to-signup"
                    className={classes['switch-modal-btn']}
                    onClick={() => {
                      const emailInput = document.getElementById('email')
                      const passwordInput = document.getElementById('password')

                      emailInput.value = ''
                      passwordInput.value = ''

                      resetEmailInput()
                      resetPasswordInput()
                      setModalType('signup')
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
              {modalType === 'signup' && (
                <div>
                  {' '}
                  Already have an account?
                  <button
                    type="button"
                    id="switch-to-login"
                    className={classes['switch-modal-btn']}
                    onClick={() => {
                      const emailInput = document.getElementById('email')
                      const usernameInput = document.getElementById('username')
                      const passwordInput = document.getElementById('password')
                      const confirmPasswordInput =
                        document.getElementById('confirm-password')

                      emailInput.value = ''
                      usernameInput.value = ''
                      passwordInput.value = ''
                      confirmPasswordInput.value = ''

                      resetUsernameInput()
                      resetEmailInput()
                      resetPasswordInput()
                      resetConfirmPasswordInput()
                      setModalType('login')
                    }}
                  >
                    Log In
                  </button>
                </div>
              )}
            </div>
          </div>
        </>,
        document.getElementById('overlay-root')
      )}
    </>
  )
}

export default AuthModal
