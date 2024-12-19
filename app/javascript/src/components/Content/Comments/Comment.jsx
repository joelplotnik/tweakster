import moment from 'moment'
import { Link } from 'react-router-dom'

import LikeButton from '../../UI/Buttons/LikeButton'
import classes from './Comment.module.css'

const Comment = ({ comment, reply, onReplyClick }) => {
  const handleOnReplyClick = () => {
    onReplyClick(comment)
  }

  return (
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
          <button
            onClick={handleOnReplyClick}
            className={classes['reply-button']}
          >
            Reply
          </button>
        </div>
        <div className={classes['like-container']}>
          <LikeButton likesCount={comment.likes_count} />
        </div>
      </div>
    </div>
  )
}

export default Comment
