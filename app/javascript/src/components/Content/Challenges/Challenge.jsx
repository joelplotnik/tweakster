import moment from 'moment'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { formatNumber } from '../../../util/format'
import AttemptButton from '../../UI/Buttons/AttemptButton'
import CommentButton from '../../UI/Buttons/CommentButton'
import DifficultyButton from '../../UI/Buttons/DifficultyButton'
import MoreButton from '../../UI/Buttons/MoreButton'
import ShareButton from '../../UI/Buttons/ShareButton'
import VoteButton from '../../UI/Buttons/VoteButton'
import AuthModal from '../../UI/Modals/AuthModal'
import SlideUpModal from '../../UI/Modals/SlideUpModal'
import CommentSlideUpForm from '../Forms/CommentSlideUpForm'
import DifficultySlideUpForm from '../Forms/DifficultySlideUpForm'
import classes from './Challenge.module.css'

const Challenge = ({ challenge, isUserContext }) => {
  const {
    id,
    title,
    category,
    description,
    image_url,
    created_at,
    user_vote,
    upvotes,
    downvotes,
    user_rating,
    difficulties_count,
    difficulty_rating,
    user_attempted,
    user_attempt_id,
    active_attempts_count,
    comments_count,
    game,
    user,
    is_owner,
  } = challenge
  const descriptionLimit = 250
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [slideUpModalContentType, setSlideUpModalContentType] = useState(null)
  const [showSlideUpModal, setShowSlideUpModal] = useState(false)
  const { username, name: gameName } = useParams()
  const basePath = username ? `users/${username}` : `games/${gameName}`
  const isGamePage = !!gameName
  const rootUrl = window.location.origin
  const sharePath = `${rootUrl}/${basePath}/challenges/${id}`
  const [userRating, setUserRating] = useState(user_rating)
  const [difficultyRating, setDifficultyRating] = useState(difficulty_rating)
  const [difficultiesCount, setDifficultiesCount] = useState(difficulties_count)

  const handleDifficultyRating = (
    newUserRating,
    newDifficultyRating,
    newDifficultiesCount
  ) => {
    setUserRating(newUserRating)
    setDifficultyRating(newDifficultyRating)
    setDifficultiesCount(newDifficultiesCount)
  }

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showModal)
  }

  const handleSlideUpModalToggle = contentType => {
    setSlideUpModalContentType(contentType)
    setShowSlideUpModal(!showSlideUpModal)
  }

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev)
  }

  const displayedDescription = isExpanded
    ? description
    : description.length > descriptionLimit
    ? description.slice(0, descriptionLimit) + '...'
    : description

  return (
    <>
      <div className={classes.challenge}>
        <div className={classes['user-game-details']}>
          {!isUserContext && (
            <div className={classes['user-info']}>
              <img
                src={user.avatar_url}
                alt={`${user.username}'s avatar`}
                className={classes.avatar}
              />
              <Link to={`/users/${user.slug}`} className={classes.username}>
                {user.username}
              </Link>
            </div>
          )}
          {!isGamePage && (
            <div
              className={
                isUserContext
                  ? classes['game-info-userpage']
                  : classes['game-info']
              }
            >
              <Link to={`/games/${game.slug}`} className={classes['game-name']}>
                {game.name}
              </Link>
              <p className={classes['game-platform']}>{game.platform}</p>
            </div>
          )}
        </div>
        <div className={classes['challenge-details']}>
          <div className={classes['challenge-header']}>
            <h3 className={classes['challenge-title']}>
              <Link
                to={`/games/${game.slug}/challenges/${id}`}
                className={classes.link}
              >
                {title}
              </Link>
            </h3>
          </div>
          <hr className={classes.divider} />
          <div className={classes['small-details']}>
            <div className={classes['small-details-container']}>
              <label htmlFor="difficulty-rating" className={classes.label}>
                Difficulty:
              </label>
              <DifficultyButton
                rating={difficultyRating}
                id="difficulty-rating"
                onClick={() => handleSlideUpModalToggle('rateDifficulty')}
              />
            </div>
            <div className={classes['small-details-container']}>
              <label htmlFor="category" className={classes.label}>
                Category:
              </label>
              <p className={classes.category} id="category">
                {category}
              </p>
            </div>
            <div className={classes['small-details-container']}>
              <label htmlFor="attemptsCount" className={classes.label}>
                Attempts:
              </label>
              <p className={classes.category} id="attemptsCount">
                {active_attempts_count}
              </p>
            </div>
            <div className={classes['small-details-container']}>
              <label htmlFor="createdAt" className={classes.label}>
                Created:
              </label>
              <p className={classes.category} id="createdAt">
                {moment(created_at).fromNow()}
              </p>
            </div>
          </div>
          <hr className={classes.divider} />
          <div className={classes['challenge-description']}>
            <span className={classes['challenge-description-content']}>
              {displayedDescription}
            </span>
            <div className={classes['description-actions']}>
              {description.length > descriptionLimit && (
                <button
                  onClick={toggleExpanded}
                  className={classes['show-more-button']}
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </button>
              )}
              <Link
                to={
                  isUserContext
                    ? `/users/${user.slug}/challenges/${id}`
                    : `/games/${game.slug}/challenges/${id}`
                }
                className={classes['view-full-link']}
              >
                View Full Challenge
              </Link>
            </div>
          </div>
          <div className={classes['attempt-button']}>
            <AttemptButton
              userAttempted={user_attempted}
              userAttemptId={user_attempted ? user_attempt_id : null}
              basePath={basePath}
              challengeId={id}
            />
          </div>
          {image_url && (
            <div className={classes['image-container']}>
              <img
                src={image_url}
                alt="Challenge related"
                className={classes.image}
              />
            </div>
          )}
          <div className={classes['bottom-bar']}>
            <VoteButton
              userVote={user_vote}
              upvotes={upvotes}
              downvotes={downvotes}
              basePath={basePath}
              challengeId={id}
            />
            <CommentButton
              commentsCount={formatNumber(comments_count)}
              onClick={() => handleSlideUpModalToggle('comments')}
            />
            <ShareButton sharePath={sharePath} />
            <MoreButton
              content={{ type: 'challenge', id: id }}
              basePath={basePath}
              sharePath={sharePath}
              isOwner={is_owner}
            />
          </div>
        </div>
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
      {showSlideUpModal && (
        <SlideUpModal
          header={
            slideUpModalContentType === 'comments'
              ? 'Comments'
              : 'Rate Difficulty'
          }
          onClick={() => handleSlideUpModalToggle(null)}
        >
          {slideUpModalContentType === 'rateDifficulty' && (
            <DifficultySlideUpForm
              userRating={userRating}
              difficultiesCount={difficultiesCount}
              average={difficultyRating}
              basePath={basePath}
              challengeId={id}
              handleDifficultyRating={handleDifficultyRating}
            />
          )}
          {slideUpModalContentType === 'comments' && (
            <CommentSlideUpForm basePath={basePath} challengeId={id} />
          )}
        </SlideUpModal>
      )}
    </>
  )
}

export default Challenge
