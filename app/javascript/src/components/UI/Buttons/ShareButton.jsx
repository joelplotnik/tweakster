import { useEffect, useRef, useState } from 'react'
import { RiShareFill } from 'react-icons/ri'
import { toast } from 'react-toastify'

import classes from './ShareButton.module.css'

const ShareButton = ({ sharePath }) => {
  const [isPopupVisible, setPopupVisible] = useState(false)
  const buttonRef = useRef(null)
  const popupRef = useRef(null)

  const handleClickOutside = event => {
    if (
      buttonRef.current &&
      !buttonRef.current.contains(event.target) &&
      popupRef.current &&
      !popupRef.current.contains(event.target)
    ) {
      setPopupVisible(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleClick = () => {
    setPopupVisible(prev => !prev)
  }

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(sharePath)
      .then(() => {
        toast.success('Link copied to clipboard')
        setPopupVisible(false)
      })
      .catch(error => console.error('Failed to copy link: ', error))
  }

  return (
    <div
      className={classes['share-button']}
      onClick={handleClick}
      ref={buttonRef}
    >
      <RiShareFill className={classes['icon']} />
      <span className={classes['text']}>Share</span>

      {isPopupVisible && (
        <div className={classes['popup-menu']} ref={popupRef}>
          <button
            className={classes['copy-link-button']}
            onClick={handleCopyLink}
          >
            Copy link
          </button>
        </div>
      )}
    </div>
  )
}

export default ShareButton
