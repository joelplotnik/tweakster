import React from 'react'

import classes from './SignupButton.module.css'

const SignupButton = props => {
  return (
    <button className={classes.button + ' ' + props.className} {...props} />
  )
}

export default SignupButton
