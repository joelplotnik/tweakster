import { RiChat3Line } from 'react-icons/ri'

import classes from './CommentButton.module.css'

const CommentButton = ({ commentsCount }) => {
  const handleClick = () => {
    console.log('Comment button clicked')
  }

  return (
    <div className={classes['comment-button']} onClick={handleClick}>
      <RiChat3Line className={classes['icon']} />
      <div className={classes['comment-count']}>{commentsCount}</div>
    </div>
  )
}

export default CommentButton
