import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import {
  RiDeleteBin7Line,
  RiEditBoxLine,
  RiFlagLine,
  RiMoreFill,
} from 'react-icons/ri'
import { Link, useRouteLoaderData } from 'react-router-dom'

import { getUserData } from '../../../util/auth'
import AuthModal from '../../UI/Modals/AuthModal'
import ConfirmationModal from '../../UI/Modals/ConfirmationModal'
import ReportModal from '../../UI/Modals/ReportModal'
import CommentForm from '../Forms/CommentForm'
import CommentVote from '../UI/CommentVote'
import classes from './Comment.module.css'

const Comment = ({
  comment,
  commentable,
  commentableType,
  onEdit,
  onDelete,
  activeComment,
  setActiveComment,
}) => {
  const token = useRouteLoaderData('root')
  const commentUserId = comment.user_id
  const { userId: userIdStr, userRole } = getUserData() || {}
  const userId = parseInt(userIdStr)
  const currentUser = commentUserId === userId
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const dropdownRef = useRef(null)
  const [dropdownActive, setDropdownActive] = useState(false)

  const handleEditClick = () => {
    setActiveComment(null)
    setDropdownActive(false)
    setIsEditFormOpen(!isEditFormOpen)
  }

  const handleDeleteClick = () => {
    setActiveComment(null)
    onDelete(comment.id)
  }

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal)
  }

  const handleReportModalToggle = () => {
    setShowReportModal(!showReportModal)
  }

  const handleDropdownClick = event => {
    if (!token) {
      setShowAuthModal(true)
      return
    }

    event.stopPropagation()
    setDropdownActive(!dropdownActive)
    setActiveComment(activeComment === comment.id ? null : comment.id)
  }

  const handleReportClick = () => {
    if (!token) {
      setShowAuthModal(true)
    } else {
      setShowReportModal(true)
    }
  }

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownActive(false)
        setActiveComment(null)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [setActiveComment])

  const handleConfirmationModalToggle = () => {
    setDropdownActive(false)
    setShowConfirmationModal(!showConfirmationModal)
  }

  return (
    <>
      <div
        className={
          commentableType === 'Piece'
            ? classes['piece-comment']
            : classes['tweak-comment']
        }
      >
        <div className={classes['comment-info']}>
          <Link
            to={`/users/${comment.user_id}`}
            className={classes['user-link']}
            onClick={e => e.stopPropagation()}
          >
            <div className={classes['photo-container']}>
              <img
                className={classes.photo}
                src={comment.user.avatar_url || '/default-avatar.png'}
                alt={`${comment.user.username}'s avatar`}
              />
            </div>
          </Link>
          <div>
            <Link
              to={`/users/${comment.user_id}`}
              className={classes['comment-user-link']}
            >
              {comment.user.username}
            </Link>
          </div>
          <div>
            <p className={classes['comment-timestamp']}>
              - {moment(comment.created_at).fromNow()}
            </p>
          </div>
        </div>
        <p className={classes['comment-message']}>{comment.message}</p>
        <div className={classes['comment-icons']}>
          <CommentVote
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            channelId={commentable.channel_id}
            pieceId={comment.commentable_id}
            commentId={comment.id}
            userVotes={comment.votes}
          />
          <div
            className={`${classes['dropdown-container']} ${
              dropdownActive ? classes.active : ''
            }`}
            ref={dropdownRef}
          >
            <RiMoreFill
              className={classes['more-icon']}
              onClick={handleDropdownClick}
            />
            {dropdownActive && (
              <div className={classes['dropdown-menu']}>
                {token &&
                (currentUser ||
                  userRole === 'admin' ||
                  userId === commentable.user_id) ? (
                  <>
                    <button onClick={handleEditClick}>
                      <RiEditBoxLine />
                      Edit
                    </button>
                    <button onClick={handleConfirmationModalToggle}>
                      <RiDeleteBin7Line className={classes.delete} />
                      <span className={classes.delete}> Delete</span>
                    </button>
                  </>
                ) : (
                  <button onClick={handleReportClick}>
                    <RiFlagLine className={classes.report} />
                    <span className={classes.report}>Report</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {isEditFormOpen && (
          <CommentForm
            comment={comment}
            onCancel={() => setIsEditFormOpen(false)}
            onSubmit={onEdit}
            showCancel={true}
          />
        )}
      </div>
      {showConfirmationModal && (
        <ConfirmationModal
          onConfirm={handleDeleteClick}
          onClick={handleConfirmationModalToggle}
        />
      )}
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
      {showReportModal && (
        <ReportModal
          onClick={handleReportModalToggle}
          content={{ type: 'comment', id: comment.id }}
        />
      )}
    </>
  )
}

export default Comment
