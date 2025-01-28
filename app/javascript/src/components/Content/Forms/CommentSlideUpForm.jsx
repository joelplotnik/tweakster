import Comments from '../Comments/Comments'
import classes from './CommentSlideUpForm.module.css'

const CommentSlideUpForm = ({
  basePath,
  challengeId,
  attemptId,
  commentsCount,
  setCommentsCount,
}) => {
  return (
    <div className={classes['comments-container']}>
      <Comments
        basePath={basePath}
        challengeId={challengeId}
        attemptId={attemptId}
        isSlideUpPresent={true}
        commentsCount={commentsCount}
        setCommentsCount={setCommentsCount}
      />
    </div>
  )
}

export default CommentSlideUpForm
