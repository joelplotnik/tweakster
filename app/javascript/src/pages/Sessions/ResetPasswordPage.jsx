import { useState } from 'react'
import { Form, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import useInput from '../../hooks/useInput'
import classes from './ResetPasswordPage.module.css'

const ResetPasswordPage = () => {
  const { token } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

  const handleSubmit = async e => {
    e.preventDefault()

    setIsLoading(true)
    setErrorMessage('')

    setTimeout(() => {
      setIsLoading(false)
      toast.success('Password successfully reset! You can now log in.')
    }, 1000)
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
          <input
            type="password"
            id="password"
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            className={classes.input}
          />
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
          <input
            type="password"
            id="confirm-password"
            onChange={handleConfirmPasswordChange}
            onBlur={handleConfirmPasswordBlur}
            className={classes.input}
          />
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
