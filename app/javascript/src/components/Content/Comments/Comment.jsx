import { Link } from 'react-router-dom'

import LikeButton from '../../UI/Buttons/LikeButton'
import classes from './Comment.module.css'

const Comment = ({ user, message, likesCount, reply }) => (
  <div className={reply ? classes.reply : classes.comment}>
    <div className={classes.container}>
      {/* Avatar */}
      <div className={classes['avatar-container']}>
        <img
          src={user.avatar_url}
          alt={user.username}
          className={classes.avatar}
        />
      </div>

      {/* Username and Message */}
      <div className={classes['text-container']}>
        <Link to={`/profile/${user.id}`} className={classes.username}>
          {user.username}
        </Link>
        <p className={classes.message}>{message}</p>
      </div>

      {/* Like Button */}
      <div className={classes['like-container']}>
        <LikeButton likesCount={likesCount} />
      </div>
    </div>
  </div>
)

export default Comment
