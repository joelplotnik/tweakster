import { useEffect, useState } from 'react'
import { RiSubtractLine } from 'react-icons/ri'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useDispatch } from 'react-redux'
import { useRouteLoaderData } from 'react-router-dom'

import { API_URL } from '../../../constants/constants'
import { challengePageActions } from '../../../store/challengePage'
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
  const [newCommentIds, setNewCommentIds] = useState([])
  const [newReplyIds, setNewReplyIds] = useState([])
  const dispatch = useDispatch()

  const fetchComments = async page => {
    setLoading(true)
    try {
      let path = `${basePath}/challenges/${challengeId}`
      if (attemptId) path += `/attempts/${attemptId}`
      path += `/comments?page=${page}&exclude=${JSON.stringify(newCommentIds)}`

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
  }

  const fetchReplies = async (parentId, page) => {
    try {
      let path = `${basePath}/challenges/${challengeId}`
      if (attemptId) path += `/attempts/${attemptId}`
      path += `/comments/${parentId}/replies?page=${page}&exclude=${JSON.stringify(
        newReplyIds
      )}`

      const response = await fetch(`${API_URL}${path}`)
      if (!response.ok) throw new Error('Failed to fetch replies')

      return await response.json()
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
        setNewReplyIds(prevIds => [...prevIds, newComment.id])
        setReplies(prevReplies => ({
          ...prevReplies,
          [parentId]: {
            ...(prevReplies[parentId] || {}),
            data: [...(prevReplies[parentId]?.data || []), newComment],
          },
        }))
      } else {
        setNewCommentIds(prevIds => [...prevIds, newComment.id])
        setComments(prevComments => [...prevComments, newComment])
      }
      dispatch(challengePageActions.incrementCommentsCount(1))
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

      // Calculate replies dynamically for totalCountToRemove
      const deletedComment = comments.find(comment => comment.id === commentId)
      const associatedReplies = replies[commentId]?.data || []
      const dynamicRepliesCount = associatedReplies.length
      const totalCountToRemove =
        deletedComment?.replies_count || dynamicRepliesCount + 1

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

      dispatch(challengePageActions.decrementCommentsCount(totalCountToRemove))
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  useEffect(() => {
    fetchComments(page)
  }, [page])

  return (
    <div className={classes['comments-section']}>
      <InfiniteScroll
        dataLength={comments.length}
        next={() => setPage(prevPage => prevPage + 1)}
        hasMore={hasMore}
        loader={<p>Loading...</p>}
      >
        {comments.map(comment => (
          <div key={comment.id}>
            <Comment
              comment={comment}
              reply={false}
              onReplyClick={handleReplyClick}
              onDeleteClick={handleDeleteComment}
              isLoggedIn={isLoggedIn}
            />

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
      </InfiniteScroll>
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
