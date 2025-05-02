import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { RiCloseLine, RiSkullLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { API_URL } from '../../../constants/constants'
import { Backdrop } from './Backdrop'
import classes from './ReportModal.module.css'

const ReportModal = ({ onClick, content, isSlideUpPresent }) => {
  const token = useSelector(state => state.token.token)
  const [reportReason, setReportReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const maxCharacters = 200

  const handleConfirm = async () => {
    const reportData = {
      content_type: content.type,
      content_id: content.id,
      reason: reportReason === 'other' ? otherReason : reportReason,
    }

    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        const errorMessage = await response.json()
        if (
          response.status === 422 &&
          errorMessage.content_type &&
          errorMessage.content_type[0] ===
            'Content has already been reported by this user'
        ) {
          toast.error('You have already reported this content')
        } else {
          throw new Error('Failed to report content')
        }
      } else {
        toast.success(
          `${
            content.type.charAt(0).toUpperCase() + content.type.slice(1)
          } reported successfully`
        )
      }
      onClick()
    } catch (error) {
      console.error('Error reporting content: ', error)
      toast.error('Error reporting content')
      onClick()
    }
  }

  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onClick={onClick} isSlideUpPresent={isSlideUpPresent} />,
        document.getElementById('backdrop-root')
      )}
      {ReactDOM.createPortal(
        <div className={classes.modal}>
          <button className={classes['close-icon']} onClick={onClick}>
            <RiCloseLine />
          </button>
          <div
            className={classes['modal-content']}
            onClick={e => e.stopPropagation()}
          >
            <RiSkullLine className={classes['flag-icon']} />
            <h2 className={classes['modal-header']}>Report Content</h2>
            <p className={classes.text}>
              Select a reason for reporting this post:
            </p>
            <div className={classes['report-reasons']}>
              <label className={classes['reason-label']}>
                <input
                  type="radio"
                  name="reason"
                  value="spam"
                  checked={reportReason === 'spam'}
                  onChange={() => setReportReason('spam')}
                />
                Spam
              </label>
              <label className={classes['reason-label']}>
                <input
                  type="radio"
                  name="reason"
                  value="inappropriate"
                  checked={reportReason === 'inappropriate'}
                  onChange={() => setReportReason('inappropriate')}
                />
                Inappropriate
              </label>
              <label className={classes['reason-label']}>
                <input
                  type="radio"
                  name="reason"
                  value="other"
                  checked={reportReason === 'other'}
                  onChange={() => setReportReason('other')}
                />
                Other
              </label>
            </div>
            {reportReason === 'other' && (
              <div className={classes['custom-reason']}>
                <p className={classes.text}>
                  Please describe the issue (max {maxCharacters} characters):
                </p>
                <textarea
                  className={classes['reason-textarea']}
                  value={otherReason}
                  onChange={e => setOtherReason(e.target.value)}
                  maxLength={maxCharacters}
                />
              </div>
            )}
            <div className={classes['button-container']}>
              <button className={classes['cancel-button']} onClick={onClick}>
                Cancel
              </button>
              <button
                className={classes['report-button']}
                onClick={handleConfirm}
              >
                Report
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('overlay-root')
      )}
    </>
  )
}

export default ReportModal
