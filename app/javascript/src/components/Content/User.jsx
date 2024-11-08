import React from 'react'
import { Link } from 'react-router-dom'

import classes from './User.module.css'

const User = ({ user }) => {
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
          <div className={classes['piece-count']}>
            Pieces: {user.piece_count}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default User
