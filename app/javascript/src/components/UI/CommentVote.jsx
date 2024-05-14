import React, { useEffect, useRef, useState } from 'react'
import {
  RiThumbDownFill,
  RiThumbDownLine,
  RiThumbUpFill,
  RiThumbUpLine,
} from 'react-icons/ri'

import { API_URL } from '../../constants/constants'
import { AuthModal } from './Modals/AuthModal'
import classes from './CommentVote.module.css'
import { toast } from 'react-toastify'
import { useRouteLoaderData } from 'react-router-dom'
import { useSelector } from 'react-redux'

const CommentVote = ({
  likes,
  dislikes,
  channelId,
  pieceId,
  commentId,
  userVotes,
}) => {
  const token = useRouteLoaderData('root')
  const userId = useSelector((state) => state.user.user?.id)
  const [score, setScore] = useState(likes - dislikes)
  const [voteType, setVoteType] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const prevVoteTypeRef = useRef(0)

  useEffect(() => {
    prevVoteTypeRef.current = voteType
  }, [voteType])

  useEffect(() => {
    const userVote = userVotes.find((vote) => vote.user_id === userId)

    if (userVote) {
      setVoteType(userVote.vote_type)
    }
  }, [userVotes, userId])

  const handleModalToggle = () => {
    setShowModal(!showModal)
  }

  const handleVote = async (voteType) => {
    try {
      if (!token) {
        setShowModal(true)
        return
      }

      const voteData = {
        vote: {
          vote_type: voteType,
          votable_id: commentId,
          votable_type: 'Comment',
        },
      }

      const response = await fetch(
        `${API_URL}/channels/${channelId}/pieces/${pieceId}/votes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(voteData),
        }
      )

      if (response.status === 401) {
        toast.error('You are not authorized to perform this action')
        return response
      }

      if (!response.ok) {
        throw new Error('Could not perform this action')
      }

      if (response.ok) {
        const responseData = await response.json()

        if (responseData.vote && responseData.vote.vote_type === voteType) {
          // If the API response matches the requested voteType, update the voteType state accordingly
          if (prevVoteTypeRef.current === 1 && voteType === -1) {
            setVoteType(voteType)
            setScore(score - 2)
          } else if (prevVoteTypeRef.current === -1 && voteType === 1) {
            setVoteType(voteType)
            setScore(score + 2)
          } else {
            setVoteType(voteType)
            setScore(score + voteType)
          }
        } else {
          // If the API response doesn't match the requested voteType (undoing the vote)
          if (voteType === 1) {
            setScore(score - 1)
          } else if (voteType === -1) {
            setScore(score + 1)
          }
          setVoteType(0)
        }
      }
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error handling vote click')
    }
  }

  const handleUpvote = (event) => {
    event.preventDefault()
    event.stopPropagation()
    handleVote(1)
  }

  const handleDownvote = (event) => {
    event.preventDefault()
    event.stopPropagation()
    handleVote(-1)
  }

  return (
    <>
      <div className={classes['vote-section']}>
        <button className={classes['vote-button']} onClick={handleUpvote}>
          {voteType === 1 ? (
            <RiThumbUpFill className={classes['thumb-up-icon-filled']} />
          ) : (
            <RiThumbUpLine className={classes['thumb-up-icon']} />
          )}
        </button>
        <span className={classes['vote-count']}>{score}</span>
        <button className={classes['vote-button']} onClick={handleDownvote}>
          {voteType === -1 ? (
            <RiThumbDownFill className={classes['thumb-down-icon-filled']} />
          ) : (
            <RiThumbDownLine className={classes['thumb-down-icon']} />
          )}
        </button>
      </div>
      {showModal && (
        <AuthModal authType={'login'} onClick={handleModalToggle} />
      )}
    </>
  )
}

export default CommentVote
