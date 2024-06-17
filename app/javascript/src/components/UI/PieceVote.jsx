import React, { useEffect, useState } from 'react';
import { useRouteLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';

import { API_URL } from '../../constants/constants';
import AuthModal from './Modals/AuthModal';

import classes from './PieceVote.module.css';
import {
  RiThumbDownLine,
  RiThumbDownFill,
  RiThumbUpLine,
  RiThumbUpFill,
} from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { pieceActions } from '../../store/piece';

const PieceVote = ({
  likes,
  dislikes,
  channelId,
  pieceId,
  userVotes,
  background,
  arrangement,
}) => {
  const token = useRouteLoaderData('root');
  const userId = useSelector((state) => state.user.user?.id);
  const activePiece = useSelector((state) => state.piece.piece);
  const [showModal, setShowModal] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localDislikes, setLocalDislikes] = useState(dislikes);
  const [localVotes, setLocalVotes] = useState(userVotes);
  const dispatch = useDispatch();

  useEffect(() => {
    if (activePiece && activePiece.id === pieceId) {
      setLocalVotes(activePiece.votes);
      setLocalLikes(activePiece.likes);
      setLocalDislikes(activePiece.dislikes);
    }
  }, [activePiece, pieceId]);

  const userVoteIndex = localVotes.findIndex((vote) => vote.user_id === userId);
  const userVote = userVoteIndex !== -1 ? localVotes[userVoteIndex] : null;

  const handleModalToggle = () => {
    setShowModal(!showModal);
  };

  const handleVote = async (voteType) => {
    if (!token) {
      setShowModal(true);
      return;
    }

    const voteData = {
      vote: {
        vote_type: voteType,
        votable_id: pieceId,
        votable_type: 'Piece',
      },
    };

    const response = await fetch(
      `${API_URL}/channels/${channelId}/pieces/${pieceId}/votes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(voteData),
      }
    );

    if (response.status === 401) {
      toast.error('You are not authorized to perform this action');
      return;
    }

    if (!response.ok) {
      toast.error('Could not perform this action');
      return;
    }

    if (activePiece && activePiece.id === pieceId) {
      dispatch(pieceActions.updateVote({ id: pieceId, userId, voteType }));
    } else {
      // Update local state based on the vote type
      setLocalVotes((prevVotes) => {
        const updatedVotes = prevVotes.map((vote) => ({ ...vote }));
        if (userVoteIndex !== -1) {
          if (updatedVotes[userVoteIndex].vote_type === 1 && voteType === -1) {
            // User's previous vote was a like, and the incoming vote is a dislike
            setLocalLikes((prevLikes) => prevLikes - 1);
            setLocalDislikes((prevDislikes) => prevDislikes + 1);
            updatedVotes[userVoteIndex].vote_type = -1; // Update the vote_type
          } else if (
            updatedVotes[userVoteIndex].vote_type === -1 &&
            voteType === 1
          ) {
            // User's previous vote was a dislike, and the incoming vote is a like
            setLocalLikes((prevLikes) => prevLikes + 1);
            setLocalDislikes((prevDislikes) => prevDislikes - 1);
            updatedVotes[userVoteIndex].vote_type = 1; // Update the vote_type
          } else if (
            updatedVotes[userVoteIndex].vote_type === 1 &&
            voteType === 1
          ) {
            // User's previous vote was a like, and the incoming vote is also a like
            setLocalLikes((prevLikes) => prevLikes - 1);
            updatedVotes.splice(userVoteIndex, 1); // Remove the user's vote
          } else if (
            updatedVotes[userVoteIndex].vote_type === -1 &&
            voteType === -1
          ) {
            // User's previous vote was a dislike, and the incoming vote is also a dislike
            setLocalDislikes((prevDislikes) => prevDislikes - 1);
            updatedVotes.splice(userVoteIndex, 1); // Remove the user's vote
          }
        } else {
          updatedVotes.push({ user_id: userId, vote_type: voteType });
          if (voteType === 1) {
            setLocalLikes((prevLikes) => prevLikes + 1);
          } else if (voteType === -1) {
            setLocalDislikes((prevDislikes) => prevDislikes + 1);
          }
        }
        return updatedVotes;
      });
    }
  };

  const handleUpvote = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleVote(1);
  };

  const handleDownvote = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleVote(-1);
  };

  return (
    <>
      <div
        className={`${
          arrangement === 'header'
            ? classes['vote-section-header']
            : arrangement === 'row'
            ? classes['vote-section-row']
            : classes['vote-section']
        }`}
      >
        <button
          className={classes['vote-button']}
          onClick={handleUpvote}
          disabled={background}
        >
          {userVote?.vote_type === 1 ? (
            <RiThumbUpFill className={classes['thumb-up-icon-filled']} />
          ) : (
            <RiThumbUpLine className={classes['thumb-up-icon']} />
          )}
        </button>
        <span className={classes['vote-count']}>
          {localLikes - localDislikes}
        </span>
        <button
          className={classes['vote-button']}
          onClick={handleDownvote}
          disabled={background}
        >
          {userVote?.vote_type === -1 ? (
            <RiThumbDownFill className={classes['thumb-down-icon-filled']} />
          ) : (
            <RiThumbDownLine className={classes['thumb-down-icon']} />
          )}
        </button>
      </div>
      {showModal && (
        <AuthModal authType={'login'} onClick={handleModalToggle} />
      )}
    </>
  );
};

export default PieceVote;
