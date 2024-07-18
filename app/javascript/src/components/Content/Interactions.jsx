import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import Comments from './Comments'
import classes from './Interactions.module.css'

const Interactions = ({ pieceClassModalRef }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const piece = useSelector(state => state.piece.piece)
  const [activeTab, setActiveTab] = useState('comments')

  useEffect(() => {
    const tabState = location.state && location.state.tab

    if (tabState) {
      setActiveTab(tabState)
    } else {
      const params = new URLSearchParams(location.search)
      const tabParam = params.get('tab')

      if (tabParam === 'comments' || 'tweaks') {
        setActiveTab('comments')
      }
    }
  }, [location.state, location.search])

  const handleTabClick = tab => {
    const params = new URLSearchParams(location.search)
    params.set('tab', tab)
    navigate(`${location.pathname}?${params}`, { replace: true })
    setActiveTab(tab)
  }

  return (
    <>
      <div className={classes['tab-container']}>
        <button
          className={`${classes.tab} ${
            activeTab === 'comments' ? `${classes.active}` : ''
          }`}
          onClick={() => handleTabClick('comments')}
        >
          {piece.comments_count} Comments
        </button>
      </div>

      {activeTab === 'comments' && (
        <div>
          <Comments piece={piece} pieceClassModalRef={pieceClassModalRef} />
        </div>
      )}
    </>
  )
}

export default Interactions
