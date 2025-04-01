import debounce from 'lodash/debounce'
import { useCallback, useEffect, useRef, useState } from 'react'
import { RiCloseLine } from 'react-icons/ri'

import classes from './CategorySelectDropdown.module.css'

const CATEGORIES = [
  'Perfectionist',
  'Strategic Planning',
  'Meticulous Collection',
  'Precision-Based',
  'Resource Management',
  'Puzzle and Logic',
  'Time-Efficiency',
  'Skill Mastery',
  'Completionist',
  'Self-Improvement',
]

const CategorySelectDropdown = ({ onCategorySelect, selectedCategory }) => {
  const [searchTerm, setSearchTerm] = useState(selectedCategory || '')
  const [filteredCategories, setFilteredCategories] = useState(CATEGORIES)
  const [isFocused, setIsFocused] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const searchRef = useRef(null)

  const filterCategories = useCallback(
    debounce(query => {
      if (!query) {
        setFilteredCategories(CATEGORIES)
        return
      }
      setFilteredCategories(
        CATEGORIES.filter(category =>
          category.toLowerCase().includes(query.toLowerCase())
        )
      )
    }, 300),
    []
  )

  useEffect(() => {
    filterCategories(searchTerm)
    return () => filterCategories.cancel()
  }, [searchTerm, filterCategories])

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
    setShowWarning(false)
    if (selectedCategory && event.target.value !== selectedCategory) {
      onCategorySelect(null)
    }
  }

  const handleCategorySelect = category => {
    onCategorySelect(category)
    setSearchTerm(category)
    setIsFocused(false)
    setShowWarning(false)
  }

  const handleInputFocus = () => {
    setIsFocused(true)
  }

  const handleInputBlur = () => {
    if (searchTerm && !CATEGORIES.includes(searchTerm)) {
      setShowWarning(true)
    }
  }

  const handleClearCategory = () => {
    onCategorySelect(null)
    setSearchTerm('')
    setShowWarning(false)
  }

  return (
    <div className={classes['search-bar']} ref={searchRef}>
      {showWarning && (
        <div className={classes['warning']}>
          Please select a category from the list.
        </div>
      )}
      <div className={classes['search']}>
        <input
          type="text"
          placeholder="Select a category"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          autoComplete="off"
          className={classes['search-input']}
        />
        {searchTerm && (
          <div className={classes['clear-icon']} onClick={handleClearCategory}>
            <RiCloseLine className={classes.icon} />
          </div>
        )}
      </div>
      {isFocused && filteredCategories.length > 0 && (
        <div className={classes['search-results']}>
          <div className={classes['categories']}>
            {filteredCategories.map(category => (
              <div
                key={category}
                className={classes['category-result']}
                onClick={() => handleCategorySelect(category)}
              >
                <span>{category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedCategory && (
        <input
          type="hidden"
          id="category"
          name="challenge[category]"
          value={selectedCategory}
        />
      )}
    </div>
  )
}

export default CategorySelectDropdown
