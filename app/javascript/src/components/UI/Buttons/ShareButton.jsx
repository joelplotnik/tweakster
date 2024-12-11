import { RiShareFill } from 'react-icons/ri'

import classes from './ShareButton.module.css'

const ShareButton = () => {
  const handleClick = () => {
    // Placeholder for share action (future implementation)
    console.log('Share button clicked')
  }

  return (
    <div className={classes['share-button']} onClick={handleClick}>
      <RiShareFill className={classes['icon']} />
      <span className={classes['text']}>Share</span>
    </div>
  )
}

export default ShareButton
