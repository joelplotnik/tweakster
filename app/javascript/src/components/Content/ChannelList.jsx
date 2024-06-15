import { Link, useRouteLoaderData } from 'react-router-dom'
import React, { useEffect, useState } from 'react'

import { API_URL } from '../../constants/constants'
import ChannelListSkeleton from './Skeletons/ChannelListSkeleton'
import { Error } from './Error'
import { RiAddFill } from 'react-icons/ri'
import classes from './ChannelList.module.css'
import defaultVisual from '../../assets/default-visual.png'

const ChannelList = () => {
  const token = useRouteLoaderData('root')
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchChannels()
  }, [])

  const fetchChannels = async () => {
    try {
      const response = await fetch(`${API_URL}/channels/popular`)
      const data = await response.json()
      setChannels(data)
      setLoading(false)
    } catch (error) {
      console.error('Error: ', error.message)
      setError('Failed to fetch channels')
      setLoading(false)
    }
  }

  if (loading) {
    return <ChannelListSkeleton />
  }

  if (error) {
    return <Error message={`Error: ${error}`} />
  }

  return (
    <div className={classes.sidebar}>
      <h4 className={classes['sidebar-title']}>Channels</h4>
      {token && (
        <div className={classes['channel-button-container']}>
          <Link to="/channels/new" className={classes['channel-button']}>
            <RiAddFill className={classes.icon} />
            Create a channel
          </Link>
        </div>
      )}
      <ul className={classes['channel-list']}>
        {channels.map((channel) => (
          <Link key={channel.id} to={`/channels/${channel.id}`}>
            <li className={classes['channel-item']}>
              <div className={classes['channel-info']}>
                <img
                  src={channel?.visual_url || defaultVisual}
                  alt="User"
                  className={classes['channel-visual']}
                />
                <span className={classes['channel-name']}>{channel.name}</span>
              </div>
            </li>
          </Link>
        ))}
      </ul>
      <Link to="/channels" className={classes['see-more-link']}>
        See more
      </Link>
    </div>
  )
}

export default ChannelList
