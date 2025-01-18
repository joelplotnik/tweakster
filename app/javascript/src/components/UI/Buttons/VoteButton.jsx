import React, { useState } from 'react'
import {
  RiThumbDownFill,
  RiThumbDownLine,
  RiThumbUpFill,
  RiThumbUpLine,
} from 'react-icons/ri'
import { useSelector } from 'react-redux'

import { API_URL } from '../../../constants/constants'
import { formatNumber } from '../../../util/format'
import AuthModal from '../Modals/AuthModal'
import classes from './VoteButton.module.css'

const VoteButton = ({
  userVote,
  upvotes,
  downvotes,
  basePath,
  challengeId,
}) => {
  const token = useSelector(state => state.token.token)
  const [currentVote, setCurrentVote] = useState(userVote)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [votes, setVotes] = useState({ upvotes, downvotes })

  const handleAuthModalToggle = () => {
    setShowAuthModal(prev => !prev)
  }

  const handleVote = async voteType => {
    if (!token) {
      setShowAuthModal(true)
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/${basePath}/challenges/${challengeId}/votes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vote: { vote_type: voteType, challenge_id: challengeId },
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        if (data.message === 'Vote removed') {
          // Vote was removed
          setCurrentVote(null)
          setVotes(prevVotes => ({
            upvotes: prevVotes.upvotes - (currentVote === 1 ? 1 : 0),
            downvotes: prevVotes.downvotes - (currentVote === -1 ? 1 : 0),
          }))
        } else if (data.vote) {
          // Vote was created or updated
          setCurrentVote(data.vote.vote_type)
          setVotes(prevVotes => {
            const newVotes = { ...prevVotes }
            if (data.vote.vote_type === 1) {
              // If the user is upvoting
              newVotes.upvotes += currentVote !== 1 ? 1 : 0
              newVotes.downvotes -= currentVote === -1 ? 1 : 0
            } else if (data.vote.vote_type === -1) {
              // If the user is downvoting
              newVotes.downvotes += currentVote !== -1 ? 1 : 0
              newVotes.upvotes -= currentVote === 1 ? 1 : 0
            }
            return newVotes
          })
        }
      } else {
        console.error('Vote error:', data.errors)
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
    }
  }

  return (
    <>
      <div className={classes['vote-section']}>
        <button
          className={classes['vote-button']}
          onClick={() => handleVote(1)}
        >
          {currentVote === 1 ? (
            <RiThumbUpFill className={classes['upvote-filled']} />
          ) : (
            <RiThumbUpLine className={classes['upvote']} />
          )}
        </button>
        <span className={classes['vote-count']}>
          {formatNumber(votes.upvotes - votes.downvotes)}
        </span>
        <button
          className={classes['vote-button']}
          onClick={() => handleVote(-1)}
        >
          {currentVote === -1 ? (
            <RiThumbDownFill className={classes['downvote-filled']} />
          ) : (
            <RiThumbDownLine className={classes['downvote']} />
          )}
        </button>
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
    </>
  )
}

export default VoteButton
