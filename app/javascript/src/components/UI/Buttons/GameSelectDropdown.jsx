import { useState } from 'react'
import Select from 'react-select'

import { API_URL } from '../../constants/constants'
import styles from './GameSelect.module.css'

function GameSelect({ selectedGame, onGameChange }) {
  const [inputValue, setInputValue] = useState('')
  const [gameResults, setGameResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleInputChange = async newInputValue => {
    setInputValue(newInputValue)
    if (newInputValue) {
      setLoading(true)
      try {
        const response = await fetch(
          `${API_URL}/games/search?search_term=${newInputValue}`
        )
        const data = await response.json()
        setGameResults(data)
      } catch (error) {
        console.error('Error fetching games:', error)
      } finally {
        setLoading(false)
      }
    } else {
      setGameResults([])
    }
  }

  const handleChange = selectedOption => {
    onGameChange(selectedOption ? selectedOption.value : null)
  }

  return (
    <div className={styles['select-container']}>
      <Select
        value={gameResults.find(game => game.id === selectedGame)}
        onInputChange={handleInputChange}
        onChange={handleChange}
        options={gameResults.map(game => ({
          value: game.id,
          label: game.name,
        }))}
        isClearable
        placeholder="Search for a game"
      />
      {loading && (
        <p className={styles['loading-indicator']}>Loading games...</p>
      )}
      {gameResults.length === 0 && !loading && (
        <p className={styles['no-results']}>No results found.</p>
      )}
    </div>
  )
}

export default GameSelect
