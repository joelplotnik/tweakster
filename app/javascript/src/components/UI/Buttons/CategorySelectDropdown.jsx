import { useEffect, useRef, useState } from 'react'
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
  const [isFocused, setIsFocused] = useState(false)
  const searchRef = useRef(null)

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

  const handleCategorySelect = category => {
    onCategorySelect(category)
    setSearchTerm(category)
    setIsFocused(false)
  }

  const handleInputFocus = () => {
    setIsFocused(true)
  }

  const handleClearCategory = () => {
    onCategorySelect(null)
    setSearchTerm('')
  }

  const filteredCategories = CATEGORIES.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={classes['search-bar']} ref={searchRef}>
      <div className={classes['search']}>
        <input
          type="text"
          placeholder="Select a category"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
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
