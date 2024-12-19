import { useEffect, useState } from 'react'
import { RiArrowUpLine } from 'react-icons/ri'

import classes from './CommentForm.module.css'

const CommentForm = ({ onSubmit, replyingTo }) => {
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    if (replyingTo) {
      setCommentText(`@${replyingTo.user.username} `)
    } else {
      setCommentText('')
    }
  }, [replyingTo])

  const handleChange = event => {
    setCommentText(event.target.value)
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
