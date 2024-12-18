import { useCallback, useEffect, useState } from 'react'

import { API_URL } from '../../../constants/constants'
import Comment from './Comment'
import classes from './Comments.module.css'

const Comments = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [replies, setReplies] = useState({})

  const fetchComments = useCallback(async page => {
    setLoading(true)
    try {
      const path = window.location.pathname
      const response = await fetch(`${API_URL}${path}/comments?page=${page}`)
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
  }, [])

  const fetchReplies = async (parentId, page) => {
    try {
      const path = window.location.pathname
      const response = await fetch(
        `${API_URL}${path}/comments/${parentId}/replies?page=${page}`
      )
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
    }
    const data = await fetchReplies(parentId, currentReplies.page)

    if (data) {
      setReplies(prevReplies => ({
        ...prevReplies,
        [parentId]: {
          data: [...currentReplies.data, ...data.replies],
          remaining: data.remaining_replies,
          page: currentReplies.page + 1,
        },
      }))
    }
  }

  useEffect(() => {
    fetchComments(page)
  }, [fetchComments, page])

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1)
  }

  return (
    <div className={classes.commentsSection}>
      {comments.map(comment => (
        <div key={comment.id}>
          <Comment
            user={comment.user}
            message={comment.message}
            reply={false}
          />

          {/* Render replies */}
          {replies[comment.id]?.data.map(reply => (
            <Comment
              key={reply.id}
              user={reply.user}
              message={reply.message}
              reply={true}
            />
          ))}

          {/* View More Replies button */}
          {comment.replies_count > 0 &&
            (replies[comment.id]?.remaining > 0 || !replies[comment.id]) && (
              <button
                onClick={() => handleLoadMoreReplies(comment.id)}
                className={classes.loadMoreReplies}
              >
                View{' '}
                {Math.min(
                  replies[comment.id]?.remaining || comment.replies_count,
                  10
                )}{' '}
                more replies
              </button>
            )}
        </div>
      ))}
      {hasMore && !loading && (
        <button onClick={handleLoadMore} className={classes.loadMore}>
          Load more comments
        </button>
      )}
      {loading && <p>Loading...</p>}
    </div>
  )
}

export default Comments
