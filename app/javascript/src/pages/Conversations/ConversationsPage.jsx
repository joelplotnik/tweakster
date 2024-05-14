import React, { useEffect, useState } from 'react'

import { API_URL } from '../../constants/constants'
import { ClipLoader } from 'react-spinners'
import ConvoUser from '../../components/Content/ConvoUser'
import { Error } from '../../components/Content/Error'
import InfiniteScroll from 'react-infinite-scroll-component'
import classes from './ConversationsPage.module.css'
import { useRouteLoaderData } from 'react-router-dom'

const ConversationsPage = () => {
  const token = useRouteLoaderData('root')
  const [users, setUsers] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchConversations = async (currentPage) => {
    try {
      const response = await fetch(
        `${API_URL}/conversations?page=${currentPage}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error: ', error)
      setError('Failed to fetch conversations')
    }
  }

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true)

      const conversationsFromServer = await fetchConversations(page)

      if (conversationsFromServer) {
        setUsers([...users, ...conversationsFromServer])
        if (conversationsFromServer.length === 0) {
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
    <div className={classes.container}>
      <h1 className={classes.heading}>Messages</h1>
      <hr className={classes.divider} />
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
        {users.map((user) => (
          <ConvoUser key={user.id} user={user} />
        ))}
      </InfiniteScroll>
    </div>
  )
}

export default ConversationsPage
