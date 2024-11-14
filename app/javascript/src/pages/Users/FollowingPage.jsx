import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useRouteLoaderData } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

import { API_URL } from '../../constants/constants'
import classes from './FollowingPage.module.css'

const FollowingPage = () => {
  const user = useSelector(state => state.userPage.user)
  const [following, setFollowing] = useState([])
  const { id } = useParams()
  const token = useRouteLoaderData('root')
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchFollowing = async currentPage => {
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

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={classes.container}>
      <h1 className={classes.heading}>Following</h1>
      <hr className={classes.divider} />
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
        <div className={classes['user-list']}></div>
      </InfiniteScroll>
    </div>
  )
}

export default FollowingPage
