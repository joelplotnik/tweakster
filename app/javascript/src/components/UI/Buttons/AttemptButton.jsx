import { useState } from 'react'
import { RiDeleteBin5Line, RiGamepadFill } from 'react-icons/ri'
import { useSelector } from 'react-redux'

import { API_URL } from '../../../constants/constants'
import AuthModal from '../Modals/AuthModal'
import ConfirmationModal from '../Modals/ConfirmationModal'
import classes from './AttemptButton.module.css'

const AttemptButton = ({
  userAttempted,
  userAttemptId,
  basePath,
  challengeId,
}) => {
  const token = useSelector(state => state.token.token)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
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

  const handleDropClick = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmDrop = () => {
    setShowConfirmModal(false)
    handleAttemptClick()
  }

  const handleCancelDrop = () => {
    setShowConfirmModal(false)
  }

  return (
    <>
      <button
        className={
          attemptId ? classes['try-again-button'] : classes['attempt-button']
        }
        onClick={attemptId ? handleDropClick : handleAttemptClick}
      >
        {attemptId ? 'Try Again' : 'Attempt'}
      </button>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
      {showConfirmModal && (
        <ConfirmationModal
          header="Are you sure?"
          message="Dropping this challenge will permanently delete your attempt. This action cannot be undone."
          button="Drop it"
          onClick={handleCancelDrop}
          onConfirm={handleConfirmDrop}
        />
      )}
    </>
  )
}

export default AttemptButton
