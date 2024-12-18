import moment from 'moment'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { formatNumber } from '../../../util/format'
import AttemptButton from '../../UI/Buttons/AttemptButton'
import CommentButton from '../../UI/Buttons/CommentButton'
import ReportButton from '../../UI/Buttons/ReportButton'
import ShareButton from '../../UI/Buttons/ShareButton'
import VoteButton from '../../UI/Buttons/VoteButton'
import Difficulty from '../../UI/Difficulty'
import AuthModal from '../../UI/Modals/AuthModal'
import SlideUpModal from '../../UI/Modals/SlideUpModal'
import DifficultyForm from '../Forms/DifficultyForm'
import classes from './Challenge.module.css'

const Challenge = ({ challenge, isUserPage }) => {
  const {
    id,
    title,
    category,
    description,
    image_url,
    created_at,
    upvotes,
    downvotes,
    difficulty_rating,
    attempts_count,
    comments_count,
    game,
    user,
  } = challenge
  const descriptionLimit = 250
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [slideUpModalContentType, setSlideUpModalContentType] = useState(null)
  const [showSlideUpModal, setShowSlideUpModal] = useState(false)

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showModal)
  }

  const handleSlideUpModalToggle = contentType => {
    console.log(contentType)

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
          {!isUserPage && (
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
          <div
            className={
              isUserPage ? classes['game-info-userpage'] : classes['game-info']
            }
          >
            <Link to={`/games/${game.slug}`} className={classes['game-name']}>
              {game.name}
            </Link>
            <p className={classes['game-platform']}>{game.platform}</p>
          </div>
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
              <Difficulty
                rating={difficulty_rating}
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
                {attempts_count}
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
                  isUserPage
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
            <AttemptButton />
          </div>
          {/* {image_url && ( */}
          <div className={classes['image-container']}>
            <img
              src={
                image_url ||
                'https://platform.polygon.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/21902058/EidIZw3XYAEj5V4.png?quality=90&strip=all&crop=0,16.666666666667,100,66.666666666667'
              }
              alt="Challenge related"
              className={classes.image}
            />
          </div>
          {/* )} */}
          <div className={classes['bottom-bar']}>
            <VoteButton upvotes={upvotes} downvotes={downvotes} />
            <CommentButton
              commentsCount={formatNumber(comments_count)}
              onClick={() => handleSlideUpModalToggle('comments')}
            />
            <ShareButton />
            <ReportButton />
          </div>
        </div>
      </div>
      {showAuthModal && (
        <AuthModal authType={'login'} onClick={handleAuthModalToggle} />
      )}
      {showSlideUpModal && (
        <SlideUpModal onClick={() => handleSlideUpModalToggle(null)}>
          {slideUpModalContentType === 'rateDifficulty' && <DifficultyForm />}
          {slideUpModalContentType === 'comments' && (
            <div>
              <h3>Comments</h3>
              {/* Comments section goes here */}
            </div>
          )}
        </SlideUpModal>
      )}
    </>
  )
}

export default Challenge
