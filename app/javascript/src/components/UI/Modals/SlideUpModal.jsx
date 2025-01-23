import ReactDOM from 'react-dom'

import Backdrop from './Backdrop'
import classes from './SlideUpModal.module.css'

const SlideUpModal = ({ onClick, children, header }) => {
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
          <h2 className={classes.header}>{header}</h2>
          <hr className={classes.divider} />
          <div className={classes.content}>{children}</div>
        </div>,
        document.getElementById('overlay-root')
      )}
    </>
  )
}

export default SlideUpModal
