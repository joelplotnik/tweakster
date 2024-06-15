import { Link, json, useParams, useRouteLoaderData } from 'react-router-dom'
import {
  RiAddLine,
  RiFlagLine,
  RiMoreFill,
  RiSettings3Line,
} from 'react-icons/ri'
import { getAuthToken, getUserData } from '../../util/auth'
import { piecesActions, selectAllPieces } from '../../store/pieces'
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'

import { API_URL } from '../../constants/constants'
import { AuthModal } from '../../components/UI/Modals/AuthModal'
import Card from '../../components/UI/Card'
import { Error } from '../../components/Content/Error'
import FollowButton from '../../components/UI/Buttons/FollowButton'
import InfiniteScroll from 'react-infinite-scroll-component'
import NoPieces from '../../components/Content/NoPieces'
import Piece from '../../components/Content/Piece'
import PieceSkeleton from '../../components/Content/Skeletons/PieceSkeleton'
import ProfileSkeleton from '../../components/Content/Skeletons/ProfileSkeleton'
import ReportModal from '../../components/UI/Modals/ReportModal'
import classes from './UserPage.module.css'
import defaultAvatar from '../../assets/default-avatar.png'
import defaultVisual from '../../assets/default-visual.png'
import { fetchUserPieces } from '../../store/pieces-actions'
import store from '../../store'
import { throttle } from 'lodash'
import { userPageActions } from '../../store/user-page'

