import React, { useEffect, useState } from 'react'
import {
  RiHome4Fill,
  RiHome4Line,
  RiThumbUpFill,
  RiThumbUpLine,
} from 'react-icons/ri'
import { Link, useRouteLoaderData } from 'react-router-dom'

import defaultAvatar from '../../assets/default-avatar.png'
import defaultVisual from '../../assets/default-visual.png'
import { API_URL } from '../../constants/constants'
import { getUserData } from '../../util/auth'
import classes from './Sidebar.module.css'

const Sidebar = ({ isOpen, onClose }) => {
  const token = useRouteLoaderData('root')
  const { userId } = getUserData() || {}
  const [hoveredLink, setHoveredLink] = useState(null)
  const [channels, setChannels] = useState([])
  const [users, setUsers] = useState([])
  const [isTopChannelsEmpty, setIsTopChannelsEmpty] = useState(false)
  const [isTopUsersEmpty, setIsTopUsersEmpty] = useState(false)

  useEffect(() => {
    if (token) {
      fetchTopChannels()
      fetchTopUsers()
    } else {
      fetchChannels(5)
      fetchUsers(5)
      setIsTopChannelsEmpty(true)
      setIsTopUsersEmpty(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchChannels = async limit => {
    try {
      const response = await fetch(`${API_URL}/channels/popular?limit=${limit}`)
      const data = await response.json()
      setChannels(data)
    } catch (error) {
      console.error('Error: ', error.message)
    }
  }

  const fetchTopChannels = async () => {
    try {
      const response = await fetch(
        `${API_URL}/users/${userId}/most_interacted_channels`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()

        setChannels(data)
        setIsTopChannelsEmpty(data.length === 0)

        if (data.length === 0) {
          fetchChannels(5)
        }
      } else if (response.status === 401) {
        fetchChannels(5)
      } else {
        console.error('Error fetching channels:', response.statusText)
      }
    } catch (error) {
      console.error('  ', error.message)
    }
  }

  const fetchUsers = async limit => {
    try {
      const response = await fetch(`${API_URL}/users/popular?limit=${limit}`)
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('  ', error.message)
    }
  }

  const fetchTopUsers = async () => {
    try {
      const response = await fetch(
        `${API_URL}/users/${userId}/most_interacted_users`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()

        setUsers(data)
        setIsTopUsersEmpty(data.length === 0)

        if (data.length === 0) {
          fetchUsers(5)
        }
      } else if (response.status === 401) {
        fetchUsers(5) // Fetch users without authorization
      } else {
        console.error('Error fetching users:', response.statusText)
      }
    } catch (error) {
      console.error('Error: ', error.message)
    }
  }

  return (
    <div className={`${classes.sidebar} ${isOpen ? classes.open : ''}`}>
      <div className={`${classes['content-wrapper']}`}>
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
            to="/main"
            className={classes.link}
            onClick={onClose}
            onMouseEnter={() => setHoveredLink('popular')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {hoveredLink === 'popular' ? <RiThumbUpFill /> : <RiThumbUpLine />}
            <span className={classes.name}>Popular</span>
          </Link>
          <hr className={classes.line} />
          <div className={classes.header}>
            {isTopChannelsEmpty ? 'POPULAR CHANNELS' : 'TOP SUBSCRIPTIONS'}
          </div>
          {channels?.map(channel => (
            <Link
              key={channel.id}
              to={`/channels/${channel.id}`}
              className={classes.link}
              onClick={onClose}
              onMouseEnter={() => setHoveredLink(channel.name)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <div className={classes.info}>
                <img
                  src={channel?.visual_url || defaultVisual}
                  alt="User"
                  className={classes.image}
                />
                <span className={classes.name}>{channel.name}</span>
              </div>
            </Link>
          ))}
          <Link
            to={
              isTopChannelsEmpty ? '/channels' : `users/${userId}/subscriptions`
            }
            className={classes['see-more-link']}
          >
            See more
          </Link>
          <hr className={classes.line} />
          <div className={classes.header}>
            {isTopUsersEmpty ? 'ACTIVE USERS' : 'RECENT INTERACTIONS'}
          </div>
          {users?.map(user => (
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
                  src={user?.avatar_url || defaultAvatar}
                  alt="User"
                  className={classes.image}
                />
                <span className={classes.name}>{user.username}</span>
              </div>
            </Link>
          ))}
          <Link
            to={isTopUsersEmpty ? '/users' : `users/${userId}/following`}
            className={classes['see-more-link']}
          >
            See more
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
