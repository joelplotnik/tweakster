import React, { useState } from 'react'
import { RiGameFill, RiGameLine } from 'react-icons/ri'

import classes from './DifficultyForm.module.css'

const DifficultyForm = ({ onVote }) => {
  const maxDifficulty = 5
  const [rating, setRating] = useState(0) // Keeps track of the current selected rating

  const handleClick = newRating => {
    setRating(newRating)
    if (onVote) {
      onVote(newRating) // Calls the onVote callback with the new rating
    }
  }

  return (
    <div className={classes['difficulty-form']}>
      <h2 className={classes.header}>Rate Difficulty</h2>
      <hr className={classes.divider} />
      <div className={classes.difficulty}>
        {Array.from({ length: maxDifficulty }, (_, index) => {
          const isFilled = index < rating
          return isFilled ? (
            <RiGameFill
              key={index}
              className={`${classes.filled} ${classes.icon}`}
              onClick={() => handleClick(index + 1)} // Set the rating when clicked
            />
          ) : (
            <RiGameLine
              key={index}
              className={`${classes.unfilled} ${classes.icon}`}
              onClick={() => handleClick(index + 1)} // Set the rating when clicked
            />
          )
        })}
      </div>
    </div>
  )
}

export default DifficultyForm
