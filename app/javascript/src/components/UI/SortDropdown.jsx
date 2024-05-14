import React, { useState, useEffect, useRef } from 'react';
import classes from './SortDropdown.module.css';

const SortDropdown = ({ onSortChange, selectedSortOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['top', 'new'];
  const dropdownRef = useRef(null);

  const handleSortChange = (option) => {
    setIsOpen(false);
    onSortChange(option);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes['custom-select-wrapper']} ref={dropdownRef}>
        <div className={classes['select-dropdown']} onClick={toggleDropdown}>
          <span className={classes.label}>Sort By:</span>
          {selectedSortOption.charAt(0).toUpperCase() +
            selectedSortOption.slice(1)}
          <div
            className={isOpen ? classes['arrow-up'] : classes['arrow-down']}
          ></div>
        </div>
        {isOpen && (
          <div className={classes['dropdown-menu']}>
            {options.map((option) => (
              <div
                key={option}
                className={classes['dropdown-option']}
                onClick={() => handleSortChange(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SortDropdown;
