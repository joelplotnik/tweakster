import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import Comments from './Comments'
import classes from './Interactions.module.css'
import Tweaks from './Tweaks'

const Interactions = ({ pieceClassModalRef }) => {
  const location = useLocation()
  const piece = useSelector(state => state.piece.piece)
  const [isScrollableTargetAvailable, setIsScrollableTargetAvailable] =
    useState(false)
  const targetSectionIdRef = useRef(null)

  useEffect(() => {
    if (pieceClassModalRef?.current || pieceClassModalRef === 'page') {
      setIsScrollableTargetAvailable(true)
    }
  }, [pieceClassModalRef])

  useEffect(() => {
    const tabState = location.state && location.state.tab
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab')
    const targetSectionId = tabState || tabParam

    if (targetSectionId) {
      targetSectionIdRef.current = `${targetSectionId}-section`
    }
  }, [location.state, location.search])

  useEffect(() => {
    if (isScrollableTargetAvailable && targetSectionIdRef.current) {
      const targetSection = document.getElementById(targetSectionIdRef.current)

      if (targetSection) {
        if (pieceClassModalRef === 'page') {
          const topOffset = 48
          const elementPosition = targetSection.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - topOffset

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
        } else {
          targetSection.scrollIntoView({ behavior: 'smooth' })
        }
      }
      targetSectionIdRef.current = null
    }
  }, [isScrollableTargetAvailable, pieceClassModalRef])

  return (
    <div className={classes['section-container']}>
      <div id="comments-section" className={classes.section}>
        <Comments
          commentable={piece}
          commentableType={'Piece'}
          pieceClassModalRef={pieceClassModalRef}
        />
      </div>
      <div id="tweaks-section" className={classes.section}>
        <Tweaks piece={piece} pieceClassModalRef={pieceClassModalRef} />
      </div>
    </div>
  )
}

export default Interactions
