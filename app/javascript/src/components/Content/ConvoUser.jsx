import React from 'react'
import { Link } from 'react-router-dom'

import classes from './ConvoUser.module.css'

const ConvoUser = ({ user }) => {
  return (
    <Link to={`${user.id}`} className={classes.link}>
      <div className={classes['user-container']}>
        <div className={classes['user-info']}>
          <div className={classes['user-avatar-container']}>
            <img
              src={user?.avatar_url}
              alt="User"
              className={classes['user-avatar']}
            />
          </div>
          <div className={classes['user-username']}>{user.username}</div>
          {user.unread_count > 0 && (
            <div className={classes['unread-count']}>
              <div className={classes['unread-circle']}>
                {user.unread_count}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ConvoUser
