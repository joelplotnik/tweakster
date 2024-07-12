import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { ClipLoader } from 'react-spinners'

import { Error } from '../../components/Content/Error'
import User from '../../components/Content/User'
import { API_URL } from '../../constants/constants'
import classes from './UsersPage.module.css'

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchUsers = async currentPage => {
    try {
      const response = await fetch(`${API_URL}/users?page=${currentPage}`)

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error: ', error)
      setError('Failed to fetch users')
    }
  }

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true)

      const usersFromServer = await fetchUsers(page)

      if (usersFromServer) {
        setUsers([...users, ...usersFromServer])
        if (usersFromServer.length === 0) {
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
      dataLength={users.length}
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
      <div className={classes['user-list']}>
        {users.map(user => (
          <User key={user.id} user={user} />
        ))}
      </div>
    </InfiniteScroll>
  )
}

export default UsersPage
