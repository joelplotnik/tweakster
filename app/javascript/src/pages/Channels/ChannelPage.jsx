import { Link, json, useParams, useRouteLoaderData } from 'react-router-dom'
import {
  RiAddFill,
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
import InfiniteScroll from 'react-infinite-scroll-component'
import NoPieces from '../../components/Content/NoPieces'
import Piece from '../../components/Content/Piece'
import PieceSkeleton from '../../components/Content/Skeletons/PieceSkeleton'
import ReportModal from '../../components/UI/Modals/ReportModal'
import SubscribeButton from '../../components/UI/Buttons/SubscribeButton'
import { channelPageActions } from '../../store/channel-page'
import classes from './ChannelPage.module.css'
import defaultVisual from '../../assets/default-visual.png'
import { fetchChannelPieces } from '../../store/pieces-actions'
import store from '../../store'
import { throttle } from 'lodash'

const ChannelPage = () => {
  const { id } = useParams()
  const token = useRouteLoaderData('root')
  const { userId } = getUserData() || {}
  const userIdAsInt = parseInt(userId, 10)
  const channel = useSelector((state) => state.channelPage.channel)
  const dispatch = useDispatch()
  const pieces = useSelector(selectAllPieces)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const throttledFetchData = throttle(() => fetchData(), 500)

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true)

      try {
        const response = await dispatch(
          fetchChannelPieces({ channelId: id, page })
        )

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
      <div className={classes['channel-page']}>
        <div className={classes['pieces-container']}>
          <InfiniteScroll
            dataLength={pieces.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={isLoading && <PieceSkeleton />}
            endMessage={
              <>
                {pieces.length === 0 ? (
                  <NoPieces listPage={'channel'} owner={channel.can_edit} />
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
        {channel.id && (
          <Card className={classes.card}>
            <div className={classes['card-content']}>
              <div className={classes['photo-container']}>
                <img
                  className={classes.photo}
                  src={channel.visual_url || defaultVisual}
                  alt="User"
                />
              </div>
              {token && channel.subscribed && (
                <Link to={'pieces/new'} className={classes['new-piece-btn']}>
                  <RiAddFill />
                </Link>
              )}
              {token && channel.can_edit ? (
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
              <h1 className={classes['channel-name']}>{channel.name}</h1>
              <hr className={classes.divider} />
              <div className={classes.stats}>
                <div className={classes['stats-item']}>
                  <p>Subscribers:</p>
                  <p className={classes['stats-number']}>
                    {formatNumber(channel.subscriber_count)}
                  </p>
                </div>
                <div className={classes['stats-item']}>
                  <p>Pieces:</p>
                  <p className={classes['stats-number']}>
                    {formatNumber(channel.piece_count)}
                  </p>
                </div>
                <div className={classes['stats-item']}>
                  <p>Pupularity:</p>
                  <p className={classes['stats-number']}>
                    {channel.popularity}%
                  </p>
                </div>
              </div>
              {token && channel.user.id !== userIdAsInt && (
                <div className={classes['button-container']}>
                  <SubscribeButton
                    channelId={channel.id}
                    isSubscribed={channel.subscribed}
                    subscriberCount={channel.subscriber_count}
                  />
                </div>
              )}
              <div className={classes['channel-details']}>
                {channel.url && (
                  <div className={classes.detail}>
                    <p className={classes['detail-title']}>Website:</p>
                    <a
                      className={classes['channel-url']}
                      href={channel.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {channel.url}
                    </a>
                  </div>
                )}
                {channel.summary && (
                  <div className={classes.detail}>
                    <p className={classes['detail-title']}>Summary</p>

                    <p className={classes['detail-data']}>{channel.summary}</p>
                  </div>
                )}
                {channel.protocol && (
                  <div className={classes.detail}>
                    <p className={classes['detail-title']}>Rules</p>

                    <p className={classes['detail-data']}>{channel.protocol}</p>
                  </div>
                )}
              </div>
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
          content={{ type: 'channel', id: channel.id }}
        />
      )}
    </>
  )
}

export default ChannelPage

export async function loader({ params }) {
  const { '*': url } = params
  const urlParts = url.split('/')
  const channel_id = urlParts[1]
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/channels/${channel_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw json({ message: 'Could not find channel' }, { status: 500 })
  }

  const data = await response.json()

  store.dispatch(channelPageActions.setChannel(data))

  return data
}
