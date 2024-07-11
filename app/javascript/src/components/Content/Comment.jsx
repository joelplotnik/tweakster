import { Link, useRouteLoaderData } from 'react-router-dom'
import React, { useEffect, useRef, useState } from 'react'
import {
  RiDeleteBin7Line,
  RiEditBoxLine,
  RiFlagLine,
  RiMoreFill,
  RiReplyLine,
} from 'react-icons/ri'

import AuthModal from '../UI/Modals/AuthModal'
import CommentForm from './Forms/CommentForm'
import CommentVote from '../UI/CommentVote'
import ConfirmationModal from '../UI/Modals/ConfirmationModal'
import ReportModal from '../UI/Modals/ReportModal'
import classes from './Comment.module.css'
import { getUserData } from '../../util/auth'
import moment from 'moment'

const Comment = ({
  comment,
  piece,
  childComments,
  onReply,
  onEdit,
  onDelete,
  activeComment,
  setActiveComment,
  newCommentRef,
}) => {
  const token = useRouteLoaderData('root')
  const commentUserId = comment.user_id
  const { userId: userIdStr, userRole } = getUserData() || {}
  const userId = parseInt(userIdStr)
  const currentUser = commentUserId === userId
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const dropdownRef = useRef(null)

  const handleReplyClick = () => {
    if (!token) {
      setShowAuthModal(true)
    } else {
      setIsReplyFormOpen(!isReplyFormOpen)
      setIsEditFormOpen(false)
    }
  }

  const handleEditClick = () => {
    setActiveComment(null)
    setIsEditFormOpen(!isEditFormOpen)
    setIsReplyFormOpen(false)
  }

  const handleDeleteClick = () => {
    onDelete(comment.id)
  }

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal)
  }

  const handleReportModalToggle = () => {
    setShowReportModal(!showReportModal)
  }

  const handleDropdownClick = (event) => {
    if (!token) {
      setShowAuthModal(true)
      return
    }

    event.stopPropagation()
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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveComment(null)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [setActiveComment])

  const handleConfirmationModalToggle = () => {
    setShowConfirmationModal(!showConfirmationModal)
  }

  return (
    <>
      <div className={classes.comment}>
        <div className={classes['comment-info']}>
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
            likes={comment.likes}
            dislikes={comment.dislikes}
            channelId={piece.channel_id}
            pieceId={comment.piece_id}
            commentId={comment.id}
            userVotes={comment.votes}
          />
          <span
            className={`${classes['reply-button']}`}
            onClick={() => handleReplyClick(comment.id)}
          >
            <RiReplyLine className={classes['reply-icon']} />
            <span className={classes['reply-text']}>Reply</span>
          </span>
          <div className={classes['dropdown-container']} ref={dropdownRef}>
            <RiMoreFill
              className={classes['more-icon']}
              onClick={handleDropdownClick}
            />
            {activeComment === comment.id && (
              <div className={classes['dropdown-menu']}>
                {token &&
                (currentUser ||
                  userRole === 'admin' ||
                  userId === piece.user_id) ? (
                  <>
                    <button onClick={() => handleEditClick(comment.id)}>
                      <RiEditBoxLine />
                      Edit
                    </button>
                    <button onClick={() => handleConfirmationModalToggle()}>
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
        {isReplyFormOpen && (
          <CommentForm
            parentId={comment.parent_comment_id || comment.id}
            onCancel={() => setIsReplyFormOpen(false)}
            onSubmit={onReply}
            showCancel={true}
          />
        )}
        {isEditFormOpen && (
          <CommentForm
            comment={comment}
            parentId={comment.parent_comment_id}
            onCancel={() => setIsEditFormOpen(false)}
            onSubmit={onEdit}
            showCancel={true}
          />
        )}
        {childComments && childComments.length > 0 && (
          <div className={classes['comment-nested']}>
            {childComments.map((childComment) => (
              <div
                key={childComment.comment.id}
                id={
                  childComment.comment.id === newCommentRef.current
                    ? newCommentRef.current
                    : undefined
                }
              >
                <Comment
                  key={childComment.comment.id}
                  comment={childComment.comment}
                  piece={piece}
                  childComments={childComment.child_comments}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  activeComment={activeComment}
                  setActiveComment={setActiveComment}
                />
              </div>
            ))}
          </div>
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
