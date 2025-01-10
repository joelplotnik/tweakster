import { useState } from 'react'
import { useSelector } from 'react-redux'

import { API_URL } from '../../../constants/constants'
import AuthModal from '../Modals/AuthModal'
import classes from './AttemptButton.module.css'

const AttemptButton = ({
  userAttempted,
  userAttemptId,
  basePath,
  challengeId,
}) => {
  const token = useSelector(state => state.token.token)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [attemptId, setAttemptId] = useState(
    userAttempted ? userAttemptId : null
  )

  const handleAuthModalToggle = () => {
    setShowAuthModal(prev => !prev)
  }

  const handleAttemptClick = async () => {
    if (!token) {
      setShowAuthModal(true)
      return
    }

    try {
      const method = attemptId ? 'DELETE' : 'POST'
      const url =
        method === 'POST'
          ? `${API_URL}/${basePath}/challenges/${challengeId}/attempts`
          : `${API_URL}/${basePath}/challenges/${challengeId}/attempts/${attemptId}`

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attempt: {
            challenge_id: challengeId,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update attempt status')
      }

      const data = await response.json()

      if (method === 'POST') {
        setAttemptId(data.attempt.id)
      } else {
        setAttemptId(null)
      }
    } catch (error) {
      console.error('Error submitting attempt:', error)
    }
  }

  return (
    <>
      <button className={classes.attemptButton} onClick={handleAttemptClick}>
        {attemptId ? 'Drop' : 'Attempt'}
      </button>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
    </>
  )
}

export default AttemptButton
