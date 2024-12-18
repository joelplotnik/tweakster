import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useParams } from 'react-router-dom'

import { API_URL } from '../../../constants/constants'
import Attempt from '../Attempts/Attempt'
import classes from './AttemptsList.module.css'

const AttemptsList = () => {
  const [attempts, setAttempts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { username, name: gameName, id: challengeId } = useParams()
  const isUserPage = !!username && !challengeId && !gameName

  const getEndpoint = page => {
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
    try {
      const endpoint = getEndpoint(page)
      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error('Failed to fetch attempts')
      }

      const data = await response.json()
      setAttempts(prev => [...prev, ...data.attempts])
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('Error fetching attempts:', error.message)
    }
  }

  useEffect(() => {
    setAttempts([])
    setCurrentPage(1)
    fetchAttempts(1)
  }, [username, gameName])

  const loadMore = () => setCurrentPage(prev => prev + 1)

  return (
    <div className={classes['attempts-list']}>
      <InfiniteScroll
        dataLength={attempts.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className={classes.loading}>Loading more...</div>}
        endMessage={
          <p className={classes['end-message']}>No more attempts to show</p>
        }
      >
        {attempts.map(attempt => (
          <Attempt key={attempt.id} attempt={attempt} isUserPage={isUserPage} />
        ))}
      </InfiniteScroll>
    </div>
  )
}

export default AttemptsList
