import { RiCloseLine, RiFlaskLine } from 'react-icons/ri'

import { Backdrop } from './Backdrop'
import ReactDOM from 'react-dom'
import classes from './PopulateModal.module.css'

const PopulateModal = ({ onClick, onConfirm, onCheckboxChange }) => {
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
        <div className={classes.modal}>
          <button className={classes['close-icon']} onClick={onClick}>
            <RiCloseLine />
          </button>
          <div
            className={classes['modal-content']}
            onClick={(e) => e.stopPropagation()}
          >
            <RiFlaskLine className={classes['flask-icon']} />
            <h2 className={classes['modal-header']}>Include Content</h2>
            <p className={classes.text}>
              Do you want to include the text content from this piece in your
              tweak?
            </p>
            <div className={classes['checkbox-container']}>
              <label className={classes['checkbox-label']}>
                <input
                  type="checkbox"
                  value="text"
                  onChange={onCheckboxChange}
                />
                Text Content
              </label>
            </div>
            <div className={classes['button-container']}>
              <button className={classes['cancel-button']} onClick={onClick}>
                Cancel
              </button>
              <button
                className={classes['confirm-button']}
                onClick={handleConfirm}
              >
                Tweak
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('overlay-root')
      )}
    </>
  )
}

export default PopulateModal
