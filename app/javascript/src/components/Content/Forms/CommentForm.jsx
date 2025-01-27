import { useEffect, useRef, useState } from 'react'
import { RiArrowUpLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'

import AuthModal from '../../UI/Modals/AuthModal'
import classes from './CommentForm.module.css'

const CommentForm = ({
  onSubmit,
  replyingTo,
  onTextChange,
  isSlideUpPresent,
}) => {
  const token = useSelector(state => state.token.token)
  const [commentText, setCommentText] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (replyingTo) {
      const usernamePrefix = `@${replyingTo.user.username} `
      if (!commentText.startsWith(usernamePrefix)) {
        setCommentText(usernamePrefix)

        // Set focus at the end of the pre-filled text
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus()
            inputRef.current.setSelectionRange(
              usernamePrefix.length,
              usernamePrefix.length
            )
          }
        }, 0)
      }
    }
  }, [replyingTo])

  const handleChange = event => {
    const value = event.target.value
    setCommentText(value)
    if (onTextChange) {
      onTextChange(value)
    }
  }

  const handleSubmit = event => {
    event.preventDefault()
    if (!token) {
      setShowAuthModal(true)
      return
    }
    if (commentText.trim()) {
      onSubmit(commentText)
      setCommentText('')
    }
  }

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={classes['comment-form']}>
        <input
          type="text"
          ref={inputRef}
          placeholder={
            token ? 'Add a comment...' : 'Log in to leave a comment...'
          }
          value={commentText}
          onChange={handleChange}
          className={classes['comment-input']}
        />
        <button type="submit" className={classes['submit-button']}>
          <RiArrowUpLine className={classes['submit-icon']} />
        </button>
      </form>
      {showAuthModal && (
        <AuthModal
          authType={'login'}
          onClick={handleAuthModalToggle}
          isSlideUpPresent={isSlideUpPresent}
        />
      )}
    </>
  )
}

export default CommentForm
