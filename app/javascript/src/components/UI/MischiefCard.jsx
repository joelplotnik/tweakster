import { Link, useNavigate } from 'react-router-dom'

import React from 'react'
import classes from './MischiefCard.module.css'

export function MischiefCard({ piece }) {
  const navigate = useNavigate()
  const { title, user, images } = piece
  const username = user.username
  const imageUrl = images.length > 0 ? images[0] : null

  const handleCardClick = () => {
    navigate(`/channels/${piece.channel.id}/pieces/${piece.id}`)
  }

  const stopPropagation = (event) => {
    event.stopPropagation()
  }

  return (
    <div onClick={handleCardClick} className={classes.card}>
      <img className={classes.image} src={imageUrl} alt={title} />
      <div className={classes.text}>
        <h3 className={classes.title}>{title}</h3>
        <Link
          to={`/users/${piece.user_id}`}
          className={classes.user}
          onClick={stopPropagation}
        >
          {username}
        </Link>
      </div>
    </div>
  )
}
