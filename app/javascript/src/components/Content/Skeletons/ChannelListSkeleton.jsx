import 'react-loading-skeleton/dist/skeleton.css'

import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

import classes from './ChannelListSkeleton.module.css'

const ChannelListSkeleton = () => {
  return (
    <SkeletonTheme color="#cccccc" highlightColor="#f5f5f5">
      <div className={classes['channel-list']}>
        <h4 className={classes['sidebar-title']}>Channels</h4>
        {[...Array(11)].map((_, index) => (
          <div key={index} className={classes.channel}>
            <div className={classes.name}>
              <Skeleton width={210} height={33} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  )
}

export default ChannelListSkeleton
