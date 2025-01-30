import { RiChat3Line } from 'react-icons/ri'

import classes from './NoComments.module.css'

const NoComments = () => {
  return (
    <div className={classes['no-comments']}>
      <div className={classes.body}>
        <RiChat3Line className={classes.icon} />
        <div className={classes.text}>
          <h2>No comments yet.</h2>
          <p>Start the conversation!</p>
        </div>
      </div>
    </div>
  )
}

export default NoComments
