import React from 'react'
import { Link } from 'react-router-dom'

import defaultVisual from '../../assets/default-visual.png'
import classes from './Channel.module.css'

const Channel = ({ channel }) => {
  return (
    <Link to={`${channel.id}`} className={classes.link}>
      <div className={classes['channel-container']}>
        <div className={classes['channel-info']}>
          <div className={classes['channel-visual-container']}>
            <img
              src={channel?.visual_url || defaultVisual}
              alt="User"
              className={classes['channel-visual']}
            />
          </div>
          <div className={classes['channel-name']}>{channel.name}</div>
          <div className={classes['user-count']}>
            Subscribers: {channel.subscriptions_count}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Channel
