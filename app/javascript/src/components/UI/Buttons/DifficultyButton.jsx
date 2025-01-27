import { useState } from 'react'
import { RiGameFill, RiGameLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'

import AuthModal from '../Modals/AuthModal'
import classes from './DifficultyButton.module.css'

const Difficulty = ({ rating, onClick }) => {
  const token = useSelector(state => state.token.token)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const maxDifficulty = 5

  const handleAuthModalToggle = () => {
    setShowAuthModal(prev => !prev)
  }

  const handleDifficulty = () => {
    if (!token) {
      setShowAuthModal(true)
      return
    }

    if (onClick) {
      onClick()
    }
  }

  return (
    <>
      <div className={classes.difficulty} onClick={handleDifficulty}>
        {Array.from({ length: maxDifficulty }, (_, index) => {
          const isFilled = index < rating
          return isFilled ? (
            <RiGameFill key={index} className={classes.filled} />
          ) : (
            <RiGameLine key={index} className={classes.unfilled} />
          )
        })}
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
    </>
  )
}

export default Difficulty
