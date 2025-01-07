import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { API_URL } from '../../../constants/constants'
import Challenge from '../Challenges/Challenge'
import classes from './ChallengesList.module.css'

const ChallengesList = () => {
  const token = useSelector(state => state.token.token)
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { username, name: gameName } = useParams()
  const isUserContext = !!username && !gameName

  const getEndpoint = page => {
    if (username && !gameName) {
      return `${API_URL}/users/${username}/challenges?page=${page}`
    } else if (gameName && !username) {
      return `${API_URL}/games/${gameName}/challenges?page=${page}`
    }
    throw new Error('Invalid context for fetching challenges')
  }

  const fetchChallenges = async page => {
    setLoading(true)
    try {
      const endpoint = getEndpoint(page)

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch challenges')
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setChallenges(prevChallenges => [...prevChallenges, ...data])
        setHasMore(data.length === 10)
      } else {
        console.error('Unexpected response format:', data)
      }
    } catch (error) {
      console.error('Error fetching challenges:', error.message)
    }
  }

  useEffect(() => {
    fetchChallenges(page)
  }, [page])

  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  return (
    <div className={classes['challenges-list']}>
      <InfiniteScroll
        dataLength={challenges.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className={classes.loading}>Loading more...</div>}
        endMessage={
          <p className={classes['end-message']}>No more challenges to show</p>
        }
      >
        {challenges.map(challenge => (
          <Challenge
            key={challenge.id}
            challenge={challenge}
            isUserContext={isUserContext}
          />
        ))}
      </InfiniteScroll>
    </div>
  )
}

export default ChallengesList
