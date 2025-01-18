import ReactDOM from 'react-dom'

import Backdrop from './Backdrop'
import classes from './SlideUpModal.module.css'

const SlideUpModal = ({ onClick, children }) => {
  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop
          onClick={event => {
            event.stopPropagation()
            onClick()
          }}
        />,
        document.getElementById('backdrop-root')
      )}
      {ReactDOM.createPortal(
        <div
          className={classes.modal}
          onClick={event => event.stopPropagation()}
        >
          {children}
        </div>,
        document.getElementById('overlay-root')
      )}
    </>
  )
}

export default SlideUpModal
