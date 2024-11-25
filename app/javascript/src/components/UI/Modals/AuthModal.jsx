import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { RiCloseLine, RiTwitchFill } from 'react-icons/ri'
import { useDispatch } from 'react-redux'
import { Form, Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import Logo from '../../../assets/logo_color.svg'
import {
  API_URL,
  TWITCH_CLIENT_ID,
  TWITCH_REDIRECT_URI,
} from '../../../constants/constants'
import useInput from '../../../hooks/useInput'
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
  const emailInputRef = useRef(null)

  useEffect(() => {
    emailInputRef.current?.focus()
  }, [modalType])

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

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

    const { token, refresh_token, expires_in, resource_owner } = responseData

    storeTokens(token, refresh_token, expires_in)

    const { id, username, avatar_url, role } = resource_owner

    dispatch(userActions.setUser({ id, username, avatar_url, role }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    const buttonType = event.nativeEvent.submitter.dataset.type

    try {
      if (buttonType === 'twitch') {
        const currentPath = window.location.pathname
        localStorage.setItem('previous', currentPath)
        const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${TWITCH_CLIENT_ID}&redirect_uri=${TWITCH_REDIRECT_URI}&scope=user:read:email`
        window.location.href = twitchAuthUrl
      }

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
          email: enteredEmail,
          username: enteredUsername,
          password: enteredPassword,
        }

        const response = await fetch(`${API_URL}/users/tokens/sign_up`, {
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
        }

        const response = await fetch(`${API_URL}/users/tokens/sign_in`, {
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
              <div className={classes.header}>
                <img className={classes.icon} src={Logo} alt="Tweakster" />
                {modalType === 'login' && <h2>Log in</h2>}
                {modalType === 'signup' && <h2>Sign up</h2>}
              </div>
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
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    ref={emailInputRef}
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
                      <span>Username</span>
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
                    <span>Password</span>
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
                      <span>Confirm Password</span>
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
                {modalType === 'login' && (
                  <Link
                    to="account-recovery"
                    className={classes['trouble-link']}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Trouble logging in?
                  </Link>
                )}
                <button
                  type="submit"
                  className={classes['submit-btn']}
                  data-type="regular"
                  disabled={!formIsValid}
                >
                  {modalType === 'login' ? 'Log in' : 'Sign up'}
                </button>
                <button
                  type="submit"
                  className={classes['submit-btn-twitch']}
                  data-type="twitch"
                >
                  <RiTwitchFill />
                  <span className={classes['twitch-button-text']}>
                    {modalType === 'login'
                      ? 'Log in with Twitch'
                      : 'Sign up with Twitch'}
                  </span>
                </button>
              </Form>
              {modalType === 'login' && (
                <div className={classes.question}>
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
                <div className={classes.question}>
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
