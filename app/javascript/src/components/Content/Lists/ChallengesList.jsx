import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { API_URL } from '../../../constants/constants'
import NoItems from '../../UI/NoItems'
import ListItemSkeleton from '../../UI/Skeletons/ListItemSkeleton'
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

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch challenges:', error.message)
    } finally {
      setLoading(false)
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
        loader={loading && <ListItemSkeleton />}
        endMessage={
          <>
            {challenges.length === 0 ? <NoItems item={'challenge'} /> : <></>}
          </>
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
