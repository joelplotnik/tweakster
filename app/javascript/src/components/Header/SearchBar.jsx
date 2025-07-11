import debounce from 'lodash/debounce'
import { useCallback, useEffect, useRef, useState } from 'react'
import { RiArrowLeftLine, RiCloseLine, RiSearchLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'

import placeholderCover from '../../assets/default_cover.png'
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

  const fetchResults = useCallback(
    debounce(async query => {
      if (!query) {
        setUserResults([])
        setGameResults([])
        return
      }
      try {
        const [userResponse, gameResponse] = await Promise.all([
          fetch(`${API_URL}/users/search?search_term=${query}`),
          fetch(`${API_URL}/games/search?search_term=${query}`),
        ])
        if (!userResponse.ok || !gameResponse.ok) {
          throw new Error('Network response was not ok')
        }
        const userData = await userResponse.json()
        const gameData = await gameResponse.json()
        setUserResults(userData)
        setGameResults(gameData)
      } catch (error) {
        console.error('Error fetching results:', error.message)
      }
    }, 300), // 300ms debounce delay
    []
  )

  useEffect(() => {
    fetchResults(searchTerm)
    // Cleanup the debounced function on unmount
    return () => fetchResults.cancel()
  }, [searchTerm, fetchResults])

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
                  onClick={() => {
                    clearInput()
                    handleBackClick()
                  }}
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
                  onClick={() => {
                    clearInput()
                    handleBackClick()
                  }}
                >
                  <div className={classes['game-name-image-container']}>
                    <div className={classes['game-image-container']}>
                      <img
                        src={
                          result.cover_url && result.cover_url !== 'https:'
                            ? result.cover_url
                            : placeholderCover
                        }
                        alt="Game"
                        className={classes['game-visual']}
                      />
                    </div>
                    <div className={classes['game-name']}>
                      <span>{result.name}</span>
                    </div>
                  </div>
                  {/* <span className={classes.platform}>{result.platform}</span> */}
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
