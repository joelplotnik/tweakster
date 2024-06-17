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
import RefreshContext from '../../context/refresh';
import PieceVote from '../UI/PieceVote';
import SharePopover from '../UI/SharePopover';
import ConfirmationModal from '../UI/Modals/ConfirmationModal';
import AuthModal from '../UI/Modals/AuthModal';
import ReportModal from '../UI/Modals/ReportModal';
import PieceCarousel from '../UI/PieceCarousel';

import classes from './Piece.module.css';
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
import { useSelector } from 'react-redux';

const Piece = ({ piece }) => {
  const activePiece = useSelector((state) => state.piece.piece);
  const location = useLocation();
  const navigate = useNavigate();
  const setRefreshRoot = useContext(RefreshContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const token = useRouteLoaderData('root');
  const { userId, userRole } = getUserData() || {};
  const pieceUserID = piece.user.id;
  const currentUser = pieceUserID === parseInt(userId, 10);

  const tweaked = !!piece.tweak;

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal);
  };

  const handleConfirmationModalToggle = () => {
    setShowConfirmationModal(!showConfirmationModal);
  };

  const handleReportModalToggle = () => {
    setShowReportModal(!showReportModal);
  };

  const handleDropdownToggle = (event) => {
    event.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    if (piece.tweaks_count === 0) {
      navigate(`/channels/${piece.channel_id}/pieces/${piece.id}/edit`);
    }
  };

  const handleParentPieceClick = (event) => {
    event.stopPropagation();
    window.open(
      `/channels/${piece.parent_piece.channel.id}/pieces/${piece.parent_piece_id}`,
      '_blank'
    );
  };

  const handleDeleteClick = async () => {
    const response = await fetch(
      `${API_URL}/channels/${piece.channel_id}/pieces/${piece.id}`,
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

    navigate(location.pathname);
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
        if (!token) {
          url = `/channels/${piece.channel.id}/pieces/${piece.id}?tab=${param}`;
          window.open(url, '_blank');
        } else {
          url = `/channels/${piece.channel.id}/pieces/${piece.id}`;
          navigate(url, { state: { tab: param, background: location } });
        }
      } else {
        if (!token) {
          url = `/channels/${piece.channel.id}/pieces/${piece.id}`;
          window.open(url, '_blank');
        } else {
          navigate(`/channels/${piece.channel.id}/pieces/${piece.id}`, {
            state: { background: location },
          });
        }
      }
    }
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  return (
    <>
      <div onClick={handlePieceLinkClick} className={classes.piece}>
        <div className={classes.vote}>
          <PieceVote
            likes={piece.likes}
            dislikes={piece.dislikes}
            channelId={piece.channel_id}
            pieceId={piece.id}
            userVotes={piece.votes}
            arrangement={'column'}
          />
        </div>
        <div className={classes['content-wrapper']}>
          <div className={classes.header}>
            <div className={classes['user-info']}>
              {location.pathname !== `/users/${piece.user.id}` && (
                <>
                  <Link
                    to={`/users/${piece.user.id}`}
                    className={classes['user-link']}
                    onClick={stopPropagation}
                  >
                    <div className={classes['photo-container']}>
                      <img
                        className={classes.photo}
                        src={piece?.user?.avatar_url || defaultAvatar}
                        alt="User"
                      />
                    </div>
                  </Link>
                  <p className={classes.user}>
                    <Link
                      to={`/users/${piece.user.id}`}
                      className={classes['user-link']}
                      onClick={stopPropagation}
                    >
                      {piece.user.username}
                    </Link>
                  </p>
                </>
              )}
              {location.pathname !== `/channels/${piece.channel.id}` && (
                <p className={classes.channel}>
                  <Link
                    to={`/channels/${piece.channel.id}`}
                    className={classes['user-link']}
                    onClick={stopPropagation}
                  >
                    #{piece.channel.name}
                  </Link>
                </p>
              )}
            </div>
            <p className={classes.date}>
              - <Moment fromNow>{piece.created_at}</Moment>
            </p>
          </div>
          <div className={tweaked ? classes['tweak-effect'] : classes.main}>
            {piece.parent_piece && (
              <div className={classes['parent-piece-bar']}>
                <p className={classes['parent-piece-text']}>
                  Tweak of{' '}
                  <Link onClick={handleParentPieceClick}>
                    {piece.parent_piece.title.length > 20
                      ? `${piece.parent_piece.title.slice(0, 20)}...`
                      : piece.parent_piece.title}
                  </Link>
                </p>
              </div>
            )}
            <div className={classes.body}>
              <h2 className="title-container">{piece.title}</h2>
              <div className={classes.carousel}>
                <PieceCarousel
                  pieceUrl={`/channels/${piece.channel.id}/pieces/${piece.id}`}
                  background={location}
                  content={piece.content}
                  images={piece.images}
                  youtubeUrl={piece.youtube_url}
                />
              </div>
            </div>
            {tweaked && (
              <div className={classes['disclaimer-container']}>
                <RiFlaskFill className={classes['disclaimer-icon']} />
                <p className={classes['disclaimer-text']}>
                  Tweaked by
                  <Link
                    to={`/users/${piece.tweak.user.id}`}
                    className={classes['tweak-user-link']}
                    onClick={stopPropagation}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {piece.tweak.user.username}
                  </Link>
                  (+{piece.tweak.vote_difference} likes)
                </p>
                <div className={classes['disclaimer-btn-container']}>
                  <Link
                    to={`/channels/${piece.tweak.channel_id}/pieces/${piece.tweak.piece_id}`}
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
              <div className={`${classes.link} ${classes.tweak}`}>
                <RiFlaskLine className={classes.icon} />
                <span className={classes.text}>
                  {piece.tweaks_count} Tweaks
                </span>
              </div>
              <div className={`${classes.link} ${classes.comms}`}>
                <RiChat3Line className={classes.icon} />
                <span className={classes.text}>
                  {activePiece && activePiece.id === piece.id
                    ? activePiece.comments_count
                    : piece.comments_count}{' '}
                  Comments
                </span>
              </div>
              <SharePopover
                url={`${window.location.href}channels/${piece.channel.id}/pieces/${piece.id}`}
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
                          disabled={piece.tweaks_count > 0}
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
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
      {showConfirmationModal && (
        <ConfirmationModal
          onConfirm={handleDeleteClick}
          onClick={handleConfirmationModalToggle}
        />
      )}
      {showReportModal && (
        <ReportModal
          onClick={handleReportModalToggle}
          content={{ type: 'piece', id: piece.id }}
        />
      )}
    </>
  );
};

export default Piece;
