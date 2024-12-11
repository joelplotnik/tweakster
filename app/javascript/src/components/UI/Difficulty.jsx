import { RiGameFill, RiGameLine } from 'react-icons/ri'

import classes from './Difficulty.module.css'

const Difficulty = ({ rating }) => {
  const maxDifficulty = 5

  return (
    <div className={classes.difficulty}>
      {Array.from({ length: maxDifficulty }, (_, index) => {
        const isFilled = index < rating
        return isFilled ? (
          <RiGameFill key={index} className={classes.filled} />
        ) : (
          <RiGameLine key={index} className={classes.unfilled} />
        )
      })}
    </div>
  )
}

export default Difficulty
