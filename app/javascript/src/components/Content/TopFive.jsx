import React from 'react';
import { RiAddLine } from 'react-icons/ri';
import classes from './TopFive.module.css';
import defaultAvatar from '../../assets/default-avatar.png';
import defaultVisual from '../../assets/default-visual.png';

const TopFive = ({ entityType, favorites }) => {
  const isChannel = entityType === 'channel';
  const placeholdersCount = 5 - favorites.length;
  const placeholders = Array.from({ length: placeholdersCount }).fill(null);

  return (
    <div className={classes['top-five-container']}>
      {favorites.map((item, index) => (
        <div key={index} className={classes['circle-image']}>
          <img
            src={
              isChannel
                ? item.visual_url
                  ? item.visual_url
                  : defaultVisual
                : item.avatar_url
                ? item.avatar_url
                : defaultAvatar
            }
            alt={`${index + 1}`}
          />
        </div>
      ))}
      {placeholders.map((_, index) => (
        <div key={index} className={classes['placeholder-circle']}>
          <RiAddLine className={classes['add-icon']} />
        </div>
      ))}
    </div>
  );
};

export default TopFive;
