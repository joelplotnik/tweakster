import { useEffect, useState } from 'react'
import { RiArrowUpLine } from 'react-icons/ri'

import classes from './CommentForm.module.css'

const CommentForm = ({ onSubmit, replyingTo, onTextChange }) => {
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    if (replyingTo) {
      const usernamePrefix = `@${replyingTo.user.username} `
      if (!commentText.startsWith(usernamePrefix)) {
        setCommentText(usernamePrefix)
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
    if (commentText.trim()) {
      onSubmit(commentText)
      setCommentText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={classes['comment-form']}>
      <input
        type="text"
        placeholder="Add a comment..."
        value={commentText}
        onChange={handleChange}
        className={classes['comment-input']}
      />
      <button type="submit" className={classes['submit-button']}>
        <RiArrowUpLine className={classes['submit-icon']} />
      </button>
    </form>
  )
}

export default CommentForm
