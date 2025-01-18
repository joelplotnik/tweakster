import { useState } from 'react'
import { RiAwardFill, RiAwardLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'

import { API_URL } from '../../../constants/constants'
import AuthModal from '../Modals/AuthModal'
import classes from './ApprovalButton.module.css'

const ApprovalButton = ({
  userApproval,
  approvalsCount,
  basePath,
  challengeId,
  attemptId,
}) => {
  const token = useSelector(state => state.token.token)
  const [isSelected, setIsSelected] = useState(userApproval)
  const [currentCount, setCurrentCount] = useState(Number(approvalsCount))
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleAuthModalToggle = () => {
    setShowAuthModal(prev => !prev)
  }

  const toggleSelected = async () => {
    try {
      const url = `${API_URL}/${basePath}/challenges/${challengeId}/attempts/${attemptId}/approvals`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          approval: { attempt_id: attemptId },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle approval')
      }

      const data = await response.json()

      if (data.message === 'Approval added') {
        setIsSelected(true)
        setCurrentCount(prev => Number(prev) + 1)
      } else if (data.message === 'Approval removed') {
        setIsSelected(false)
        setCurrentCount(prev => Number(prev) - 1)
      }
    } catch (error) {
      console.error('Error toggling approval:', error)
    }
  }

  return (
    <>
      <div className={classes['approval-button']} onClick={toggleSelected}>
        {isSelected ? (
          <RiAwardFill className={classes['icon-selected']} />
        ) : (
          <RiAwardLine className={classes['icon-unselected']} />
        )}
        <div
          className={`${classes['approval-count']} ${
            isSelected ? classes['selected'] : classes['unselected']
          }`}
        >
          {currentCount}
        </div>
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
    </>
  )
}

export default ApprovalButton
