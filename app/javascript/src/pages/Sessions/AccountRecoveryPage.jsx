import { useState } from 'react'
import { Form } from 'react-router-dom'
import { toast } from 'react-toastify'

import classes from './AccountRecoveryPage.module.css'

const AccountRecoveryPage = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleEmailChange = e => setEmail(e.target.value)

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate sending the email
    setTimeout(() => {
      toast.success('Recovery email sent! Please check your inbox.')
      setIsLoading(false)
      setEmailSent(true)
    }, 1000)
  }

  const handleResendEmail = () => {
    setIsLoading(true)
    setTimeout(() => {
      toast.info('Recovery email resent! Check your inbox.')
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className={classes.container}>
      <h2 className={classes.header}>Account Recovery</h2>
      <hr className={classes.divider} />
      {emailSent ? (
        <div className={classes['follow-up']}>
          <p className={classes.message}>
            Recovery email sent to <strong>{email}</strong>.
          </p>
          <p className={classes.message}>Didn’t receive an email?</p>
          <button
            onClick={handleResendEmail}
            disabled={isLoading}
            className={classes.button}
          >
            {isLoading ? 'Resending...' : 'Resend Email'}
          </button>
        </div>
      ) : (
        <Form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes['input-group']}>
            <label htmlFor="email">
              <span className={classes.label}>Email</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              required
              placeholder="e.g., user@example.com"
              className={classes.input}
            />
          </div>
          <button type="submit" disabled={isLoading} className={classes.button}>
            {isLoading ? 'Sending...' : 'Send Recovery Email'}
          </button>
        </Form>
      )}
    </div>
  )
}

export default AccountRecoveryPage
