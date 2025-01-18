import { useEffect } from 'react'

import classes from './Backdrop.module.css'

export function Backdrop({ onClick }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return <div className={classes.backdrop} onClick={onClick} />
}

export default Backdrop
