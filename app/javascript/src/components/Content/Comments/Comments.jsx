import { useCallback, useEffect, useState } from 'react'
import { RiSubtractLine } from 'react-icons/ri'
import { useRouteLoaderData } from 'react-router-dom'

import { API_URL } from '../../../constants/constants'
import CommentForm from '../Forms/CommentForm'
import Comment from './Comment'
import classes from './Comments.module.css'

const Comments = ({ basePath, challengeId, attemptId }) => {
  const token = useRouteLoaderData('root')
  const isLoggedIn = !!token
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [replies, setReplies] = useState({})
  const [replyingTo, setReplyingTo] = useState(null)

  const fetchComments = useCallback(
    async page => {
      setLoading(true)
      try {
        let path = `${basePath}/challenges/${challengeId}`
        if (attemptId) path += `/attempts/${attemptId}`
        path += `/comments?page=${page}`

        const response = await fetch(`${API_URL}${path}`)
        if (!response.ok) throw new Error('Failed to fetch comments')

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

  const fetchReplies = useCallback(
    async (parentId, page) => {
      try {
        let path = `${basePath}/challenges/${challengeId}`
        if (attemptId) path += `/attempts/${attemptId}`
        path += `/comments/${parentId}/replies?page=${page}`

        const response = await fetch(`${API_URL}${path}`)
        if (!response.ok) throw new Error('Failed to fetch replies')

        const data = await response.json()
        return data
      } catch (error) {
        console.error('Failed to fetch replies:', error)
        return null
      }
    },
    [basePath, challengeId, attemptId]
  )

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
    setReplies(prevReplies => ({
      ...prevReplies,
      [parentId]: undefined,
    }))
  }

  const handleReplyClick = comment => {
    setReplyingTo(comment)
  }

  const handleInputChange = text => {
    if (replyingTo && !text.startsWith(`@${replyingTo.user.username} `)) {
      setReplyingTo(null)
    }
  }

  const handleSubmitComment = async commentText => {
    try {
      let path = `${basePath}/challenges/${challengeId}`
      if (attemptId) path += `/attempts/${attemptId}`
      path += '/comments'

      const commentableType = attemptId ? 'Attempt' : 'Challenge'
      const parentId = replyingTo?.parent_id || replyingTo?.id || null

      const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: {
            message: commentText,
            commentable_type: commentableType,
            commentable_id: attemptId || challengeId,
            parent_id: parentId,
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to post comment')

      const newComment = await response.json()
      if (parentId) {
        setReplies(prevReplies => ({
          ...prevReplies,
          [parentId]: {
            ...(prevReplies[parentId] || {}),
            data: [...(prevReplies[parentId]?.data || []), newComment],
          },
        }))
      } else {
        setComments(prevComments => [...prevComments, newComment])
      }
      setReplyingTo(null)
    } catch (error) {
      console.error('Failed to post comment:', error)
    }
  }

  const handleDeleteComment = async commentId => {
    try {
      let path = `${basePath}/challenges/${challengeId}`
      if (attemptId) path += `/attempts/${attemptId}`
      path += `/comments/${commentId}`

      const response = await fetch(`${API_URL}${path}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      setComments(prevComments =>
        prevComments.filter(comment => comment.id !== commentId)
      )

      setReplies(prevReplies => {
        const newReplies = { ...prevReplies }
        Object.keys(newReplies).forEach(parentId => {
          newReplies[parentId].data = newReplies[parentId].data.filter(
            reply => reply.id !== commentId
          )
        })
        return newReplies
      })
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
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
            comment={comment}
            reply={false}
            onReplyClick={handleReplyClick}
            onDeleteClick={handleDeleteComment}
            isLoggedIn={isLoggedIn}
          />

          {/* Render replies */}
          {replies[comment.id]?.data.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              reply={true}
              onReplyClick={handleReplyClick}
              onDeleteClick={handleDeleteComment}
              isLoggedIn={isLoggedIn}
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
      <div className={classes['comment-form-container']}>
        <CommentForm
          onSubmit={handleSubmitComment}
          replyingTo={replyingTo}
          onTextChange={handleInputChange}
        />
      </div>
    </div>
  )
}

export default Comments
