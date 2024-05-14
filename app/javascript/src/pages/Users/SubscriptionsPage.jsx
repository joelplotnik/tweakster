import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useRouteLoaderData } from 'react-router-dom'

import { API_URL } from '../../constants/constants'
import { ClipLoader } from 'react-spinners'
import Entity from '../../components/Content/Entity'
import { Error } from '../../components/Content/Error'
import InfiniteScroll from 'react-infinite-scroll-component'
import TopFive from '../../components/Content/TopFive'
import classes from './SubscriptionsPage.module.css'
import { userPageActions } from '../../store/user-page'

const SubscriptionsPage = () => {
  const user = useSelector((state) => state.userPage.user)
  const dispatch = useDispatch()
  const favoriteChannels = user.favorite_channels
  const [subscriptions, setSubscriptions] = useState([])
  const { id } = useParams()
  const token = useRouteLoaderData('root')
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchSubscriptions = async (currentPage) => {
    try {
      const response = await fetch(
        `${API_URL}/users/${id}/subscriptions/?page=${currentPage}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error: ', error.message)
      setError(error.message)
    }
  }

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true)

      const subscriptionsFromServer = await fetchSubscriptions(page)

      if (subscriptionsFromServer) {
        setSubscriptions([...subscriptions, ...subscriptionsFromServer])
        if (subscriptionsFromServer.length === 0) {
          setHasMore(false)
        }
        setPage(page + 1)
      }

      setIsLoading(false)
    }
  }

  const updateFavoriteChannels = async (updatedFavoriteChannelIds) => {
    try {
      const response = await fetch(
        `${API_URL}/users/${id}/update_favorite_channels`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            favorite_channels: updatedFavoriteChannelIds,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update favorite channels')
      }

      const data = await response.json()

      dispatch(userPageActions.updateFaveChannels(data.favorite_channels))
    } catch (error) {
      console.error('Error: ', error.message)
      setError(error.message)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTopFiveClick = (channel) => {
    const isChannelInFavorites = favoriteChannels.some(
      (favChannel) => favChannel.id === channel.id
    )

    let updatedFavoriteChannelIds = [...favoriteChannels].map(
      (favChannel) => favChannel.id
    )

    if (isChannelInFavorites) {
      updatedFavoriteChannelIds = updatedFavoriteChannelIds.filter(
        (id) => id !== channel.id
      )
    } else {
      if (favoriteChannels.length < 5) {
        updatedFavoriteChannelIds.push(channel.id)
      } else {
        return
      }
    }

    if (
      JSON.stringify(updatedFavoriteChannelIds) !==
      JSON.stringify(favoriteChannels.map((channel) => channel.id))
    ) {
      updateFavoriteChannels(updatedFavoriteChannelIds)
    }
  }

  if (error) {
    return <Error message={`Error: ${error}`} />
  }

  return (
    <div className={classes.container}>
      <h1 className={classes.heading}>Subscriptions</h1>
      <hr className={classes.divider} />
      <TopFive entityType={'channel'} favorites={favoriteChannels} />
      <p className={classes.note}>Add a subscription to your Top 5</p>
      <InfiniteScroll
        dataLength={subscriptions.length}
        next={fetchData}
        hasMore={hasMore}
        loader={
          hasMore &&
          isLoading && (
            <div className={classes.loader}>
              <ClipLoader color="#ec6152" loading={isLoading} size={30} />
            </div>
          )
        }
        endMessage={<></>}
      >
        <div className={classes['user-list']}>
          {subscriptions.map((channel) => (
            <Entity
              key={channel.id}
              entityType={'channel'}
              item={channel}
              isFavorite={favoriteChannels.some(
                (favChannel) => favChannel.id === channel.id
              )}
              favoriteCount={favoriteChannels.length}
              onTopFiveClick={handleTopFiveClick}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  )
}

export default SubscriptionsPage
