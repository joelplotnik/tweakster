import 'react-loading-skeleton/dist/skeleton.css'

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

import classes from './CommentSkeleton.module.css'

const CommentSkeleton = () => {
  return (
    <SkeletonTheme
      baseColor="var(--primary-background-color)"
      highlightColor="var(--secondary-background-color)"
    >
      <div className={classes['comment-container']}>
        <div className={classes['avatar-container']}>
          <Skeleton circle width={40} height={40} />
        </div>
        <div className={classes['text-container']}>
          <div className={classes['user-info']}>
            <Skeleton width={100} height={16} />
          </div>
          <div className={classes.message}>
            <Skeleton count={2} height={14} />
          </div>
          <div className={classes['action-buttons']}>
            <Skeleton width={100} height={16} />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  )
}

export default CommentSkeleton
