import moment from 'moment'
import { Link } from 'react-router-dom'

import LikeButton from '../../UI/Buttons/LikeButton'
import classes from './Comment.module.css'

const Comment = ({ user, created_at, message, likesCount, reply }) => (
  <div className={reply ? classes.reply : classes.comment}>
    <div className={classes.container}>
      <div className={classes['avatar-container']}>
        <img
          src={user.avatar_url}
          alt={user.username}
          className={classes.avatar}
        />
      </div>
      <div className={classes['text-container']}>
        <div className={classes['user-info']}>
          <Link to={`/profile/${user.id}`} className={classes.username}>
            {user.username}
          </Link>
          <span className={classes['created-at']}>
            {moment(created_at).fromNow()}
          </span>
        </div>
        <p className={classes.message}>{message}</p>
      </div>
      <div className={classes['like-container']}>
        <LikeButton likesCount={likesCount} />
      </div>
    </div>
  </div>
)

export default Comment
