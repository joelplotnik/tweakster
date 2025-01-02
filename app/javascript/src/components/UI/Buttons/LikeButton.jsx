import { useState } from 'react'
import { RiHeart3Fill, RiHeart3Line } from 'react-icons/ri'
import { useSelector } from 'react-redux'

import { API_URL } from '../../../constants/constants'
import { formatNumber } from '../../../util/format'
import AuthModal from '../Modals/AuthModal'
import classes from './LikeButton.module.css'

const LikeButton = ({ userLiked, likesCount, basePathWithId, commentId }) => {
  const token = useSelector(state => state.token.token)
  const [isSelected, setIsSelected] = useState(userLiked)
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleAuthModalToggle = () => {
    setShowAuthModal(prev => !prev)
  }

  const toggleSelected = async () => {
    if (!token) {
      setShowAuthModal(true)
      return
    }

    try {
      const path = `${basePathWithId}/comments/${commentId}/likes`

      const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ like: { comment_id: commentId } }),
      })

      if (!response.ok)
        throw new Error(
          isSelected ? 'Error removing like' : 'Error adding like'
        )

      setIsSelected(prev => !prev)
      setCurrentLikesCount(prev => (isSelected ? prev - 1 : prev + 1))
    } catch (error) {
      console.error('Error toggling like:', error.message)
    }
  }

  return (
    <>
      <div className={classes['like-button']} onClick={toggleSelected}>
        {isSelected ? (
          <RiHeart3Fill className={classes['icon-selected']} />
        ) : (
          <RiHeart3Line className={classes['icon-unselected']} />
        )}
        <div
          className={`${classes['like-count']} ${
            isSelected ? classes['selected'] : classes['unselected']
          }`}
        >
          {formatNumber(currentLikesCount)}
        </div>
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
    </>
  )
}

export default LikeButton
