import { useRouteLoaderData } from 'react-router-dom'

import { API_URL } from '../../constants/constants'
import { getAuthToken } from '../../util/auth'
import classes from './GamePage.module.css'

const GamePage = () => {
  const game = useRouteLoaderData('game')

  return (
    <div className={classes['game-page']} key={game.id}>
      {/* <GameCard game={game} /> */}
      <h1>YOU MADE IT TO THE GAME PAGE</h1>
    </div>
  )
}

export default GamePage

export async function loader({ params }) {
  const { name } = params
  const token = await getAuthToken()

  const response = await fetch(`${API_URL}/games/${name}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw json({ message: 'Could not find user' }, { status: 500 })
  }

  const data = await response.json()

  return data
}
