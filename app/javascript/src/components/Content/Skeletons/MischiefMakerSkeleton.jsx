import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import classes from './MischiefMakerSkeleton.module.css';

const MischiefMakerSkeleton = () => {
  return (
    <>
      <h4>Mischief Makers</h4>
      <SkeletonTheme color="#cccccc" highlightColor="#f5f5f5">
        <div className={classes['skeleton-container']}>
          {[...Array(4)].map((_, index) => (
            <div key={index} className={classes.square}>
              <Skeleton width={210} height={173} />
            </div>
          ))}
        </div>
      </SkeletonTheme>
    </>
  );
};

export default MischiefMakerSkeleton;
