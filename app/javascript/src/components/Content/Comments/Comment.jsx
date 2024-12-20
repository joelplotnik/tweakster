import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { RiDeleteBin7Line, RiMoreFill, RiSkullLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'

import LikeButton from '../../UI/Buttons/LikeButton'
import AuthModal from '../../UI/Modals/AuthModal'
import ConfirmationModal from '../../UI/Modals/ConfirmationModal'
import ReportModal from '../../UI/Modals/ReportModal'
import classes from './Comment.module.css'

const Comment = ({
  comment,
  reply,
  onReplyClick,
  onDeleteClick,
  isLoggedIn,
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const moreButtonRef = useRef(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const handleOnReplyClick = () => {
    onReplyClick(comment)
  }

  const toggleDropdown = () => {
    setShowDropdown(prevState => !prevState)
  }

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal)
  }

  const handleConfirmationModalToggle = () => {
    setShowDropdown(false)
    setShowConfirmationModal(!showConfirmationModal)
  }

  const handleReportModalToggle = () => {
    setShowDropdown(false)
    setShowReportModal(!showReportModal)
  }

  const handleReportClick = () => {
    setShowDropdown(false)
    if (!isLoggedIn) {
      setShowAuthModal(true)
    } else {
      setShowReportModal(true)
    }
  }

  const handleDeleteClick = () => {
    onDeleteClick(comment.id)
  }

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !moreButtonRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <>
      <div className={reply ? classes.reply : classes.comment}>
        <div className={classes.container}>
          <div className={classes['avatar-container']}>
            <img
              src={comment.user.avatar_url}
              alt={comment.user.username}
              className={classes.avatar}
            />
          </div>
          <div className={classes['text-container']}>
            <div className={classes['user-info']}>
              <Link
                to={`/profile/${comment.user.id}`}
                className={classes.username}
              >
                {comment.user.username}
              </Link>
              <span className={classes['created-at']}>
                {moment(comment.created_at).fromNow()}
              </span>
            </div>
            <p className={classes.message}>{comment.message}</p>
            <div className={classes['action-buttons']}>
              <button
                onClick={handleOnReplyClick}
                className={classes['reply-button']}
              >
                Reply
              </button>
              <button
                onClick={toggleDropdown}
                className={classes['more-button']}
                ref={moreButtonRef} // Add ref to the button
              >
                <RiMoreFill />
              </button>
              {showDropdown && (
                <div className={classes.dropdown} ref={dropdownRef}>
                  {' '}
                  {/* Add ref to dropdown */}
                  <button
                    className={classes['dropdown-item']}
                    onClick={() => handleConfirmationModalToggle()}
                  >
                    <RiDeleteBin7Line /> Delete
                  </button>
                  <button
                    className={classes['dropdown-item']}
                    onClick={handleReportClick}
                  >
                    <RiSkullLine /> Report
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={classes['like-container']}>
            <LikeButton likesCount={comment.likes_count} />
          </div>
        </div>
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
      {showConfirmationModal && (
        <ConfirmationModal
          onConfirm={handleDeleteClick}
          onClick={handleConfirmationModalToggle}
        />
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
