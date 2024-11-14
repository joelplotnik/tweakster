import { throttle } from 'lodash'
import React, { useEffect, useState } from 'react'
import {
  RiAddLine,
  RiFlagLine,
  RiMoreFill,
  RiSettings3Line,
} from 'react-icons/ri'
import { useDispatch, useSelector } from 'react-redux'
import { Link, json, useParams, useRouteLoaderData } from 'react-router-dom'

import FollowButton from '../../components/UI/Buttons/FollowButton'
import Card from '../../components/UI/Card'
import AuthModal from '../../components/UI/Modals/AuthModal'
import ReportModal from '../../components/UI/Modals/ReportModal'
import ProfileSkeleton from '../../components/UI/Skeletons/ProfileSkeleton'
import { API_URL } from '../../constants/constants'
import store from '../../store'
import { userPageActions } from '../../store/userPage'
import { getAuthToken } from '../../util/auth'
import classes from './UserPage.module.css'

const UserPage = () => {
  const { id } = useParams()
  const token = useRouteLoaderData('root')
  const dispatch = useDispatch()
  const user = useSelector(state => state.userPage.user)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const handleDropdownToggle = event => {
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

  const formatNumber = number => {
    if (number < 10000) {
      return number.toLocaleString()
    } else if (number < 100000) {
      return (number / 1000).toFixed(1) + 'k'
    } else if (number < 1000000) {
      return (number / 1000).toFixed(0) + 'k'
    } else if (number < 1000000000) {
      return (number / 1000000).toFixed(1) + 'm'
    } else {
      return (number / 1000000000).toFixed(1) + 'b'
    }
  }

  return (
    <>
      <div className={classes['container']}>
        <div className={classes['pieces-container']}></div>
        {/* {isUserLoading ? (
          <ProfileSkeleton />
        ) : ( */}
        <Card className={classes.card}>
          <div className={classes['card-content']}>
            <div className={classes['photo-container']}>
              <img
                className={classes.photo}
                src={user?.avatar_url}
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
          {token && user.id !== id && (
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
            {(user?.favorite_channels && user?.favorite_channels.length > 0) ||
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
                  {user?.favorite_channels.map(favorite_channel => (
                    <div
                      key={favorite_channel.id}
                      className={classes['image-wrapper']}
                    >
                      <Link to={`/channels/${favorite_channel.id}`}>
                        <img
                          src={favorite_channel?.visual_url}
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
                  {user?.favorite_users.map(favorite_user => (
                    <div
                      key={favorite_user.id}
                      className={classes['image-wrapper']}
                    >
                      <Link to={`/users/${favorite_user.id}`}>
                        <img
                          src={favorite_user.avatar_url}
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
        {/* )} */}
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
      {showReportModal && (
        <ReportModal
          onClick={handleReportModalToggle}
          content={{ type: 'user', id: user?.id }}
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
