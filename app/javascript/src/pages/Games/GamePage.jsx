import { useRouteLoaderData } from 'react-router-dom'

import GameCard from '../../components/Content/Games/GameCard'
import ChallengesList from '../../components/Content/Lists/ChallengesList'
import { API_URL } from '../../constants/constants'
import { getAuthToken } from '../../util/auth'
import classes from './GamePage.module.css'

const GamePage = () => {
  const game = useRouteLoaderData('game')

  return (
    <div className={classes['game-page']} key={game.id}>
      <GameCard game={game} />
      <h1 className={classes.heading}>Challenges</h1>
      <hr className={classes.divider} />
      <ChallengesList />
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
