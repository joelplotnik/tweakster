import { useEffect, useRef, useState } from 'react'
import { RiMoreFill } from 'react-icons/ri'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import { API_URL } from '../../../constants/constants'
import ConfirmationModal from '../Modals/ConfirmationModal'
import ReportModal from '../Modals/ReportModal'
import ChangeButton from './ChangeButton'
import DeleteButton from './DeleteButton'
import classes from './MoreButton.module.css'
import ReportButton from './ReportButton'

const MoreButton = ({ content, basePath, sharePath, isOwner }) => {
  const token = useSelector(state => state.token.token)
  const [isPopupVisible, setPopupVisible] = useState(false)
  const buttonRef = useRef(null)
  const popupRef = useRef(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

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

  const handleReportModalToggle = () => {
    setPopupVisible(false)
    setShowReportModal(!showReportModal)
  }

  const handleConfirmationModalToggle = () => {
    setPopupVisible(false)
    setShowConfirmationModal(!showConfirmationModal)
  }

  const handleDelete = async () => {
    if (!token) {
      console.error('No auth token found.')
      return
    }

    const { type, id, challenge_id } = content

    try {
      let url
      if (type === 'challenge') {
        url = `${API_URL}/${basePath}/challenges/${id}`
      } else if (type === 'attempt') {
        url = `${API_URL}/${basePath}/challenges/${challenge_id}/attempts/${id}`
      } else {
        throw new Error(`Unsupported content type: ${type}`)
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete ${type} (status: ${response.status})`)
      }

      window.location.reload()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  return (
    <>
      <div className={classes['more-button']} ref={buttonRef}>
        <div onClick={handleClick} className={classes['trigger']}>
          <RiMoreFill className={classes['icon']} />
        </div>
        {isPopupVisible && (
          <div className={classes['popup-menu']} ref={popupRef}>
            {isOwner && (
              <>
                <Link to={`${sharePath}/edit`} className={classes['menu-item']}>
                  <ChangeButton
                    label={content.type === 'attempt' ? 'Update' : 'Edit'}
                  />
                </Link>
                <div
                  className={classes['menu-item']}
                  onClick={handleConfirmationModalToggle}
                >
                  <DeleteButton />
                </div>
              </>
            )}
            {!isOwner && (
              <div
                className={classes['menu-item']}
                onClick={handleReportModalToggle}
              >
                <ReportButton />
              </div>
            )}
          </div>
        )}
      </div>
      {showReportModal && (
        <ReportModal onClick={handleReportModalToggle} content={content} />
      )}
      {showConfirmationModal && (
        <ConfirmationModal
          onConfirm={handleDelete}
          onClick={handleConfirmationModalToggle}
        />
      )}
    </>
  )
}

export default MoreButton
