import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import classes from './ProfileSkeleton.module.css';

const ProfileSkeleton = () => {
  return (
    <SkeletonTheme color="#cccccc" highlightColor="#f5f5f5">
      <div className={classes['skeleton-container']}>
        <div className={classes.card}>
          <div className={classes['top-row']}>
            <div className={classes.avatar}>
              <Skeleton circle={true} height={100} width={100} />
            </div>
          </div>
          <div className={classes.title}>
            <Skeleton height={35} />
          </div>
          <div className={classes.body}>
            <Skeleton height={225} count={1} />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default ProfileSkeleton;
