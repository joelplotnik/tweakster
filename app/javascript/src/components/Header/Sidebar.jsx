import React, { useEffect, useState } from 'react'
import {
  RiHeart3Fill,
  RiHeart3Line,
  RiHome4Fill,
  RiHome4Line,
} from 'react-icons/ri'
import { Link } from 'react-router-dom'

import { API_URL } from '../../constants/constants'
import classes from './Sidebar.module.css'

const Sidebar = ({ isOpen, onClose }) => {
  const [hoveredLink, setHoveredLink] = useState(null)
  const [users, setUsers] = useState([])
  const [games, setGames] = useState([])
  const [isUsersEmpty, setIsUsersEmpty] = useState(false)
  const [isGamesEmpty, setIsGamesEmpty] = useState(false)

  useEffect(() => {
    fetchUsers(5)
    fetchGames(5)
  }, [])

  const fetchUsers = async limit => {
    try {
      const response = await fetch(`${API_URL}/popular_users`)
      const data = await response.json()
      setUsers(data.users)
      setIsUsersEmpty(data.users.length === 0)
    } catch (error) {
      console.error('Error fetching users:', error.message)
    }
  }

  const fetchGames = async limit => {
    try {
      const response = await fetch(`${API_URL}/popular_games`)
      const data = await response.json()
      setGames(data.games)
      setIsGamesEmpty(data.games.length === 0)
    } catch (error) {
      console.error('Error fetching games:', error.message)
    }
  }

  return (
    <div className={`${classes.sidebar} ${isOpen ? classes.open : ''}`}>
      <div className={classes['content-wrapper']}>
        <div className={classes.links}>
          <Link
            to="/"
            className={classes.link}
            onClick={onClose}
            onMouseEnter={() => setHoveredLink('home')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {hoveredLink === 'home' ? <RiHome4Fill /> : <RiHome4Line />}
            <span className={classes.name}>Home</span>
          </Link>
          <Link
            to="/popular"
            className={classes.link}
            onClick={onClose}
            onMouseEnter={() => setHoveredLink('popular')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {hoveredLink === 'popular' ? <RiHeart3Fill /> : <RiHeart3Line />}
            <span className={classes.name}>Popular</span>
          </Link>
          <hr className={classes.line} />
          <div className={classes.header}>{'TOP GAMES'}</div>
          {games.map(game => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className={classes.link}
              onClick={onClose}
              onMouseEnter={() => setHoveredLink(game.name)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <div className={classes.info}>
                <img
                  src={game?.image_url}
                  alt="Game"
                  className={classes.image}
                />
                <span className={classes.name}>{game.name}</span>
              </div>
            </Link>
          ))}
          <Link to="/games" className={classes['see-more-link']}>
            See more
          </Link>
          <hr className={classes.line} />
          <div className={classes.header}>{'TOP USERS'}</div>
          {users.map(user => (
            <Link
              key={user.id}
              to={`/users/${user.id}`}
              className={classes.link}
              onClick={onClose}
              onMouseEnter={() => setHoveredLink(user.username)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <div className={classes.info}>
                <img
                  src={user?.avatar_url}
                  alt="User"
                  className={classes.image}
                />
                <span className={classes.name}>{user.username}</span>
              </div>
            </Link>
          ))}
          <Link to="/users" className={classes['see-more-link']}>
            See more
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
