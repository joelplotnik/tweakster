import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { API_URL } from '../../../constants/constants'
import NoItems from '../../UI/NoItems'
import ListItemSkeleton from '../../UI/Skeletons/ListItemSkeleton'
import Attempt from '../Attempts/Attempt'
import classes from './AttemptsList.module.css'

const AttemptsList = ({ isPendingAttemptsPage }) => {
  const token = useSelector(state => state.token.token)
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const { username, name: gameName, challengeId: challengeId } = useParams()

  const getEndpoint = page => {
    if (isPendingAttemptsPage && username) {
      return `${API_URL}/users/${username}/pending_attempts?page=${page}`
    }
    if (username && !challengeId && !gameName) {
      return `${API_URL}/users/${username}/attempts?page=${page}`
    }
    if (username && challengeId && !gameName) {
      return `${API_URL}/users/${username}/challenges/${challengeId}/attempts?page=${page}`
    }
    if (gameName && challengeId && !username) {
      return `${API_URL}/games/${gameName}/challenges/${challengeId}/attempts?page=${page}`
    }
    throw new Error('Invalid context for fetching attempts')
  }

  const fetchAttempts = async page => {
    setLoading(true)
    try {
      const endpoint = getEndpoint(page)

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch attempts')
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setAttempts(prevAttempts => [...prevAttempts, ...data])
        setHasMore(data.length === 10)
      } else {
        console.error('Unexpected response format:', data)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch attempts:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttempts(page)
  }, [page])

  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  return (
    <div className={classes['attempts-list']}>
      <InfiniteScroll
        dataLength={attempts.length}
        next={loadMore}
        hasMore={hasMore}
        loader={loading && <ListItemSkeleton />}
        endMessage={
          <>{attempts.length === 0 ? <NoItems item={'attempt'} /> : <></>}</>
        }
      >
        {attempts.map(attempt => (
          <Attempt key={attempt.id} attempt={attempt} />
        ))}
      </InfiniteScroll>
    </div>
  )
}

export default AttemptsList
