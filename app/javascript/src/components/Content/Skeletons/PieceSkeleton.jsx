import 'react-loading-skeleton/dist/skeleton.css'

import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

import classes from './PieceSkeleton.module.css'

const PieceSkeleton = () => {
  return (
    <SkeletonTheme color="#cccccc" highlightColor="#f5f5f5">
      <div className={classes['skeleton-container']}>
        {[...Array(2)].map((_, index) => (
          <div key={index} className={classes['post-container']}>
            <div className={classes['top-row']}>
              <div className={classes.avatar}>
                <Skeleton circle={true} height={40} width={40} />
              </div>
              <div className={classes.title}>
                <Skeleton width={200} height={25} />
              </div>
            </div>
            <div className={classes.body}>
              <Skeleton height={225} width={588} count={1} />
            </div>
            <div className={classes['bottom-row']}>
              <div className={classes.actions}>
                <Skeleton width={588} height={30} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  )
}

export default PieceSkeleton
