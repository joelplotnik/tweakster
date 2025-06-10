import { useState } from 'react'
import { RiEyeFill, RiEyeOffFill } from 'react-icons/ri'
import { Form, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import useInput from '../../hooks/useInput'
import classes from './ResetPasswordPage.module.css'

const ResetPasswordPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    value: enteredPassword,
    isValid: enteredPasswordIsValid,
    hasError: passwordInputHasError,
    valueChangeHandler: handlePasswordChange,
    handleInputBlur: handlePasswordBlur,
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
  } = useInput(value => value === enteredPassword)

  const handleSubmit = async event => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/v1/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            reset_password_token: token,
            password: enteredPassword,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reset password.')
      }

      toast.success('Password successfully reset! You can now log in.')
      navigate('/')
    } catch (error) {
      setErrorMessage(error.message || 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  let formIsValid = false
  if (enteredPasswordIsValid && enteredConfirmPasswordIsValid) {
    formIsValid = true
  }

  if (!token) {
    return (
      <div className={classes.container}>
        <h2 className={classes.header}>Reset Password</h2>
        <hr className={classes.divider} />
        <p className={classes['error-message']}>
          Invalid or missing token. Please request a new password reset email.
        </p>
      </div>
    )
  }

  return (
    <div className={classes.container}>
      <h2 className={classes.header}>Reset Password</h2>
      <hr className={classes.divider} />
      <Form onSubmit={handleSubmit} className={classes.form}>
        <div className={classes['input-group']}>
          <label htmlFor="password">
            <span className={classes.label}>New Password</span>
          </label>
          <div className={classes['password-wrapper']}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              className={classes.input}
            />
            <span
              className={classes['eye-icon']}
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
            </span>
          </div>
          {passwordInputHasError && (
            <p className={classes['error-message']}>
              Please enter a valid password.
            </p>
          )}
        </div>
        <div className={classes['input-group']}>
          <label htmlFor="confirmPassword">
            <span className={classes.label}>Confirm Password</span>
          </label>
          <div className={classes['password-wrapper']}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm-password"
              onChange={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
              className={classes.input}
            />
            <span
              className={classes['eye-icon']}
              onClick={() => setShowConfirmPassword(prev => !prev)}
            >
              {showConfirmPassword ? <RiEyeOffFill /> : <RiEyeFill />}
            </span>
          </div>
          {confirmPasswordInputHasError && (
            <p className={classes['error-message']}>Passwords do not match.</p>
          )}
        </div>
        {errorMessage && (
          <p className={classes['error-message']}>{errorMessage}</p>
        )}
        <button
          type="submit"
          disabled={!formIsValid || isLoading}
          className={classes.button}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </Form>
    </div>
  )
}

export default ResetPasswordPage
