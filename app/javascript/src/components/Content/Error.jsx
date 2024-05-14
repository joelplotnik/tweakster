import React from 'react';
import classes from './Error.module.css'

export function Error({ message }) {
  return (
    <div className={classes.container}>
      <h3 className={classes.title}>Oops! Something went wrong...</h3>
      <p className={classes.message}>{message}</p>
    </div>
  )
}
