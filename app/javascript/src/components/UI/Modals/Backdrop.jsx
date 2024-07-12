import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

import classes from './Backdrop.module.css'

export function Backdrop({ onClick, isPieceModalBG }) {
  const pieceModalActive = useSelector(
    state => state.pieceModal.pieceModalActive
  )

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      if (!pieceModalActive || isPieceModalBG) {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isPieceModalBG, pieceModalActive])

  const backdropClasses =
    pieceModalActive && !isPieceModalBG
      ? `${classes.backdrop} ${classes['backdrop-second']}`
      : classes.backdrop

  return <div className={backdropClasses} onClick={onClick} />
}

export default Backdrop
