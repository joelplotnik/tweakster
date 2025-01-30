import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { API_URL } from '../../../constants/constants'
// import { userPageActions } from '../../../store/userPage'
import AuthModal from '../Modals/AuthModal'
import classes from './FollowButton.module.css'

const FollowButton = ({ userFollowing, userId, followersCount }) => {
  const token = useSelector(state => state.token.token)
  // const dispatch = useDispatch()
  const [isHovered, setIsHovered] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleAuthModalToggle = () => {
    setShowAuthModal(prev => !prev)
  }

  const handleFollowAction = async action => {
    if (!token) {
      setShowAuthModal(true)
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/users/${userId}/${
          action === 'follow' ? 'follow' : 'unfollow'
        }`,
        {
          method: action === 'follow' ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to ${action}`)
      }

      const updatedCount =
        action === 'follow' ? followersCount + 1 : followersCount - 1

      // dispatch(
      //   userPageActions.updateFollowState({
      //     isFollowing: action === 'follow',
      //     followerCount: updatedCount,
      //   })
      // )
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error(`Error ${action === 'follow' ? 'following' : 'unfollowing'}`)
    }
  }

  const buttonContent = userFollowing
    ? isHovered
      ? 'Unfollow'
      : 'Following'
    : 'Follow'

  return (
    <>
      <button
        className={classes['follow-button']}
        onClick={() =>
          handleFollowAction(userFollowing ? 'unfollow' : 'follow')
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {buttonContent}
      </button>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
    </>
  )
}

export default FollowButton
