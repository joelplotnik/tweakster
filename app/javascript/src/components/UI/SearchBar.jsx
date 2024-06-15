import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { API_URL } from '../../constants/constants';

import classes from './SearchBar.module.css';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';
import defaultAvatar from '../../assets/default-avatar.png';
import defaultVisual from '../../assets/default-visual.png';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [channelResults, setChannelResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [userResponse, channelResponse] = await Promise.all([
          fetch(`${API_URL}/users/search?search_term=${searchTerm}`),
          fetch(`${API_URL}/channels/search?search_term=${searchTerm}`),
        ]);
        if (!userResponse.ok || !channelResponse.ok) {
          throw new Error('Network response was not ok');
        }
        const userData = await userResponse.json();
        const channelData = await channelResponse.json();
        setUserResults(userData);
        setChannelResults(channelData);
      } catch (error) {
        console.error('Error: ', error.message);
      }
    };

    if (searchTerm && isFocused) {
      fetchResults();
    } else {
      setUserResults([]);
      setChannelResults([]);
    }
  }, [searchTerm, isFocused]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearInput = () => {
    setSearchTerm('');
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const hasResults = userResults.length !== 0 || channelResults.length !== 0;

  return (
    <div className={classes['search-bar']} ref={searchRef}>
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

              {userResults.map((result) => (
                <Link
                  to={`/users/${result.id}`}
                  key={result.id}
                  className={classes['user-result']}
                  onClick={clearInput}
                >
                  <div className={classes['user-avatar-container']}>
                    <img
                      src={result.avatar_url || defaultAvatar}
                      alt="User"
                      className={classes['user-avatar']}
                    />
                  </div>
                  {result.username}
                </Link>
              ))}
            </div>
          )}
          {channelResults.length !== 0 && (
            <div className={classes.channels}>
              <>
                <hr />
                <p>Channels:</p>
              </>

              {channelResults.map((result) => (
                <Link
                  to={`/channels/${result.id}`}
                  key={result.id}
                  className={classes['channel-result']}
                  onClick={clearInput}
                >
                  <div className={classes['channel-visual-container']}>
                    <img
                      src={result.visual_url || defaultVisual}
                      alt="User"
                      className={classes['channel-visual']}
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
  );
}

export default SearchBar;
