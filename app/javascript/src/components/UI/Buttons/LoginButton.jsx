import React from 'react'
import classes from './LoginButton.module.css'

const LoginButton = ({ onClick, children, className }) => {
  return (
    <button className={`${classes.button} ${className}`} onClick={onClick}>
      {children}
    </button>
  )
}

export default LoginButton
