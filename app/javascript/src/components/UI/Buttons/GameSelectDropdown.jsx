import debounce from 'lodash/debounce'
import { useCallback, useEffect, useRef, useState } from 'react'
import { RiCloseLine } from 'react-icons/ri'

import { API_URL } from '../../../constants/constants'
import classes from './GameSelectDropdown.module.css'

const GameSelectDropdown = ({
  onGameSelect,
  selectedGame,
  isChallengeForm,
}) => {
  const [searchTerm, setSearchTerm] = useState(
    selectedGame ? selectedGame.name : ''
  )
  const [gameResults, setGameResults] = useState([])
  const [isFocused, setIsFocused] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const searchRef = useRef(null)

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
    const value = event.target.value
    setSearchTerm(value)
    setShowWarning(false)
    if (selectedGame && value !== selectedGame.name) {
      onGameSelect(null)
    }
  }

  const handleGameSelect = game => {
    onGameSelect(game)
    setSearchTerm(game.name)
    setIsFocused(false)
    setShowWarning(false)
  }

  const handleInputFocus = () => {
    setIsFocused(true)
  }

  const handleInputBlur = () => {
    if (searchTerm && !selectedGame) {
      setShowWarning(true)
    }
  }

  const handleClearGame = () => {
    onGameSelect(null)
    setSearchTerm('')
    setShowWarning(false)
  }

  return (
    <div className={classes['search-bar']} ref={searchRef}>
      {showWarning && (
        <div className={classes['warning']}>
          Please select a game from the list.
        </div>
      )}
      <div className={classes['search']}>
        <input
          type="text"
          placeholder={
            isChallengeForm
              ? 'Select a game for your challenge'
              : 'What are you playing?'
          }
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur} // Handle blur event
          autoComplete="off"
          className={classes['search-input']}
        />
        {searchTerm && (
          <div className={classes['clear-icon']} onClick={handleClearGame}>
            <RiCloseLine className={classes.icon} />
          </div>
        )}
      </div>
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
        <input
          type="hidden"
          id="game"
          name={
            isChallengeForm ? 'challenge[game_id]' : 'user[currently_playing]'
          }
          value={selectedGame.id}
        />
      )}
    </div>
  )
}

export default GameSelectDropdown
