import React from 'react';
import classes from './TopFiveButton.module.css';

const TopFiveButton = ({ item, isFavorite, favoriteCount, onTopFiveClick }) => {
  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onTopFiveClick(item);
  };

  return (
    <button
      onClick={handleClick}
      className={`${classes['top-five-button']} ${
        isFavorite
          ? ''
          : favoriteCount === 5
          ? `${classes['top-five-button-grey']} ${classes['disabled']}`
          : classes['top-five-button-green']
      }`}
    >
      {isFavorite ? 'Remove' : 'Add'}
    </button>
  );
};
export default TopFiveButton;