const UserPage = () => {
  const { id } = useParams()
  const token = useRouteLoaderData('root')
  const { userId } = getUserData() || {}
  const user = useSelector((state) => state.userPage.user)
  const dispatch = useDispatch()
  const pieces = useSelector(selectAllPieces)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUserLoading, setIsUserLoading] = useState(false)
  const throttledFetchData = throttle(() => fetchData(), 500)

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true)

      try {
        const response = await dispatch(fetchUserPieces({ userId: id, page }))

        if (response) {
          if (response.hasMore) {
            setPage(page + 1)
          } else {
            setHasMore(false)
          }
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isUserLoading) {
        setIsUserLoading(true)
        try {
          const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error('Could not find user')
          }

          const userData = await response.json()
          dispatch(userPageActions.setUser(userData))
        } catch (error) {
          console.error('Error fetching user data:', error)
          setError(error.message)
        } finally {
          setIsUserLoading(false)
        }
      }
    }

    !user && fetchUserData()
    dispatch(piecesActions.resetPieces())
    throttledFetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMoreData = () => {
    if (!isLoading && hasMore) {
      throttledFetchData()
    }
  }

  const handleDropdownToggle = (event) => {
    event.stopPropagation()
    setShowDropdown(!showDropdown)
  }

  const handleReportClick = () => {
    if (!token) {
      setShowDropdown(false)
      setShowAuthModal(true)
    } else {
      setShowDropdown(false)
      setShowReportModal(true)
    }
  }

  const handleReportModalToggle = () => {
    setShowReportModal(!showReportModal)
  }

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal)
  }

  const formatNumber = (number) => {
    if (number < 10000) {
      return number.toLocaleString() // No formatting for numbers less than 10,000
    } else if (number < 100000) {
      return (number / 1000).toFixed(1) + 'k' // Format as X.Xk for 10,000 to 99,999
    } else if (number < 1000000) {
      return (number / 1000).toFixed(0) + 'k' // Format as Xk for 100,000 to 999,999
    } else if (number < 1000000000) {
      return (number / 1000000).toFixed(1) + 'm' // Format as X.Xm for millions
    } else {
      return (number / 1000000000).toFixed(1) + 'b' // Format as X.Xb for billions
    }
  }

  if (error) {
    return <Error message={`Error: ${error}`} />
  }

  return (
    <>
      <div className={classes['container']}>
        <div className={classes['pieces-container']}>
          <InfiniteScroll
            dataLength={pieces.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={isLoading && <PieceSkeleton />}
            endMessage={
              <>
                {pieces.length === 0 ? (
                  <NoPieces
                    listPage={'user'}
                    owner={user?.can_edit && id === userId}
                  />
                ) : (
                  <></>
                )}
              </>
            }
          >
            <div className={classes.pieces}>
              {pieces.map((piece) => (
                <Piece key={`${piece.id}`} piece={piece} />
              ))}
            </div>
          </InfiniteScroll>
        </div>
        {isUserLoading ? (
          <ProfileSkeleton />
        ) : (
          <Card className={classes.card}>
            <div className={classes['card-content']}>
              <div className={classes['photo-container']}>
                <img
                  className={classes.photo}
                  src={user?.avatar_url || defaultAvatar}
                  alt="User"
                />
              </div>
              {token && user?.can_edit ? (
                <Link to={'edit'} className={classes['edit-button']}>
                  <RiSettings3Line />
                </Link>
              ) : (
                <>
                  <div
                    className={`${classes['more-button']}`}
                    onClick={handleDropdownToggle}
                  >
                    <RiMoreFill />
                  </div>
                  {showDropdown && (
                    <div className={classes.dropdown}>
                      <>
                        <button onClick={handleReportClick}>
                          <RiFlagLine className={classes.danger} />
                          <span className={classes.danger}>Report</span>
                        </button>
                      </>
                    </div>
                  )}
                </>
              )}
              <p className={classes.username}>{user?.username}</p>
              <hr className={classes.divider} />
              <div className={classes.stats}>
                <div className={classes['stats-item']}>
                  <p>Pieces:</p>
                  <p className={classes['stats-number']}>
                    {formatNumber(user?.piece_count)}
                  </p>
                </div>
                <div className={classes['stats-item']}>
                  <p>Followers:</p>
                  <p className={classes['stats-number']}>
                    {formatNumber(user?.follower_count)}
                  </p>
                </div>
                <div className={classes['stats-item']}>
                  <p>Appeal:</p>
                  <p className={classes['stats-number']}>
                    {Math.round(user?.integrity)}%
                  </p>
                </div>
              </div>
            </div>
            {token && userId !== id && (
              <div className={classes['button-container']}>
                <FollowButton
                  userId={user?.id}
                  isFollowing={user?.following}
                  followerCount={user?.follower_count}
                />
              </div>
            )}
            <div className={classes['user-details']}>
              {user?.url && (
                <div className={classes.detail}>
                  <p className={classes['detail-title']}>Website</p>
                  <a
                    className={classes['user-url']}
                    href={user?.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {user?.url}
                  </a>
                </div>
              )}
              {user?.bio && (
                <div className={classes.detail}>
                  <p className={classes['detail-title']}>Bio</p>
                  <p className={classes['detail-data']}>{user?.bio}</p>
                </div>
              )}
              {(user?.favorite_channels &&
                user?.favorite_channels.length > 0) ||
              (user?.followees && user?.followees.length > 0) ? (
                <hr className={classes.divider} />
              ) : null}
              {(user?.can_edit ||
                (user?.favorite_channels &&
                  user?.favorite_channels.length > 0)) && (
                <div className={classes['personal-detail']}>
                  <div className={classes['personal-detail-container']}>
                    <p className={classes['detail-title']}>Subscriptions</p>
                    {user?.can_edit && (
                      <Link
                        to="subscriptions"
                        className={classes['view-all-link']}
                      >
                        View all/ Edit
                      </Link>
                    )}
                  </div>
                  <div className={classes['images-row']}>
                    {user?.can_edit && user?.favorite_channels.length === 0 && (
                      <Link to={'subscriptions'}>
                        <div className={classes['placeholder-circle']}>
                          <RiAddLine className={classes['add-icon']} />
                        </div>
                      </Link>
                    )}
                    {user?.favorite_channels.map((favorite_channel) => (
                      <div
                        key={favorite_channel.id}
                        className={classes['image-wrapper']}
                      >
                        <Link to={`/channels/${favorite_channel.id}`}>
                          <img
                            src={favorite_channel?.visual_url || defaultVisual}
                            alt="Channel Visual"
                            className={classes.image}
                          />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(user?.can_edit ||
                (user?.favorite_users && user?.favorite_users.length > 0)) && (
                <div className={classes['personal-detail']}>
                  <div className={classes['personal-detail-container']}>
                    <p className={classes['detail-title']}>Following</p>
                    {user?.can_edit && (
                      <Link to="following" className={classes['view-all-link']}>
                        View all/ Edit
                      </Link>
                    )}
                  </div>
                  <div className={classes['images-row']}>
                    {user?.can_edit && user?.favorite_users.length === 0 && (
                      <Link to={'following'}>
                        <div className={classes['placeholder-circle']}>
                          <RiAddLine className={classes['add-icon']} />
                        </div>
                      </Link>
                    )}
                    {user?.favorite_users.map((favorite_user) => (
                      <div
                        key={favorite_user.id}
                        className={classes['image-wrapper']}
                      >
                        <Link to={`/users/${favorite_user.id}`}>
                          <img
                            src={favorite_user?.avatar_url || defaultAvatar}
                            alt="Followee Avatar"
                            className={classes.image}
                          />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
      {showReportModal && (
        <ReportModal
          onClick={handleReportModalToggle}
          content={{ type: 'user', id: user.id }}
        />
      )}
    </>
  )
}

export default UserPage

export async function loader({ params }) {
  const { id } = params
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw json({ message: 'Could not find user' }, { status: 500 })
  }

  const data = await response.json()

  store.dispatch(userPageActions.setUser(data))

  return data
}
