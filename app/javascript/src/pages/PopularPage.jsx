import React from 'react'

import classes from './PopularPage.module.css'

const PopularPage = () => {
  const popularUsers = ['User 1', 'User 2', 'User 3', 'User 4']
  const popularGames = ['Game 1', 'Game 2', 'Game 3', 'Game 4']
  const popularChallenges = [
    'Challenge 1',
    'Challenge 2',
    'Challenge 3',
    'Challenge 4',
  ]
  const completedChallenges = [
    'Completed 1',
    'Completed 2',
    'Completed 3',
    'Completed 4',
  ]

  const renderItems = items =>
    items.map((item, index) => (
      <div key={index} className={classes.item}>
        {item}
      </div>
    ))

  return (
    <div className={classes['popular-page']}>
      <h2 className={classes.title}>Users</h2>
      <div className={classes.carousel}>{renderItems(popularUsers)}</div>

      <h2 className={classes.title}>Games</h2>
      <div className={classes.carousel}>{renderItems(popularGames)}</div>

      <h2 className={classes.title}>Challenges</h2>
      <div className={classes.carousel}>{renderItems(popularChallenges)}</div>

      <h2 className={classes.title}>Completed Challenges</h2>
      <div className={classes.carousel}>{renderItems(completedChallenges)}</div>
    </div>
  )
}

export default PopularPage
