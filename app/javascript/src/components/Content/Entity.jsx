import React from 'react';
import { Link } from 'react-router-dom';
import { RiVipCrownLine } from 'react-icons/ri';
import defaultVisual from '../../assets/default-visual.png';

import classes from './Entity.module.css';
import TopFiveButton from '../UI/Buttons/TopFiveButton';

const Entity = ({
  entityType,
  item,
  isFavorite,
  favoriteCount,
  onTopFiveClick,
}) => {
  const isChannel = entityType === 'channel';

  return (
    <Link
      to={`/${isChannel ? 'channels' : 'users'}/${item.id}`}
      className={classes.link}
    >
      <div
        className={
          isFavorite
            ? `${classes['item-container-fave']}`
            : `${classes['item-container']}`
        }
      >
        <div className={classes['item-info']}>
          <div className={classes['item-visual-container']}>
            <img
              src={
                isChannel
                  ? item?.visual_url || defaultVisual
                  : item?.avatar_url || defaultVisual
              }
              alt={isChannel ? 'Channel Visual' : 'User Avatar'}
              className={classes['item-image']}
            />
            <div className={classes['item-name-link']}>
              {isChannel ? item.name : item.username}
            </div>
          </div>
          <div className={classes['container-right']}>
            {isChannel && item.owned_channel && (
              <div className={classes['owned-channel-icon']}>
                <RiVipCrownLine />
              </div>
            )}
            <TopFiveButton
              item={item}
              isFavorite={isFavorite}
              favoriteCount={favoriteCount}
              onTopFiveClick={onTopFiveClick}
              entityType={entityType}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Entity;
