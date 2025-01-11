import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useRouteLoaderData } from 'react-router-dom'
import { toast } from 'react-toastify'

import { API_URL } from '../../../constants/constants'
import { userPageActions } from '../../../store/userPage'
import classes from './FollowButton.module.css'

const FollowButton = ({ userFollowing, userId, followerCount }) => {
  const token = useRouteLoaderData('root')
  const dispatch = useDispatch()
  const [isHovered, setIsHovered] = useState(false)

  const handleFollow = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to follow')
      }

      dispatch(userPageActions.updateFollowerCount(followerCount + 1))
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error following')
    }
  }

  const handleUnfollow = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/unfollow`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to unfollow')
      }

      dispatch(userPageActions.updateFollowerCount(followerCount - 1))
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error unfollowing')
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
        onClick={userFollowing ? handleUnfollow : handleFollow}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {buttonContent}
      </button>
    </>
  )
}

export default FollowButton
