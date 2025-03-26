import React from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'

import classes from './ErrorPage.module.css'

const ErrorPage = () => {
  const error = useRouteError()
  const navigate = useNavigate()

  const title = 'Oops!'
  let message = 'Something went wrong...'

  if (error && error.status === 500 && error.data?.message) {
    message = error.data.message
  }

  if (error && error.status === 404) {
    message = 'Could not find resource or page.'
  }

  const goToHomepage = () => {
    navigate('/')
  }

  return (
    <>
      <main className={classes.error}>
        <h1 className={classes.title}>{title}</h1>
        <p className={classes.message}>{message}</p>
        <button onClick={goToHomepage} className={classes['go-home-button']}>
          Back to the Game
        </button>
      </main>
    </>
  )
}

export default ErrorPage
