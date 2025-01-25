import Comments from '../Comments/Comments'
import classes from './CommentSlideUpForm.module.css'

const CommentSlideUpForm = ({ basePath, challengeId }) => {
  return (
    <div className={classes['comments-container']}>
      <Comments
        basePath={basePath}
        challengeId={challengeId}
        isSlideUpPresent={true}
      />
    </div>
  )
}

export default CommentSlideUpForm
