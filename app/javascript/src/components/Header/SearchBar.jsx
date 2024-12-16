import { useEffect, useRef, useState } from 'react'
import { RiArrowLeftLine, RiCloseLine, RiSearchLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'

import { API_URL } from '../../constants/constants'
import classes from './SearchBar.module.css'

function SearchBar({ mobile, handleBackClick }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [userResults, setUserResults] = useState([])
  const [gameResults, setGameResults] = useState([])
  const [isFocused, setIsFocused] = useState(false)
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = event => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [userResponse, gameResponse] = await Promise.all([
          fetch(`${API_URL}/users/search?search_term=${searchTerm}`),
          fetch(`${API_URL}/games/search?search_term=${searchTerm}`),
        ])
        if (!userResponse.ok || !gameResponse.ok) {
          throw new Error('Network response was not ok')
        }
        const userData = await userResponse.json()
        const gameData = await gameResponse.json()
        setUserResults(userData)
        setGameResults(gameData)
      } catch (error) {
        console.error('Error: ', error.message)
      }
    }

    if (searchTerm && isFocused) {
      fetchResults()
    } else {
      setUserResults([])
      setGameResults([])
    }
  }, [searchTerm, isFocused])

  useEffect(() => {
    if (mobile && inputRef.current) {
      inputRef.current.focus()
    }
  }, [mobile])

  const handleInputChange = event => {
    setSearchTerm(event.target.value)
  }

  const clearInput = () => {
    setSearchTerm('')
  }

  const handleInputFocus = () => {
    setIsFocused(true)
  }

  const hasResults = userResults.length !== 0 || gameResults.length !== 0

  return (
    <div
      className={mobile ? classes['search-bar-mobile'] : classes['search-bar']}
      ref={searchRef}
    >
      {mobile && (
        <div className={classes['back-arrow']} onClick={handleBackClick}>
          <RiArrowLeftLine className={classes.icon} />
        </div>
      )}
      <div className={classes['search']}>
        <div className={classes['search-icon']}>
          <RiSearchLine className={classes.icon} />
        </div>
        <input
          id="searchInput"
          className={classes['search-input']}
          type="text"
          placeholder="Search Tweakster"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          autoComplete="off"
          ref={inputRef}
        />
        <div className={classes['clear-icon']} onClick={clearInput}>
          {searchTerm && <RiCloseLine className={classes.icon} />}
        </div>
      </div>
      {isFocused && (
        <div
          className={`${classes['search-results']} ${
            hasResults ? classes['has-results'] : ''
          }`}
        >
          {userResults.length !== 0 && (
            <div className={classes.users}>
              <>
                <hr />
                <p>Users:</p>
              </>

              {userResults.map(result => (
                <Link
                  to={`/users/${result.slug}`}
                  key={result.slug}
                  className={classes['user-result']}
                  onClick={clearInput}
                >
                  <div className={classes['user-avatar-container']}>
                    <img
                      src={result.avatar_url}
                      alt="User"
                      className={classes['user-avatar']}
                    />
                  </div>
                  {result.username}
                </Link>
              ))}
            </div>
          )}
          {gameResults.length !== 0 && (
            <div className={classes.games}>
              <>
                <hr />
                <p>Games:</p>
              </>

              {gameResults.map(result => (
                <Link
                  to={`/games/${result.slug}`}
                  key={result.slug}
                  className={classes['game-result']}
                  onClick={clearInput}
                >
                  <div className={classes['game-image-container']}>
                    <img
                      src={result.image_url}
                      alt="Game"
                      className={classes['game-visual']}
                    />
                  </div>
                  {result.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
