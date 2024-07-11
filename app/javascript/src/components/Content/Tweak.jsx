import React, { useContext, useEffect, useState } from 'react';
import {
  Link,
  json,
  useLocation,
  useNavigate,
  useRouteLoaderData,
} from 'react-router-dom';
import Moment from 'react-moment';

import { API_URL } from '../../constants/constants';
import { getUserData } from '../../util/auth';
import PieceModalContext from '../../context/piecemodal';
import RefreshContext from '../../context/refresh';
import PieceVote from '../UI/PieceVote';
import SharePopover from '../UI/SharePopover';
import ConfirmationModal from '../UI/Modals/ConfirmationModal';
import AuthModal from '../UI/Modals/AuthModal';
import ReportModal from '../UI/Modals/ReportModal';
import PieceCarousel from '../UI/PieceCarousel';

import classes from './Tweak.module.css';
import {
  RiChat3Line,
  RiDeleteBin7Line,
  RiEditBoxLine,
  RiFlagLine,
  RiFlaskFill,
  RiFlaskLine,
  RiMoreFill,
} from 'react-icons/ri';
import defaultAvatar from '../../assets/default-avatar.png';

const Tweak = ({ tweak }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const background = useContext(PieceModalContext);

  const token = useRouteLoaderData('root');
  const pieceUserID = tweak.user_id;
  const { userId, userRole } = getUserData() || {};
  const currentUser = pieceUserID === userId;
  const setRefreshRoot = useContext(RefreshContext);

  const tweaked = !!tweak.tweak;

  const handleReportModalToggle = () => {
    setShowReportModal(!showReportModal);
  };

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal);
  };

  const handleConfirmationModalToggle = () => {
    setShowConfirmationModal(!showConfirmationModal);
  };

  const handleDropdownToggle = (event) => {
    event.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    if (tweak.tweaks_count > 0) {
      navigate(`channels/${tweak.channel_id}/pieces/${tweak.id}/edit`);
    }
  };

  const handleDeleteClick = async () => {
    const response = await fetch(
      `${API_URL}/channels/${tweak.channel_id}/pieces/${tweak.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw json({ message: 'Could not delete piece' }, { status: 500 });
    }

    window.location.reload();
    setRefreshRoot(true);
  };

  const handleReportClick = () => {
    if (!token) {
      setShowDropdown(false);
      setShowAuthModal(true);
    } else {
      setShowDropdown(false);
      setShowReportModal(true);
    }
  };

  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      const dropdownContainer = document.querySelector(
        `.${classes['dropdown-container']}`
      );

      if (dropdownContainer && !dropdownContainer.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutsideDropdown);

    return () => {
      document.removeEventListener('click', handleClickOutsideDropdown);
    };
  }, []);

  const handlePieceLinkClick = (event) => {
    const target = event.target;
    const isDeleteButton = target.classList.contains(classes.danger);
    const isDropdown = target.closest(`.${classes.dropdown}`);
    const isCarouselDiv = target.closest(`.${classes.carousel}`);

    if (!isDeleteButton && !isDropdown && !isCarouselDiv) {
      event.preventDefault();
      let url = '';
      let param = '';

      if (target.closest(`.${classes.tweak}`)) {
        param = 'tweaks';
      } else if (target.closest(`.${classes.comms}`)) {
        param = 'comments';
      }

      if (param) {
        url = `/channels/${tweak.channel.id}/pieces/${tweak.id}`;
        navigate(url, { state: { tab: param, background: background } });
      } else {
        navigate(`/channels/${tweak.channel_id}/pieces/${tweak.id}`, {
          state: { background: background },
        });
      }
    }
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  return (
    <>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
      <div onClick={handlePieceLinkClick} className={classes.piece}>
        <div className={classes['content-wrapper']}>
          <div className={classes.header}>
            <div className={classes['user-info']}>
              {location.pathname !== `/users/${tweak.user_id}` && (
                <>
                  <Link
                    to={`/users/${tweak.user_id}`}
                    className={classes['user-link']}
                    onClick={stopPropagation}
                  >
                    <div className={classes['photo-container']}>
                      <img
                        className={classes.photo}
                        src={tweak.user?.avatar_url || defaultAvatar}
                        alt="User"
                      />
                    </div>
                  </Link>
                  <p className={classes.user}>
                    <Link
                      to={`/users/${tweak.user_id}`}
                      className={classes['user-link']}
                      onClick={stopPropagation}
                    >
                      {tweak.user.username}
                    </Link>
                  </p>
                </>
              )}
              {location.pathname !== `/channels/${tweak.channel_id}` && (
                <p className={classes.channel}>
                  <Link
                    to={`/channels/${tweak.channel_id}`}
                    className={classes['user-link']}
                    onClick={stopPropagation}
                  >
                    #{tweak.channel.name}
                  </Link>
                </p>
              )}
            </div>
            <p className={classes.date}>
              - <Moment fromNow>{tweak.created_at}</Moment>
            </p>
          </div>
          <div className={tweaked ? classes['tweak-effect'] : classes.main}>
            <h2 className="title-container">{tweak.title}</h2>
            <div className={classes.carousel}>
              <PieceCarousel
                pieceUrl={`/channels/${tweak.channel.id}/pieces/${tweak.id}`}
                tweak={true}
                background={background}
                content={tweak.content}
                images={tweak.images}
                youtubeUrl={tweak.youtube_url}
              />
            </div>
            {tweaked && (
              <div className={classes['disclaimer-container']}>
                <RiFlaskFill className={classes['disclaimer-icon']} />
                <p className={classes['disclaimer-text']}>
                  Tweaked by
                  <Link
                    to={`/users/${tweak.tweak.user.id}`}
                    className={classes['tweak-user-link']}
                    onClick={stopPropagation}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tweak.tweak.user.username}
                  </Link>
                  (+{tweak.tweak.vote_difference} likes)
                </p>
                <div className={classes['disclaimer-btn-container']}>
                  <Link
                    to={`/channels/${tweak.tweak.channel_id}/pieces/${tweak.tweak.piece_id}`}
                    className={classes['disclaimer-btn']}
                    onClick={stopPropagation}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Tweak
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className={classes.footer}>
            <div className={classes['footer-container']}>
              <div className={classes.vote}>
                <PieceVote
                  likes={tweak.likes}
                  dislikes={tweak.dislikes}
                  channelId={tweak.channel_id}
                  pieceId={tweak.id}
                  userVotes={tweak.votes}
                  background={background}
                  arrangement={'row'}
                />
              </div>
              <div className={`${classes.link} ${classes.comms}`}>
                <RiChat3Line className={classes.icon} />
                <span className={classes.text}>
                  {tweak.comments_count} Comments
                </span>
              </div>
              <SharePopover
                url={`${window.location.origin}/channels/${tweak.channel_id}/pieces/${tweak.id}`}
                type={'piece'}
              />
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
                        <button
                          onClick={handleEditClick}
                          disabled={tweak.tweaks_count > 0}
                        >
                          <RiEditBoxLine /> Edit
                        </button>
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
        </div>
      </div>
      {showConfirmationModal && (
        <ConfirmationModal
          onConfirm={handleDeleteClick}
          onClick={handleConfirmationModalToggle}
        />
      )}
      {showReportModal && (
        <ReportModal
          onClick={handleReportModalToggle}
          content={{ type: 'piece', id: tweak.id }}
        />
      )}
    </>
  );
};

export default Tweak;
