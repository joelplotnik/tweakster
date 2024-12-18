import classes from './Comments.module.css'

const Comment = ({ user, message, reply }) => (
  <div className={reply ? classes.reply : classes.comment}>
    <div className={reply ? classes.replyHeader : classes.commentHeader}>
      <img
        src={user.avatar_url}
        alt={user.username}
        className={classes.avatar}
      />
      <span>{user.username}</span>
    </div>
    <p>{message}</p>
  </div>
)

export default Comment
