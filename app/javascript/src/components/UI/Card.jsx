import React from 'react';
import classes from './Card.module.css';

const Card = (props) => {
  const classNames = [classes.card];

  if (props.className) {
    classNames.push(props.className);
  }

  return <div className={classNames.join(' ')}>{props.children}</div>;
};

export default Card;
