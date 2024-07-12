import React from 'react'
import ReactDOM from 'react-dom'
import { RiBookmark3Line, RiCloseCircleLine, RiCloseLine } from 'react-icons/ri'

import { Backdrop } from './Backdrop'
import classes from './ConfirmationModal.module.css'

const ConfirmationModal = ({
  type,
  header,
  message,
  button,
  onClick,
  onConfirm,
}) => {
  const handleConfirm = () => {
    onClick()
    onConfirm()
  }

  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onClick={onClick} />,
        document.getElementById('backdrop-root')
      )}
      {ReactDOM.createPortal(
        <>
          <div className={classes.modal}>
            <button className={classes['close-icon']} onClick={onClick}>
              <RiCloseLine />
            </button>
            <div
              className={classes['modal-content']}
              onClick={e => e.stopPropagation()}
            >
              {type === 'confirm' ? (
                <RiBookmark3Line className={classes['subscribe-icon']} />
              ) : (
                <RiCloseCircleLine className={classes['close-circle-icon']} />
              )}
              <h2 className={classes['modal-header']}>
                {header ? header : 'Are you sure?'}
              </h2>
              <p>
                {message
                  ? message
                  : 'This action cannot be undone. Are you sure you want to proceed with the deletion?'}
              </p>
              <div className={classes['button-container']}>
                <button className={classes['cancel-button']} onClick={onClick}>
                  Cancel
                </button>
                <button
                  className={
                    type === 'confirm'
                      ? classes['confirm-button']
                      : classes['delete-button']
                  }
                  onClick={handleConfirm}
                >
                  {button ? button : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.getElementById('overlay-root')
      )}
    </>
  )
}

export default ConfirmationModal
