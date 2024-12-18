import { useCallback, useEffect, useState } from 'react'
import { RiSubtractLine } from 'react-icons/ri'

import { API_URL } from '../../../constants/constants'
import Comment from './Comment'
import classes from './Comments.module.css'

const Comments = ({ basePath, challengeId, attemptId }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [replies, setReplies] = useState({})

  const fetchComments = useCallback(
    async page => {
      setLoading(true)
      try {
        let path = `${basePath}/challenges/${challengeId}`

        if (attemptId) {
          path += `/attempts/${attemptId}`
        }
        path += `/comments?page=${page}`

        const response = await fetch(`${API_URL}${path}`)
        const data = await response.json()

        if (Array.isArray(data)) {
          setComments(prevComments => [...prevComments, ...data])
          setHasMore(data.length === 10)
        } else {
          console.error('Unexpected response format:', data)
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      } finally {
        setLoading(false)
      }
    },
    [basePath, challengeId, attemptId]
  )

  const fetchReplies = async (parentId, page) => {
    try {
      let path = `${basePath}/challenges/${challengeId}`
      if (attemptId) {
        path += `/attempts/${attemptId}`
      }
      path += `/comments/${parentId}/replies?page=${page}`

      const response = await fetch(`${API_URL}${path}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch replies:', error)
      return null
    }
  }

  const handleLoadMoreReplies = async parentId => {
    const currentReplies = replies[parentId] || {
      data: [],
      remaining: 0,
      page: 1,
      allRepliesLoaded: false,
    }
    const data = await fetchReplies(parentId, currentReplies.page)

    if (data) {
      const allRepliesLoaded = data.remaining_replies === 0
      setReplies(prevReplies => ({
        ...prevReplies,
        [parentId]: {
          data: [...currentReplies.data, ...data.replies],
          remaining: data.remaining_replies,
          page: currentReplies.page + 1,
          allRepliesLoaded,
        },
      }))
    }
  }

  const handleHideReplies = parentId => {
    // Reset replies for the comment to start over
    setReplies(prevReplies => ({
      ...prevReplies,
      [parentId]: undefined,
    }))
  }

  useEffect(() => {
    fetchComments(page)
  }, [fetchComments, page])

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1)
  }

  return (
    <div className={classes['comments-section']}>
      {comments.map(comment => (
        <div key={comment.id}>
          <Comment
            user={comment.user}
            message={comment.message}
            created_at={comment.created_at}
            likesCount={comment.likes_count}
            reply={false}
          />

          {/* Render replies */}
          {replies[comment.id]?.data.map(reply => (
            <Comment
              key={reply.id}
              user={reply.user}
              message={reply.message}
              created_at={reply.created_at}
              likesCount={reply.likes_count}
              reply={true}
            />
          ))}

          {/* View More Replies / Hide Replies button */}
          {comment.replies_count > 0 &&
            (replies[comment.id]?.allRepliesLoaded ? (
              <button
                onClick={() => handleHideReplies(comment.id)}
                className={classes['load-more-replies']}
              >
                <RiSubtractLine className={classes['separator-icon']} />
                Hide replies
              </button>
            ) : (
              <button
                onClick={() => handleLoadMoreReplies(comment.id)}
                className={classes['load-more-replies']}
              >
                <RiSubtractLine className={classes['separator-icon']} />
                View{' '}
                {Math.min(
                  replies[comment.id]?.remaining || comment.replies_count,
                  10
                )}{' '}
                more replies
              </button>
            ))}
        </div>
      ))}
      {hasMore && !loading && (
        <button onClick={handleLoadMore} className={classes['load-more']}>
          Load more comments
        </button>
      )}
      {loading && <p>Loading...</p>}
    </div>
  )
}

export default Comments
