import 'react-loading-skeleton/dist/skeleton.css'

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

import classes from './ListItemSkeleton.module.css'

const ListItemSkeleton = () => {
  return (
    <SkeletonTheme
      baseColor="var(--primary-background-color)"
      highlightColor="var(--secondary-background-color)"
    >
      <div className={classes['skeleton-container']}>
        {[...Array(2)].map((_, index) => (
          <div key={index} className={classes['list-item-container']}>
            <div className={classes.title}>
              <Skeleton height={30} />
            </div>
            <div className={classes.body}>
              <Skeleton height={180} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  )
}

export default ListItemSkeleton
