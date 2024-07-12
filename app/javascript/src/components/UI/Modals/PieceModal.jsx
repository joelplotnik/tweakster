import moment from 'moment'
import React, { useContext, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import {
  RiArrowLeftLine,
  RiDeleteBin7Line,
  RiEditBoxLine,
  RiFlagLine,
  RiFlaskLine,
  RiMoreFill,
} from 'react-icons/ri'
import { useDispatch, useSelector } from 'react-redux'
import {
  Link,
  useLocation,
  useNavigate,
  useRouteLoaderData,
} from 'react-router-dom'
import { toast } from 'react-toastify'

import defaultAvatar from '../../../assets/default-avatar.png'
import { API_URL } from '../../../constants/constants'
import PieceModalContext from '../../../context/piecemodal'
import RefreshContext from '../../../context/refresh'
import { channelPageActions } from '../../../store/channel-page'
import { pieceModalActions } from '../../../store/piece-modal'
import { getUserData } from '../../../util/auth'
import Interactions from '../../Content/Interactions'
import PieceCarousel from '../PieceCarousel'
import PieceVote from '../PieceVote'
import SharePopover from '../SharePopover'
import AuthModal from './AuthModal'
import Backdrop from './Backdrop'
import ConfirmationModal from './ConfirmationModal'
import classes from './PieceModal.module.css'
import PopulateModal from './PopulateModal'
import ReportModal from './ReportModal'

const PieceModal = () => {
  const piece = useSelector(state => state.piece.piece)
  const navigate = useNavigate()
  const token = useRouteLoaderData('root')
  const { userId, userRole } = getUserData() || {}
  const pieceUserId = piece.user.id
  const currentUser = pieceUserId === parseInt(userId, 10)
  const channel = useSelector(state => state.channelPage.channel)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showPopulateModal, setShowPopulateModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const setRefreshRoot = useContext(RefreshContext)
  const pieceClassModalRef = useRef(null)
  const dispatch = useDispatch()
  let location = useLocation()
  let background = location.state && location.state.background
  const interactionsRef = useRef(null)
  const [tweakData, setTweakData] = useState({
    channelId: piece.channel_id,
    pieceId: piece.id,
    text: false,
  })

  useEffect(() => {
    const tabParam = location.state && location.state.tab

    if (tabParam) {
      interactionsRef.current.scrollIntoView({ top: 0, behavior: 'smooth' })
    }
  }, [location.state])

  useEffect(() => {
    dispatch(pieceModalActions.setPieceModalActive(true))

    return () => {
      dispatch(pieceModalActions.resetPieceModalState())
    }
  }, [dispatch])

  useEffect(() => {
    // Add the overlay class to the overlay-root element
    const overlayRoot = document.getElementById('overlay-root')
    if (overlayRoot) {
      overlayRoot.classList.add('overlay')
    }

    // Cleanup function to remove the class when the component is unmounted
    return () => {
      if (overlayRoot) {
        overlayRoot.classList.remove('overlay')
      }
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

  const handleReportModalToggle = () => {
    setShowReportModal(!showReportModal)
  }

  const handleSubscriptionModalToggle = () => {
    setShowSubscriptionModal(!showSubscriptionModal)
  }

  const handlePopulateModalToggle = () => {
    setShowPopulateModal(!showPopulateModal)
  }

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown)
  }

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

  const handleEditClick = () => {
    if (piece.tweaks_count === 0) {
      navigate(`edit`)
    }
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

      navigate(background.pathname)
      setRefreshRoot(true)
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error deleting piece')
    }
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

  const handleTweakClick = async () => {
    try {
      if (!token) {
        setShowAuthModal(true)
      } else {
        const response = await fetch(
          `${API_URL}/channels/${piece.channel_id}/check_channel_subscription`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (response.status === 403) {
          // User isn't subscribed to channel, show the subscription modal
          setShowSubscriptionModal(true)
        } else if (!response.ok) {
          throw new Error('Failed to check channel subscription')
        } else {
          if (piece.content) {
            setShowPopulateModal(true)
          } else {
            const queryParams = new URLSearchParams(tweakData).toString()
            navigate(`/channels/${piece.channel_id}/pieces/new?${queryParams}`)
          }
        }
      }
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error handling tweak click')
    }
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

      if (background.pathname.startsWith('/channels') && channel) {
        dispatch(channelPageActions.updateSubscribedState(true))
        dispatch(
          channelPageActions.updateSubscriberCount(channel.subscriber_count + 1)
        )
      }

      setShowSubscriptionModal(false)

      if (piece.content) {
        setShowPopulateModal(true)
      } else {
        const queryParams = new URLSearchParams(tweakData).toString()
        navigate(`/channels/${piece.channel_id}/pieces/new?${queryParams}`)
      }
    } catch (error) {
      console.error(error)
      toast.error('Error handling subscribe click')
    }
  }

  const handleParentPieceClick = event => {
    event.preventDefault()
    navigate(
      `/channels/${piece.parent_piece.channel.id}/pieces/${piece.parent_piece_id}`,
      {
        state: { background: background },
      }
    )
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

  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop
          onClick={() => navigate(background.pathname)}
          isPieceModalBG={true}
        />,
        document.getElementById('backdrop-root')
      )}
      {ReactDOM.createPortal(
        <>
          <PieceModalContext.Provider value={background}>
            <div key={piece.id} className={classes['modal-outer-container']}>
              <div className={classes.modal}>
                <div>
                  <div className={classes['modal-header']}>
                    <div className={classes['header-left']}>
                      <button
                        className={classes['back-icon']}
                        onClick={() => navigate(-1)}
                      >
                        <RiArrowLeftLine />
                      </button>
                    </div>
                    <div className={classes['header-center']}>
                      <PieceVote
                        likes={piece.likes}
                        dislikes={piece.dislikes}
                        channelId={piece.channel_id}
                        pieceId={piece.id}
                        userVotes={piece.votes}
                        arrangement={'header'}
                      />
                    </div>
                    <div className={classes['header-right']}>
                      <SharePopover url={window.location.href} type={'modal'} />
                    </div>
                  </div>
                  <div className={classes.piece} ref={pieceClassModalRef}>
                    <div className={classes.vote}>
                      <PieceVote
                        likes={piece.likes}
                        dislikes={piece.dislikes}
                        channelId={piece.channel_id}
                        pieceId={piece.id}
                        userVotes={piece.votes}
                      />
                    </div>
                    <div className={classes['content-wrapper']}>
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
                                {token &&
                                (currentUser || userRole === 'admin') ? (
                                  <>
                                    <button
                                      onClick={handleEditClick}
                                      disabled={piece.tweaks_count > 0}
                                    >
                                      <RiEditBoxLine /> Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleConfirmationModalToggle()
                                      }
                                    >
                                      <RiDeleteBin7Line
                                        className={classes.danger}
                                      />
                                      <span className={classes.danger}>
                                        Delete
                                      </span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={handleReportClick}>
                                      <RiFlagLine className={classes.danger} />
                                      <span className={classes.danger}>
                                        Report
                                      </span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={classes.main}>
                        {piece.parent_piece && (
                          <div className={classes['parent-piece-bar']}>
                            <p className={classes['parent-piece-text']}>
                              Tweak of{' '}
                              <Link onClick={handleParentPieceClick}>
                                {piece.parent_piece.title.length > 20
                                  ? `${piece.parent_piece.title.slice(
                                      0,
                                      20
                                    )}...`
                                  : piece.parent_piece.title}
                              </Link>
                            </p>
                          </div>
                        )}
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
                            dangerouslySetInnerHTML={{ __html: piece.content }}
                          />
                        </div>
                      </div>
                      <div className={classes.footer}>
                        <div className={classes['footer-container']}>
                          {!piece.parent_piece_id && (
                            <button
                              className={`${classes.link} ${classes.tweak}`}
                              onClick={handleTweakClick}
                            >
                              <RiFlaskLine className={classes['tweak-icon']} />
                              <span className={classes.text}>Tweak</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div
                        className={classes['interactions-container']}
                        ref={interactionsRef}
                      >
                        <Interactions
                          pieceId={piece.id}
                          pieceClassModalRef={pieceClassModalRef}
                        />
                      </div>
                    </div>
                  </div>
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
          </PieceModalContext.Provider>
        </>,
        document.getElementById('overlay-root')
      )}
    </>
  )
}

export default PieceModal
