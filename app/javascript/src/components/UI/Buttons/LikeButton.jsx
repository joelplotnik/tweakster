import { useState } from 'react'
import { RiHeart3Fill, RiHeart3Line } from 'react-icons/ri'

import { formatNumber } from '../../../util/format'
import classes from './LikeButton.module.css'

const LikeButton = ({ likesCount }) => {
  const [isSelected, setIsSelected] = useState(false)

  const toggleSelected = () => {
    setIsSelected(prev => !prev)
  }

  return (
    <div className={classes['like-button']} onClick={toggleSelected}>
      {isSelected ? (
        <RiHeart3Fill className={classes['icon-selected']} />
      ) : (
        <RiHeart3Line className={classes['icon-unselected']} />
      )}
      <div
        className={`${classes['like-count']} ${
          isSelected ? classes['selected'] : classes['unselected']
        }`}
      >
        {formatNumber(likesCount)}
      </div>
    </div>
  )
}

export default LikeButton
