import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useRouteLoaderData } from 'react-router-dom'

import { API_URL } from '../../constants/constants'
import { ClipLoader } from 'react-spinners'
import Entity from '../../components/Content/Entity'
import { Error } from '../../components/Content/Error'
import InfiniteScroll from 'react-infinite-scroll-component'
import TopFive from '../../components/Content/TopFive'
import classes from './FollowingPage.module.css'
import { userPageActions } from '../../store/user-page'

const FollowingPage = () => {
  const user = useSelector((state) => state.userPage.user)
  const dispatch = useDispatch()
  const favoriteUsers = user.favorite_users
  const [following, setFollowing] = useState([])
  const { id } = useParams()
  const token = useRouteLoaderData('root')
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchFollowing = async (currentPage) => {
    try {
      const response = await fetch(
        `${API_URL}/users/${id}/following/?page=${currentPage}`,
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

      const followingFromServer = await fetchFollowing(page)

      if (followingFromServer) {
        setFollowing([...following, ...followingFromServer])
        if (followingFromServer.length === 0) {
          setHasMore(false)
        }
        setPage(page + 1)
      }

      setIsLoading(false)
    }
  }

  const updateFavoriteUsers = async (updatedFavoriteUserIds) => {
    try {
      const response = await fetch(
        `${API_URL}/users/${id}/update_favorite_users`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            favorite_users: updatedFavoriteUserIds,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update favorite users')
      }

      const data = await response.json()

      dispatch(userPageActions.updateFaveUsers(data.favorite_users))
    } catch (error) {
      console.error('Error: ', error.message)
      setError(error.message)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTopFiveClick = (user) => {
    const isUserInFavorites = favoriteUsers.some(
      (favUser) => favUser.id === user.id
    )

    let updatedFavoriteUserIds = [...favoriteUsers].map((favUser) => favUser.id)

    if (isUserInFavorites) {
      updatedFavoriteUserIds = updatedFavoriteUserIds.filter(
        (id) => id !== user.id
      )
    } else {
      if (favoriteUsers.length < 5) {
        updatedFavoriteUserIds.push(user.id)
      } else {
        return
      }
    }

    if (
      JSON.stringify(updatedFavoriteUserIds) !==
      JSON.stringify(favoriteUsers.map((user) => user.id))
    ) {
      updateFavoriteUsers(updatedFavoriteUserIds)
    }
  }

  if (error) {
    return <Error message={`Error: ${error}`} />
  }

  return (
    <div className={classes.container}>
      <h1 className={classes.heading}>Following</h1>
      <hr className={classes.divider} />
      <TopFive entityType={'user'} favorites={favoriteUsers} />
      <p className={classes.note}>Add a user to your Top 5</p>
      <InfiniteScroll
        dataLength={following.length}
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
          {following.map((user) => (
            <Entity
              key={user.id}
              entityType={'user'}
              item={user}
              isFavorite={favoriteUsers.some(
                (favUser) => favUser.id === user.id
              )}
              favoriteCount={favoriteUsers.length}
              onTopFiveClick={handleTopFiveClick}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  )
}

export default FollowingPage
