import React from 'react'

import Logo from '../../assets/logo.svg'
import classes from './Loading.module.css'

const Loading = ({ text = 'Loading your experience...' }) => {
  return (
    <div className={classes['loading-container']}>
      <img src={Logo} alt="Loading Rat" className={classes['animated-logo']} />
      <h1 className={classes['loading-text']}>{text}</h1>
    </div>
  )
}

export default Loading
