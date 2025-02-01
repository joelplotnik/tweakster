import { useEffect, useState } from 'react'
import { RiSubtractLine } from 'react-icons/ri'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useDispatch, useSelector } from 'react-redux'

import { API_URL } from '../../../constants/constants'
import NoComments from '../../UI/NoComments'
import CommentSkeleton from '../../UI/Skeletons/CommentSkeleton'
import CommentForm from '../Forms/CommentForm'
import Comment from './Comment'
import classes from './Comments.module.css'

const Comments = ({
  basePath,
  challengeId,
  attemptId,
  isSlideUpPresent,
  commentsCount,
  setCommentsCount,
}) => {
  const token = useSelector(state => state.token.token)
  const isLoggedIn = !!token
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [replies, setReplies] = useState({})
  const [replyingTo, setReplyingTo] = useState(null)
  const [newCommentIds, setNewCommentIds] = useState([])
  const [newReplyIds, setNewReplyIds] = useState([])
  const [highlightedCommentId, setHighlightedCommentId] = useState(null)
  const [highlightedReplyId, setHighlightedReplyId] = useState(null)
  const dispatch = useDispatch()
  const basePathWithId = `${basePath}/challenges/${challengeId}${
    attemptId ? `/attempts/${attemptId}` : ''
  }`

  console.log(comments)

  const fetchComments = async page => {
    setLoading(true)
    try {
      const path = `${basePathWithId}/comments?page=${page}&exclude=${JSON.stringify(
        newCommentIds
      )}`

      const response = await fetch(`${API_URL}/${path}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch comments')

      const data = await response.json()
      if (Array.isArray(data)) {
        const filteredComments = data.filter(
          comment =>
            !comments.some(existingComment => existingComment.id === comment.id)
        )

        setComments(prevComments => [...prevComments, ...filteredComments])
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
      const path = `${basePathWithId}/comments/${parentId}/replies?page=${page}&exclude=${JSON.stringify(
        newReplyIds
      )}`

      const response = await fetch(`${API_URL}/${path}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
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
    const currentReplies = replies[parentId]?.data || []

    // Count how many replies in `newReplyIds` belong to this parent comment
    const newRepliesCount = currentReplies.filter(reply =>
      newReplyIds.includes(reply.id)
    ).length

    // Update the replies_count of the parent comment
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === parentId
          ? {
              ...comment,
              replies_count: comment.replies_count + newRepliesCount,
            }
          : comment
      )
    )

    // Remove replies from the state and update `newReplyIds`
    setReplies(prevReplies => ({
      ...prevReplies,
      [parentId]: undefined, // Remove replies for this parent comment
    }))

    setNewReplyIds(prevIds =>
      prevIds.filter(id => !currentReplies.some(reply => reply.id === id))
    )
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
      const path = `${basePathWithId}/comments`
      const commentableType = attemptId ? 'Attempt' : 'Challenge'
      const parentId = replyingTo?.parent_id || replyingTo?.id || null

      const response = await fetch(`${API_URL}/${path}`, {
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
        setReplies(prevReplies => {
          const currentReplies = prevReplies[parentId] || {
            data: [],
            remaining: 0,
            page: 1,
            allRepliesLoaded: false,
          }
          return {
            ...prevReplies,
            [parentId]: {
              ...currentReplies,
              data: [...currentReplies.data, newComment],
            },
          }
        })

        setHighlightedReplyId(newComment.id)
      } else {
        setNewCommentIds(prevIds => [...prevIds, newComment.id])
        setComments(prevComments => [newComment, ...prevComments])
        setHighlightedCommentId(newComment.id)
      }

      commentsCount && setCommentsCount(commentsCount + 1)

      setReplyingTo(null)
    } catch (error) {
      console.error('Failed to post comment:', error)
    }
  }

  useEffect(() => {
    if (highlightedCommentId) {
      const newCommentElement = document.getElementById(
        `comment-${highlightedCommentId}`
      )
      if (newCommentElement) {
        newCommentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [highlightedCommentId])

  useEffect(() => {
    if (highlightedReplyId) {
      const newReplyElement = document.getElementById(
        `reply-${highlightedReplyId}`
      )
      if (newReplyElement) {
        newReplyElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [highlightedReplyId])

  const handleDeleteComment = async commentId => {
    try {
      const path = `${basePathWithId}/comments/${commentId}`

      const response = await fetch(`${API_URL}/${path}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      const deletedComment =
        comments.find(comment => comment.id === commentId) ||
        Object.values(replies)
          .flatMap(replyGroup => replyGroup.data)
          .find(reply => reply.id === commentId)

      if (!deletedComment) {
        console.error('Comment not found for deletion.')
        return
      }

      let totalCountToRemove = 1 // Start with 1 for the comment itself

      if (deletedComment.replies_count) {
        totalCountToRemove += deletedComment.replies_count // Add the server-known replies count
      }

      // Include dynamically loaded replies from state
      const dynamicReplies = replies[commentId]?.data || []
      totalCountToRemove += dynamicReplies.length

      if (deletedComment.replies_count || dynamicReplies.length) {
        // If it's a top-level comment, remove its replies from state
        setReplies(prevReplies => {
          const newReplies = { ...prevReplies }
          delete newReplies[commentId]
          return newReplies
        })
      } else if (deletedComment.parent_id) {
        // If it's a reply, decrement the replies_count for the parent
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === deletedComment.parent_id
              ? { ...comment, replies_count: comment.replies_count - 1 }
              : comment
          )
        )
      }

      // Remove the comment from the state
      setComments(prevComments =>
        prevComments.filter(comment => comment.id !== commentId)
      )

      setReplies(prevReplies => {
        const newReplies = { ...prevReplies }
        Object.keys(newReplies).forEach(parentId => {
          if (newReplies[parentId]?.data) {
            newReplies[parentId].data = newReplies[parentId].data.filter(
              reply => reply.id !== commentId
            )
          }
        })
        return newReplies
      })

      commentsCount && setCommentsCount(commentsCount - totalCountToRemove)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  useEffect(() => {
    fetchComments(page)
  }, [page])

  return (
    <div className={classes['comments-section']}>
      <div className={classes.comments}>
        <InfiniteScroll
          dataLength={comments.length}
          next={() => setPage(prevPage => prevPage + 1)}
          hasMore={hasMore}
          loader={loading && <CommentSkeleton />}
          endMessage={<>{comments.length === 0 ? <NoComments /> : <></>}</>}
        >
          {comments.map(comment => (
            <div key={comment.id} id={`comment-${comment.id}`}>
              <Comment
                comment={comment}
                userLiked={comment.user_liked}
                reply={false}
                onReplyClick={handleReplyClick}
                onDeleteClick={handleDeleteComment}
                isLoggedIn={isLoggedIn}
                basePathWithId={basePathWithId}
                isSlideUpPresent={isSlideUpPresent}
              />

              {replies[comment.id]?.data.map(reply => (
                <div key={reply.id} id={`reply-${reply.id}`}>
                  <Comment
                    comment={reply}
                    userLiked={reply.user_liked}
                    reply={true}
                    onReplyClick={handleReplyClick}
                    onDeleteClick={handleDeleteComment}
                    isLoggedIn={isLoggedIn}
                    basePathWithId={basePathWithId}
                    isSlideUpPresent={isSlideUpPresent}
                  />
                </div>
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
      </div>
      <div
        className={
          isSlideUpPresent
            ? classes['comment-form-container-slide-up']
            : classes['comment-form-container']
        }
      >
        <CommentForm
          onSubmit={handleSubmitComment}
          replyingTo={replyingTo}
          onTextChange={handleInputChange}
          isSlideUpPresent={isSlideUpPresent}
        />
      </div>
    </div>
  )
}

export default Comments
