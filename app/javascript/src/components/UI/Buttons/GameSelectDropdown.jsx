import debounce from 'lodash/debounce'
import { useCallback, useEffect, useRef, useState } from 'react'
import { RiCloseLine } from 'react-icons/ri'

import { API_URL } from '../../../constants/constants'
import classes from './GameSelectDropdown.module.css'

const GameSelectDropdown = ({ onGameSelect, selectedGame }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [gameResults, setGameResults] = useState([])
  const [isFocused, setIsFocused] = useState(false)
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  const fetchGames = useCallback(
    debounce(async query => {
      if (!query) {
        setGameResults([])
        return
      }
      try {
        const response = await fetch(
          `${API_URL}/games/search?search_term=${query}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch games')
        }
        const data = await response.json()
        setGameResults(data)
      } catch (error) {
        console.error('Error: ', error.message)
      }
    }, 300),
    []
  )

  useEffect(() => {
    fetchGames(searchTerm)
    return () => fetchGames.cancel()
  }, [searchTerm, fetchGames])

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

  const handleInputChange = event => {
    setSearchTerm(event.target.value)
  }

  const clearInput = () => {
    setSearchTerm('')
  }

  const handleInputFocus = () => {
    setIsFocused(true)
  }

  const handleGameSelect = game => {
    onGameSelect(game)
    setSearchTerm('')
    setIsFocused(false)
  }

  const handleClearGame = () => {
    onGameSelect(null)
    setSearchTerm('')
  }

  const inputValue = selectedGame ? selectedGame.name : searchTerm

  return (
    <div className={classes['search-bar']} ref={searchRef}>
      <div className={classes['search']}>
        <input
          type="text"
          placeholder="What are you playing?"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          ref={inputRef}
          autoComplete="off"
          className={classes['search-input']}
        />
        <div className={classes['clear-icon']} onClick={clearInput}>
          {searchTerm && !selectedGame && (
            <RiCloseLine className={classes.icon} />
          )}
        </div>
      </div>
      {selectedGame && (
        <div className={classes['selected-game']}>
          <button
            className={classes['remove-button']}
            onClick={handleClearGame}
          >
            Remove current game
          </button>
        </div>
      )}
      {isFocused && gameResults.length > 0 && (
        <div className={classes['search-results']}>
          <div className={classes['games']}>
            {gameResults.map(game => (
              <div
                key={game.slug}
                className={classes['game-result']}
                onClick={() => handleGameSelect(game)}
              >
                <span>{game.name}</span>
                <span className={classes.platform}>{game.platform}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedGame && (
        <input type="hidden" name="currently_playing" value={selectedGame.id} />
      )}
    </div>
  )
}

export default GameSelectDropdown
