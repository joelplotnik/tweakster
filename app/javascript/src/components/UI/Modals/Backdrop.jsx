import { useEffect } from 'react'

import classes from './Backdrop.module.css'

export function Backdrop({ onClick, isSlideUpPresent }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const backdropClass = isSlideUpPresent
    ? `${classes.backdrop} ${classes['higher-backdrop']}`
    : classes.backdrop

  return <div className={backdropClass} onClick={onClick} />
}

export default Backdrop
