import React from 'react'
import { useRouteLoaderData } from 'react-router-dom'

import classes from './HomePage.module.css'
import PopularPage from './PopularPage'

const HomePage = () => {
  const token = useRouteLoaderData('root')

  return (
    <>
      {token ? (
        <div className={classes['home-page']}>
          <div className={classes.container}>{'HOME PAGE'}</div>
        </div>
      ) : (
        <PopularPage />
      )}
    </>
  )
}

export default HomePage
