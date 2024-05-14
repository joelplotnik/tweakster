import React, { useEffect, useState } from 'react'

import { API_URL } from '../../constants/constants'
import Channel from '../../components/Content/Channel'
import { ClipLoader } from 'react-spinners'
import { Error } from '../../components/Content/Error'
import InfiniteScroll from 'react-infinite-scroll-component'
import classes from './ChannelsPage.module.css'

const ChannelsPage = () => {
  const [channels, setChannels] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchChannels = async (currentPage) => {
    try {
      const response = await fetch(`${API_URL}/channels?page=${currentPage}`)

      if (!response.ok) {
        throw new Error('Failed to fetch channels')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error: ', error.message)
      setError('Failed to fetch channels')
    }
  }

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true)

      const channelsFromServer = await fetchChannels(page)

      if (channelsFromServer) {
        setChannels([...channels, ...channelsFromServer])
        if (channelsFromServer.length === 0) {
          setHasMore(false)
        }
        setPage(page + 1)
      }

      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return <Error message={`Error: ${error}`} />
  }

  return (
    <InfiniteScroll
      dataLength={channels.length}
      next={fetchData}
      hasMore={hasMore}
      loader={
        hasMore &&
        isLoading && (
          <div className={classes.loader}>
            <ClipLoader color="#cccccc" loading={isLoading} size={30} />
          </div>
        )
      }
      endMessage={<></>}
    >
      <div className={classes['channel-list']}>
        {channels.map((channel) => (
          <Channel key={`${channel.id}`} channel={channel} />
        ))}
      </div>
    </InfiniteScroll>
  )
}

export default ChannelsPage
