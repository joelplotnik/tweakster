import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useDispatch } from 'react-redux'
import { useRouteLoaderData } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

import { API_URL } from '../constants/constants'
import { notificationsActions } from '../store/notifications'
import classes from './NotificationsPage.module.css'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const token = useRouteLoaderData('root')

  const fetchNotifications = async currentPage => {
    try {
      const response = await fetch(
        `${API_URL}/notifications?page=${currentPage}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()

      const unseenNotifications = data.filter(
        notification => !notification.seen_at
      )

      if (unseenNotifications.length > 0) {
        await markNotificationsAsSeen(
          unseenNotifications.map(notification => notification.id)
        )
      }

      return data
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  const markNotificationsAsSeen = async notificationIds => {
    try {
      const response = await fetch(`${API_URL}/notifications/mark_as_seen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notification_ids: notificationIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark notifications as seen')
      }

      const responseData = await response.json()
      const { has_more_notifications } = responseData

      dispatch(
        notificationsActions.setHasNewNotifications(has_more_notifications)
      )
    } catch (error) {
      console.error('Error marking notifications as seen:', error)
    }
  }

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true)

      const notificationsFromServer = await fetchNotifications(page)

      if (notificationsFromServer.length > 0) {
        setNotifications([...notifications, ...notificationsFromServer])
        setPage(page + 1)
      } else {
        setHasMore(false)
      }

      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderNotification = notification => {
    const {
      id,
      event,
      user_avatar_url,
      username,
      piece_title,
      piece_channel_id,
      piece_id,
    } = notification

    if (event.record_type === 'Comment') {
      return (
        <li key={id} className={classes.notificationItem}>
          <img
            src={user_avatar_url}
            alt={`${username}'s avatar`}
            className={classes.avatar}
          />
          <div className={classes.notificationContent}>
            <span className={classes.username}>{username}</span> commented on{' '}
            <a
              href={`/channels/${piece_channel_id}/pieces/${piece_id}?tab=comments`}
              className={classes.link}
            >
              {piece_title}
            </a>
          </div>
        </li>
      )
    } else if (event.record_type === 'Piece') {
      return (
        <li key={id} className={classes.notificationItem}>
          <img
            src={user_avatar_url}
            alt={`${username}'s avatar`}
            className={classes.avatar}
          />
          <div className={classes.notificationContent}>
            <span className={classes.username}>{username}</span> tweaked{' '}
            <a
              href={`/channels/${piece_channel_id}/pieces/${piece_id}?tab=tweaks`}
              className={classes.link}
            >
              {piece_title}
            </a>
          </div>
        </li>
      )
    }
    return null
  }

  return (
    <div className={classes.container}>
      <h1 className={classes.heading}>Notifications</h1>
      <hr className={classes.divider} />
      <InfiniteScroll
        dataLength={notifications.length}
        next={fetchData}
        hasMore={hasMore}
        loader={
          <div className={classes.loader}>
            <ClipLoader color="#cccccc" loading={isLoading} size={30} />
          </div>
        }
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>No more notifications</b>
          </p>
        }
      >
        <ul className={classes.notificationsList}>
          {notifications.map(renderNotification)}
        </ul>
      </InfiniteScroll>
    </div>
  )
}

export default NotificationsPage
