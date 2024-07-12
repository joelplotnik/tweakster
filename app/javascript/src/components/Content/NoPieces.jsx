import React from 'react'
import { Link, useRouteLoaderData } from 'react-router-dom'

import classes from './NoPieces.module.css'

const NoPieces = ({ listPage, owner, isHomePage }) => {
  const token = useRouteLoaderData('root')

  let message = ''
  let buttonText = ''
  let linkTo = ''

  switch (listPage) {
    case 'new':
      message = 'Subscribe to your favorite channels to create a piece!'
      buttonText = 'Browse Channels'
      linkTo = '/main'

      break
    case 'main':
      if (isHomePage) {
        message = 'Subscribe to your favorite channels to view pieces here!'
        buttonText = 'Browse Channels'
        linkTo = 'channels'
      }

      break
    case 'channel':
      if (token && owner) {
        message = 'Create your first piece for this channel!'
        buttonText = 'Create Piece'
        linkTo = 'pieces/new'
      } else if (token && !owner) {
        message =
          "This channel doesn't have any pieces yet.\n Subscribe to this channel to create a piece for it!"
      } else {
        message =
          "This channel doesn't have any pieces yet. Sign up and subscribe to the channel to create a piece for it!"
      }

      break
    case 'user':
      if (token && owner) {
        message = 'Create your first piece!'
        buttonText = 'Create Piece'
        linkTo = '/new'
      } else {
        message = "This user hasn't created any pieces."
      }

      break
    default:
      message = 'There are no pieces to be displayed.'
  }

  return (
    <div className={classes.card}>
      <div className={classes['content-wrapper']}>
        <p className={classes.message}>{message}</p>
        {buttonText && linkTo && (
          <Link to={linkTo}>
            <button className={classes.btn}>{buttonText}</button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default NoPieces
