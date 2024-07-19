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
  const [isScrollableTargetAvailable, setIsScrollableTargetAvailable] =
    useState(false)
  const dispatch = useDispatch()
  const newCommentRef = useRef(null)

  useEffect(() => {
    if (pieceClassModalRef?.current || pieceClassModalRef === 'page') {
      setIsScrollableTargetAvailable(true)
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
        if (selectedSortOption !== selectedSortOptionRef.current) {
          // If the selectedSortOption has changed, reset comments
          selectedSortOptionRef.current = selectedSortOption
          setComments(commentsFromServer)
        } else {
          // If the sort option is the same, append fetched data
          setComments(prevComments => [...prevComments, ...commentsFromServer])
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

  const updateCommentMessage = (commentsArray, targetCommentId, newMessage) => {
    return commentsArray.map(comment => {
      if (comment.id === targetCommentId) {
        // If this is the edited comment, update its message
        return {
          ...comment,
          message: newMessage,
        }
      } else {
        return comment
      }
    })
  }

  const handleCommentSubmit = async (message, pieceId, commentId = null) => {
    try {
      const url = commentId
        ? `${API_URL}/${wildcardParam}/comments/${commentId}`
        : `${API_URL}/${wildcardParam}/comments`

      const method = commentId ? 'PUT' : 'POST'

      const commentData = {
        message: message,
        piece_id: pieceId,
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
      const newCommentId = newComment.id

      // Handle the state update based on the comment action
      if (commentId) {
        // Edit comment
        setComments(prevComments => {
          return updateCommentMessage(prevComments, commentId, message)
        })
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
      if (comment.id === targetCommentId) {
        return false
      } else {
        return !comment.deleted // Filter out deleted comments
      }
    })
  }

  const markCommentAsDeleted = (commentsArray, targetCommentId) => {
    return commentsArray.map(comment => {
      if (comment.id === targetCommentId) {
        // Mark the comment as deleted
        return {
          ...comment,
          deleted: true,
        }
      } else {
        return comment
      }
    })
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

      // Find the deleted comment in the state
      const commentToDelete = comments.find(comment => comment.id === commentId)

      if (!commentToDelete) {
        return // Comment not found, nothing to delete
      }

      const decreaseCommentCountBy = 1
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
            {comments.map(comment => (
              <div
                key={comment.id}
                id={
                  comment.id === newCommentRef.current
                    ? newCommentRef.current
                    : undefined
                }
              >
                <Comment
                  comment={comment}
                  piece={piece}
                  onEdit={(message, commentId) =>
                    handleCommentSubmit(message, piece.id, commentId)
                  }
                  onDelete={commentId => handleDeleteComment(commentId)}
                  activeComment={activeComment}
                  setActiveComment={setActiveComment}
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
