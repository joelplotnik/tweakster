import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useParams } from 'react-router-dom'

import { API_URL } from '../../../constants/constants'
import Challenge from '../Challenges/Challenge'
import classes from './ChallengesList.module.css'

const ChallengesList = () => {
  const [challenges, setChallenges] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { username, name: gameName } = useParams()
  const isUserPage = !!username && !gameName

  const getEndpoint = page => {
    if (username && !gameName) {
      return `${API_URL}/users/${username}/challenges?page=${page}`
    } else if (gameName && !username) {
      return `${API_URL}/games/${gameName}/challenges?page=${page}`
    }
    throw new Error('Invalid context for fetching challenges')
  }

  const fetchChallenges = async page => {
    try {
      const endpoint = getEndpoint(page)
      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error('Failed to fetch challenges')
      }

      const data = await response.json()
      setChallenges(prev => [...prev, ...data.challenges])
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('Error fetching challenges:', error.message)
    }
  }

  useEffect(() => {
    fetchChallenges(currentPage)
  }, [currentPage])

  const loadMore = () => setCurrentPage(prev => prev + 1)

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
            isUserPage={isUserPage}
          />
        ))}
      </InfiniteScroll>
    </div>
  )
}

export default ChallengesList
