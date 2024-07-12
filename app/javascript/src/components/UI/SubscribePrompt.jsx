import React from 'react'
import { Link } from 'react-router-dom'

import classes from './SubscribePrompt.module.css'

const SubscribePrompt = () => {
  return (
    <div className={classes.card}>
      <div className={classes['content-wrapper']}>
        <p className={classes.message}>
          Subscribe to a channel and start creating your first piece now!
        </p>
        <Link to={'/channels'}>
          <button className={classes.btn}>Browse Channels</button>
        </Link>
      </div>
    </div>
  )
}

export default SubscribePrompt
