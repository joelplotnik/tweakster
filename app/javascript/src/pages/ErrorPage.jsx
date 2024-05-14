import React from 'react';
import { useRouteError } from 'react-router-dom';

import MainNavigation from '../components/Header/MainNavigation';

import classes from './ErrorPage.module.css';

const ErrorPage = () => {
  const error = useRouteError();

  const title = 'Oops!';
  let message = 'Something went wrong...';

  if (error && error.status === 500 && error.data?.message) {
    message = error.data.message;
  }

  if (error && error.status === 404) {
    message = 'Could not find resource or page.';
  }

  return (
    <>
      <MainNavigation />
      <main className={classes.error}>
        <h1 className={classes.title}>{title}</h1>
        <p className={classes.message}>{message}</p>
      </main>
    </>
  );
};

export default ErrorPage;
