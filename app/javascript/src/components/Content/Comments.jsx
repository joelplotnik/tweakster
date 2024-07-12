import React, { useCallback, useEffect, useRef, useState } from 'react'
import { RiAddFill } from 'react-icons/ri'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useDispatch } from 'react-redux'
import { useParams, useRouteLoaderData } from 'react-router-dom'
import { toast } from 'react-toastify'

import { API_URL } from '../../constants/constants'
import { pieceActions } from '../../store/piece'
import AuthModal from '../UI/Modals/AuthModal'
import SortDropdown from '../UI/SortDropdown'
import Comment from './Comment'
import classes from './Comments.module.css'
import CommentForm from './Forms/CommentForm'

const Comments = ({ piece, pieceClassModalRef }) => {
  const token = useRouteLoaderData('root')
  const [comments, setComments] = useState([])
  const params = useParams()
  const wildcardParam = params['*']
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeComment, setActiveComment] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [newCommentIds, setNewCommentIds] = useState([])
  const [selectedSortOption, setSelectedSortOption] = useState('top')
  const selectedSortOptionRef = useRef(selectedSortOption)
  const [isScrollableTargetAvailable, setScrollableTargetAvailable] =
    useState(false)
  const dispatch = useDispatch()
  const newCommentRef = useRef(null)

  useEffect(() => {
    if (pieceClassModalRef?.current || pieceClassModalRef === 'page') {
      setScrollableTargetAvailable(true)
    }
  }, [pieceClassModalRef])

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal)
  }

  const handleSortChange = useCallback(option => {
    if (option === selectedSortOptionRef.current) {
      return
    }

    setNewCommentIds([])
    setComments([])
    setSelectedSortOption(option)
    setPage(1)
    setHasMore(true)
  }, [])

  const fetchComments = async currentPage => {
    try {
      const response = await fetch(
        `${API_URL}/channels/${piece.channel_id}/pieces/${
          piece.id
        }/comments?page=${currentPage}&sort=${selectedSortOption}&exclude=${JSON.stringify(
          newCommentIds
        )}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error fetching comments')
    }
  }

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true)

      const commentsFromServer = await fetchComments(page)

      if (commentsFromServer) {
        setComments([...comments, ...commentsFromServer])

        if (selectedSortOption !== selectedSortOptionRef.current) {
          // If the selectedSortOption has changed, reset comments
          selectedSortOptionRef.current = selectedSortOption
          setComments(commentsFromServer)
        } else {
          // If the sort option is the same, append fetched data
          setComments([...comments, ...commentsFromServer])
        }

        if (commentsFromServer.length === 0) {
          setHasMore(false)
        }
        setPage(page + 1)
      }

      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const findCommentById = (commentsArray, targetCommentId) => {
    for (const comment of commentsArray) {
      if (comment.comment.id === targetCommentId) {
        return comment
      } else if (comment.child_comments && comment.child_comments.length > 0) {
        const foundComment = findCommentById(
          comment.child_comments,
          targetCommentId
        )
        if (foundComment) {
          return foundComment
        }
      }
    }
    return null
  }

  const updateCommentMessage = (commentsArray, targetCommentId, newMessage) => {
    return commentsArray.map(comment => {
      if (comment.comment.id === targetCommentId) {
        // If this is the edited comment, update its message
        return {
          ...comment,
          comment: {
            ...comment.comment,
            message: newMessage,
          },
        }
      } else if (comment.child_comments && comment.child_comments.length > 0) {
        // If there are child comments, recursively update them as well
        return {
          ...comment,
          child_comments: updateCommentMessage(
            comment.child_comments,
            targetCommentId,
            newMessage
          ),
        }
      } else {
        return comment
      }
    })
  }

  const handleCommentSubmit = async (
    message,
    pieceId,
    parentCommentId = null,
    commentId = null
  ) => {
    try {
      const url = commentId
        ? `${API_URL}/${wildcardParam}/comments/${commentId}`
        : `${API_URL}/${wildcardParam}/comments`

      const method = commentId ? 'PUT' : 'POST'

      const commentData = {
        message: message,
        piece_id: pieceId,
        parent_comment_id: parentCommentId,
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit comment')
      }

      const newComment = await response.json()
      const newCommentId = newComment.comment.id

      // Handle the state update based on the comment action
      if (commentId) {
        // Edit comment
        setComments(prevComments => {
          return updateCommentMessage(prevComments, commentId, message)
        })
      } else if (parentCommentId) {
        // Reply comment
        const parentComment = findCommentById(comments, parentCommentId)
        if (parentComment) {
          parentComment.child_comments.push(newComment)
          setNewCommentIds(prevIds => [...prevIds, newCommentId])
          setComments(prevComments => [...prevComments])
          newCommentRef.current = newCommentId
          dispatch(pieceActions.increaseCommentCount())
        }
      } else {
        // New comment
        setNewCommentIds(prevIds => [...prevIds, newCommentId])
        setComments(prevComments => [newComment, ...prevComments])
        newCommentRef.current = newCommentId
        dispatch(pieceActions.increaseCommentCount())
      }

      setActiveComment(null)
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error submitting comment')
    }
  }

  const deleteComment = (commentsArray, targetCommentId) => {
    return commentsArray.filter(comment => {
      if (comment.comment.id === targetCommentId) {
        return false
      } else if (comment.child_comments && comment.child_comments.length > 0) {
        comment.child_comments = deleteComment(
          comment.child_comments,
          targetCommentId
        )
        return true
      } else {
        return !comment.deleted // Filter out deleted comments
      }
    })
  }

  const markCommentAsDeleted = (commentsArray, targetCommentId) => {
    return commentsArray.map(comment => {
      if (comment.comment.id === targetCommentId) {
        // Mark the comment as deleted
        return {
          ...comment,
          deleted: true,
        }
      } else if (comment.child_comments && comment.child_comments.length > 0) {
        // If there are child comments, recursively mark them as well
        return {
          ...comment,
          child_comments: markCommentAsDeleted(
            comment.child_comments,
            targetCommentId
          ),
        }
      } else {
        return comment
      }
    })
  }

  const countComments = comment => {
    let count = 1
    if (comment.child_comments) {
      for (const childComment of comment.child_comments) {
        count += countComments(childComment)
      }
    }
    return count
  }

  const handleDeleteComment = async commentId => {
    try {
      const response = await fetch(
        `${API_URL}/${wildcardParam}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }

      setActiveComment(null)

      // Find the deleted comment and its children in the state
      const commentToDelete = findCommentById(comments, commentId)

      if (!commentToDelete) {
        return // Comment not found, nothing to delete
      }

      const decreaseCommentCountBy = countComments(commentToDelete)
      dispatch(pieceActions.decreaseCommentCount({ decreaseCommentCountBy }))

      setComments(prevComments => {
        return deleteComment(
          markCommentAsDeleted(prevComments, commentId),
          commentId
        )
      })

      if (newCommentIds.includes(commentId)) {
        setNewCommentIds(prevIds => prevIds.filter(id => id !== commentId))
      }
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error deleting comment')
    }
  }

  useEffect(() => {
    if (newCommentRef.current) {
      const newCommentElement = document.getElementById(newCommentRef.current)

      if (newCommentElement) {
        if (pieceClassModalRef === 'page') {
          const topOffset = 48
          const elementPosition = newCommentElement.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - topOffset

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
        } else {
          newCommentElement.scrollIntoView({ behavior: 'smooth' })
        }
      }
      newCommentRef.current = null
    }
  }, [comments, pieceClassModalRef])

  return (
    <>
      <div className={classes.comments}>
        {token ? (
          <CommentForm
            onSubmit={(message, parentCommentId = null, commentId = null) =>
              handleCommentSubmit(message, piece.id, parentCommentId, commentId)
            }
            showCancel={false}
          />
        ) : (
          <button
            className={classes['comment-button']}
            onClick={handleAuthModalToggle}
          >
            <RiAddFill />
            Comment
          </button>
        )}
        {comments.length > 0 && (
          <SortDropdown
            onSortChange={handleSortChange}
            selectedSortOption={selectedSortOption}
          />
        )}
        {isScrollableTargetAvailable && (
          <InfiniteScroll
            key={selectedSortOption}
            dataLength={comments.length}
            next={fetchData}
            hasMore={hasMore}
            scrollableTarget={pieceClassModalRef?.current}
            loader={<h4>Loading...</h4>}
            endMessage={<span></span>}
          >
            {comments
              .filter(comment => !comment.parent_comment_id)
              .map(comment => (
                <div
                  key={comment.comment.id}
                  id={
                    comment.comment.id === newCommentRef.current
                      ? newCommentRef.current
                      : undefined
                  }
                >
                  <Comment
                    comment={comment.comment}
                    piece={piece}
                    childComments={comment.child_comments}
                    onReply={(message, parentCommentId) =>
                      handleCommentSubmit(
                        message,
                        piece.id,
                        parentCommentId,
                        null
                      )
                    }
                    onEdit={(message, parentCommentId, commentId) =>
                      handleCommentSubmit(
                        message,
                        piece.id,
                        parentCommentId,
                        commentId
                      )
                    }
                    onDelete={commentId => handleDeleteComment(commentId)}
                    activeComment={activeComment}
                    setActiveComment={setActiveComment}
                    newCommentRef={newCommentRef}
                  />
                </div>
              ))}
          </InfiniteScroll>
        )}
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
    </>
  )
}

export default Comments
