import { useState } from 'react'
import { RiGameFill, RiGameLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'

import { API_URL } from '../../../constants/constants'
import classes from './DifficultySlideUpForm.module.css'

const DifficultySlideUpForm = ({
  userRating,
  difficultiesCount,
  average,
  basePath,
  challengeId,
  handleDifficultyRating,
}) => {
  const token = useSelector(state => state.token.token)
  const [rating, setRating] = useState(userRating || 0)
  const [currentCount, setCurrentCount] = useState(
    Number(difficultiesCount) || 0
  )
  const [loading, setLoading] = useState(false)

  const handleVote = async newRating => {
    if (!token) {
      setShowAuthModal(true)
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/${basePath}/challenges/${challengeId}/difficulties`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            difficulty: { rating: newRating },
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        const newUserRating = newRating === rating ? null : newRating
        const newDifficultyRating = data.difficulty_rating
        const newDifficultiesCount = data.difficulties_count

        handleDifficultyRating(
          newUserRating,
          newDifficultyRating,
          newDifficultiesCount
        )

        if (newRating === rating) {
          // Removing the rating
          setRating(0)
          setCurrentCount(prev => prev - 1)
        } else {
          // Updating or adding the rating
          setRating(newRating)
          if (rating === 0) {
            setCurrentCount(prev => prev + 1)
          }
        }
      } else {
        console.error(data.error || 'Failed to process rating.')
      }
    } catch (error) {
      console.error('An error occurred:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = newRating => {
    if (!loading) {
      handleVote(newRating)
    }
  }

  return (
    <>
      <div className={classes['difficulty-form']}>
        <div className={classes.difficulty}>
          {Array.from({ length: 5 }, (_, index) => {
            const isFilled = index < rating
            return isFilled ? (
              <RiGameFill
                key={index}
                className={`${classes.filled} ${classes.icon} ${
                  loading ? classes.disabled : ''
                }`}
                onClick={() => handleClick(index + 1)}
              />
            ) : (
              <RiGameLine
                key={index}
                className={`${classes.unfilled} ${classes.icon} ${
                  loading ? classes.disabled : ''
                }`}
                onClick={() => handleClick(index + 1)}
              />
            )
          })}
        </div>
        <div className={classes.ratings}>
          <div className={classes['ratings-info']}>
            Total ratings: <span>{currentCount}</span>
          </div>
          {average && (
            <div className={classes['ratings-info']}>
              Average rating: <span>{average}</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DifficultySlideUpForm
