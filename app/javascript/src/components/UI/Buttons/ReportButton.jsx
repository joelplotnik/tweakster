import { useState } from 'react'
import { RiSkullLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'

import AuthModal from '../Modals/AuthModal'
import classes from './ReportButton.module.css'

const ReportButton = ({ onClick }) => {
  const token = useSelector(state => state.token.token)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleAuthModalToggle = () => {
    setShowAuthModal(prev => !prev)
  }

  const handleReport = () => {
    if (!token) {
      setShowAuthModal(true)
      return
    }

    if (onClick) {
      onClick()
    }
  }

  return (
    <>
      <div className={classes['report-button']} onClick={handleReport}>
        <RiSkullLine className={classes['icon']} />
        <span className={classes['text']}>Report</span>
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
    </>
  )
}

export default ReportButton
