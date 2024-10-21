import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import {
  RiDeleteBin7Line,
  RiEditBoxLine,
  RiFlagLine,
  RiFlaskLine,
  RiMoreFill,
} from 'react-icons/ri'
import { useSelector } from 'react-redux'
import {
  Link,
  useLocation,
  useNavigate,
  useRouteLoaderData,
} from 'react-router-dom'
import { toast } from 'react-toastify'

import defaultAvatar from '../../assets/default-avatar.png'
import Interactions from '../../components/Content/Interactions'
import { AuthModal } from '../../components/UI/Modals/AuthModal'
import ConfirmationModal from '../../components/UI/Modals/ConfirmationModal'
import PopulateModal from '../../components/UI/Modals/PopulateModal'
import ReportModal from '../../components/UI/Modals/ReportModal'
import PieceCarousel from '../../components/UI/PieceCarousel'
import PieceVote from '../../components/UI/PieceVote'
import SharePopover from '../../components/UI/SharePopover'
import { API_URL } from '../../constants/constants'
import store from '../../store/index'
import { pieceActions } from '../../store/piece'
import { getUserData } from '../../util/auth'
import classes from './PiecePage.module.css'

const PiecePage = () => {
  const piece = useSelector(state => state.piece.piece)
  const token = useRouteLoaderData('root')
  const { userId, userRole } = getUserData() || {}
  const pieceUserId = piece.user.id
  const currentUser = pieceUserId === parseInt(userId, 10)
  const navigate = useNavigate()
  let location = useLocation()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showPopulateModal, setShowPopulateModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const interactionsRef = useRef(null)
  const [tweakData, setTweakData] = useState({
    channelId: piece.channel_id,
    pieceId: piece.id,
    text: false,
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = location.state && location.state.tab

    if (params.has('tab') || tabParam) {
      interactionsRef.current.scrollIntoView({ top: 0, behavior: 'smooth' })
    }
  }, [location.state])

  useEffect(() => {
    const handleClickOutsideDropdown = event => {
      const dropdownContainer = document.querySelector(
        `.${classes['dropdown-container']}`
      )

      if (dropdownContainer && !dropdownContainer.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('click', handleClickOutsideDropdown)

    return () => {
      document.removeEventListener('click', handleClickOutsideDropdown)
    }
  }, [])

  const stopPropagation = event => {
    event.stopPropagation()
  }

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal)
  }

  const handleConfirmationModalToggle = () => {
    setShowConfirmationModal(!showConfirmationModal)
  }

  const handleSubscriptionModalToggle = () => {
    setShowSubscriptionModal(!showSubscriptionModal)
  }

  const handlePopulateModalToggle = () => {
    setShowPopulateModal(!showPopulateModal)
  }

  const handleReportModalToggle = () => {
    setShowReportModal(!showReportModal)
  }

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown)
  }

  const handleDeleteClick = async () => {
    try {
      const response = await fetch(
        `${API_URL}/channels/${piece.channel_id}/pieces/${piece.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Could not delete piece')
      }

      return navigate('/')
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error deleting piece')
    }
  }

  const handleTweakClick = async () => {
    console.log('You are trying to tweak a piece')

    // try {
    //   if (!token) {
    //     setShowAuthModal(true)
    //   } else {
    //     const response = await fetch(
    //       `${API_URL}/channels/${piece.channel_id}/check_channel_subscription`,
    //       {
    //         method: 'GET',
    //         headers: {
    //           'Content-Type': 'application/json',
    //           Authorization: `Bearer ${token}`,
    //         },
    //       }
    //     )

    //     if (response.status === 403) {
    //       // User isn't subscribed to channel, show the subscription modal
    //       setShowSubscriptionModal(true)
    //     } else if (!response.ok) {
    //       throw new Error('Failed to check channel subscription')
    //     } else {
    //       if (piece.content) {
    //         setShowPopulateModal(true)
    //       } else {
    //         const queryParams = new URLSearchParams(tweakData).toString()
    //         navigate(`/channels/${piece.channel_id}/pieces/new?${queryParams}`)
    //       }
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error: ', error.message)
    //   toast.error('Error handling tweak click')
    // }
  }

  const handleSubscribeClick = async () => {
    try {
      const payload = {
        channel_id: piece.channel.id,
      }

      const response = await fetch(
        `${API_URL}/channels/${piece.channel.id}/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to subscribe')
      }

      setShowSubscriptionModal(false)

      if (piece.body) {
        setShowPopulateModal(true)
      } else {
        const queryParams = new URLSearchParams(tweakData).toString()
        navigate(`/channels/${piece.channel_id}/pieces/new?${queryParams}`)
      }
    } catch (error) {
      console.error('Error: ', error)
      toast.error('Error handling subscribe click')
    }
  }

  const handleCheckboxChange = event => {
    const { value, checked } = event.target
    setTweakData(prevData => ({
      ...prevData,
      [value]: checked,
    }))
  }

  const handlePopulateClick = () => {
    const queryParams = new URLSearchParams(tweakData).toString()
    navigate(`/channels/${piece.channel_id}/pieces/new?${queryParams}`)
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

  return (
    <>
      <div key={piece.id} className={classes.piece}>
        <div className={classes['content-wrapper']}>
          <div className={classes.vote}>
            <PieceVote
              upvotes={piece.upvotes}
              downvotes={piece.downvotes}
              channelId={piece.channel_id}
              pieceId={piece.id}
              userVotes={piece.votes}
            />
          </div>
          <div className={classes.header}>
            <div className={classes['user-info']}>
              <Link
                to={`/users/${piece.user_id}`}
                className={classes['user-link']}
                onClick={stopPropagation}
              >
                <div className={classes['photo-container']}>
                  <img
                    className={classes.photo}
                    src={piece.user?.avatar_url || defaultAvatar}
                    alt="User"
                  />
                </div>
              </Link>
              <p className={classes.user}>
                <Link
                  to={`/users/${piece.user_id}`}
                  className={classes['user-link']}
                  onClick={stopPropagation}
                >
                  {piece.user.username}
                </Link>
              </p>
              <p className={classes.channel}>
                <Link
                  to={`/channels/${piece.channel_id}`}
                  className={classes['user-link']}
                  onClick={stopPropagation}
                >
                  #{piece.channel.name}
                </Link>
              </p>
              <p className={classes.date}>
                - {moment(piece.created_at).fromNow()}
              </p>
            </div>
            <div className={classes['flex-right']}>
              <div className={classes['dropdown-container']}>
                <div
                  className={`${classes.link} ${classes['more-icon']}`}
                  onClick={handleDropdownToggle}
                >
                  <RiMoreFill />
                </div>
                {showDropdown && (
                  <div className={classes.dropdown}>
                    {token && (currentUser || userRole === 'admin') ? (
                      <>
                        <button onClick={() => handleConfirmationModalToggle()}>
                          <RiDeleteBin7Line className={classes.danger} />
                          <span className={classes.danger}>Delete</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={handleReportClick}>
                          <RiFlagLine className={classes.danger} />
                          <span className={classes.danger}>Report</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={classes.main}>
            <div className={classes.body}>
              <h2>{piece.title}</h2>
              {(piece.images.length > 0 || piece.youtube_url) && (
                <>
                  <PieceCarousel
                    images={piece.images}
                    youtubeUrl={piece.youtube_url}
                  />
                  <hr />
                </>
              )}
              <div
                className={classes.content}
                dangerouslySetInnerHTML={{ __html: piece.body }}
              />
            </div>
          </div>
          <div className={classes.footer}>
            <div className={classes['footer-container']}>
              <SharePopover url={window.location.href} type={'page'} />
              <button
                className={`${classes.link} ${classes.tweak}`}
                onClick={handleTweakClick}
              >
                <RiFlaskLine className={classes['tweak-icon']} />
                <span className={classes.text}>Tweak</span>
              </button>
            </div>
          </div>
          <div
            className={classes['interactions-container']}
            ref={interactionsRef}
          >
            <Interactions pieceId={piece.id} pieceClassModalRef={'page'} />
          </div>
        </div>
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
      {showConfirmationModal && (
        <ConfirmationModal
          onConfirm={handleDeleteClick}
          onClick={handleConfirmationModalToggle}
        />
      )}
      {showSubscriptionModal && (
        <ConfirmationModal
          type={'confirm'}
          header={'Subscribe'}
          message={`Subscription required to tweak this piece. Subscribe to ${piece.channel.name} now?`}
          button={'Subscribe'}
          onConfirm={handleSubscribeClick}
          onClick={handleSubscriptionModalToggle}
        />
      )}
      {showPopulateModal && (
        <PopulateModal
          onConfirm={handlePopulateClick}
          onClick={handlePopulateModalToggle}
          onCheckboxChange={handleCheckboxChange}
        />
      )}
      {showReportModal && (
        <ReportModal
          onClick={handleReportModalToggle}
          content={{ type: 'piece', id: piece.id }}
        />
      )}
    </>
  )
}

export default PiecePage

export async function loader({ params }) {
  const { '*': url } = params
  const urlParts = url.split('/')
  const channel_id = urlParts[1]
  const piece_id = urlParts[3]

  const response = await fetch(
    `${API_URL}/channels/${channel_id}/pieces/${piece_id}`
  )

  if (!response.ok) {
    throw new Error('Could not find piece')
  }

  const data = await response.json()

  store.dispatch(pieceActions.setPiece(data))

  return data
}
