import React, { useState } from 'react'
import {
  RiThumbDownFill,
  RiThumbDownLine,
  RiThumbUpFill,
  RiThumbUpLine,
} from 'react-icons/ri'
import { piecesActions, selectPieceById } from '../../store/pieces'
import { selectTweakById, tweakActions } from '../../store/tweak'
import { useDispatch, useSelector } from 'react-redux'

import { API_URL } from '../../constants/constants'
import { AuthModal } from './Modals/AuthModal'
import classes from './PieceVote.module.css'
import { pieceActions } from '../../store/piece'
import { toast } from 'react-toastify'
import { useRouteLoaderData } from 'react-router-dom'

const PieceVote = ({ channelId, pieceId, tweakId, arrangement }) => {
  const token = useRouteLoaderData('root')
  const userId = useSelector((state) => state.user.user?.id)
  const dispatch = useDispatch()
  let selectedPiece, inPiecesSlice
  const piece = useSelector((state) => {
    if (pieceId) {
      selectedPiece = selectPieceById(state, pieceId)
    } else {
      selectedPiece = selectPieceById(state, tweakId)
    }

    inPiecesSlice = !!selectedPiece

    const pieceToReturn =
      selectedPiece ||
      (pieceId ? state.piece.piece : selectTweakById(state, tweakId))

    return pieceToReturn
  })
  const likes = piece.likes || 0
  const dislikes = piece.dislikes || 0
  const userVote = piece.votes.find((vote) => vote.user_id === userId)
  const score = likes - dislikes
  const [showModal, setShowModal] = useState(false)

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
          votable_id: pieceId ? pieceId : tweakId,
          votable_type: 'Piece',
        },
      }

      const response = await fetch(
        `${API_URL}/channels/${channelId}/pieces/${
          pieceId ? pieceId : tweakId
        }/votes`,
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
        await response.json()

        if (pieceId) {
          inPiecesSlice
            ? dispatch(
                piecesActions.updateVote({ id: pieceId, userId, voteType })
              )
            : dispatch(
                pieceActions.updateVote({ id: pieceId, userId, voteType })
              )
        } else {
          inPiecesSlice
            ? dispatch(
                piecesActions.updateVote({ id: tweakId, userId, voteType })
              )
            : dispatch(
                pieceActions.updateVote({ id: tweakId, userId, voteType })
              )
          dispatch(tweakActions.updateVote({ id: tweakId, userId, voteType }))
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
      <div
        className={`${
          arrangement === 'header'
            ? classes['vote-section-header']
            : arrangement === 'row'
            ? classes['vote-section-row']
            : classes['vote-section']
        }`}
      >
        <button className={classes['vote-button']} onClick={handleUpvote}>
          {userVote?.vote_type === 1 ? (
            <RiThumbUpFill className={classes['thumb-up-icon-filled']} />
          ) : (
            <RiThumbUpLine className={classes['thumb-up-icon']} />
          )}
        </button>
        <span className={classes['vote-count']}>{score}</span>
        <button className={classes['vote-button']} onClick={handleDownvote}>
          {userVote?.vote_type === -1 ? (
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

export default PieceVote
