import moment from 'moment'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import AttemptButton from '../../UI/Buttons/AttemptButton'
import DifficultyButton from '../../UI/Buttons/DifficultyButton'
import MoreButton from '../../UI/Buttons/MoreButton'
import VoteButton from '../../UI/Buttons/VoteButton'
import SlideUpModal from '../../UI/Modals/SlideUpModal'
import DifficultySlideUpForm from '../Forms/DifficultySlideUpForm'
import classes from './ChallengeCard.module.css'

const ChallengeCard = ({ challenge, isOwner, basePath }) => {
  const [showSlideUpModal, setShowSlideUpModal] = useState(false)
  const [userRating, setUserRating] = useState(challenge.user_rating)
  const [difficultyRating, setDifficultyRating] = useState(
    challenge.difficulty_rating
  )
  const [difficultiesCount, setDifficultiesCount] = useState(
    challenge.difficulties_count
  )
  const rootUrl = window.location.origin
  const sharePath = `${rootUrl}/${basePath}/challenges/${challenge.id}`

  const handleSlideUpModalToggle = () => {
    setShowSlideUpModal(!showSlideUpModal)
  }

  const handleDifficultyRating = (
    newUserRating,
    newDifficultyRating,
    newDifficultiesCount
  ) => {
    setUserRating(newUserRating)
    setDifficultyRating(newDifficultyRating)
    setDifficultiesCount(newDifficultiesCount)
  }

  return (
    <>
      <div className={classes['challenge-card']}>
        <div className={classes['challenge-card-main']}>
          <div className={classes['game-info']}>
            <Link
              to={`/games/${challenge.game.slug}`}
              className={classes['game-link']}
            >
              {challenge.game.name}
            </Link>
            <span className={classes['platform']}>
              {challenge.game.platform}
            </span>
          </div>
          {challenge.image_url && (
            <div className={classes['image-container']}>
              <img
                src={challenge.image_url}
                alt={challenge.title}
                className={classes['challenge-image']}
              />
            </div>
          )}
          <div className={classes.meta}>
            <hr className={classes.divider} />
            <div className={classes['difficulty-category']}>
              <DifficultyButton
                rating={difficultyRating}
                id="difficulty-rating"
                onClick={() => handleSlideUpModalToggle()}
              />
              <span className={classes['category']}>{challenge.category}</span>
            </div>
            <hr className={classes.divider} />
          </div>
          <div className={classes['title-row']}>
            <h1 className={classes['title']}>{challenge.title}</h1>
            {isOwner && (
              <div className={classes['more-button-wrapper']}>
                <MoreButton
                  content={{
                    type: 'challenge',
                    id: challenge.id,
                  }}
                  basePath={basePath}
                  sharePath={sharePath}
                  isOwner={isOwner}
                  isContentPage={true}
                />
              </div>
            )}
          </div>
          <p className={classes['description']}>{challenge.description}</p>
          <div className={classes['user-info']}>
            <span className={classes['created-at']}>
              Created {moment(challenge.created_at).fromNow()} by
            </span>
            <Link
              to={`/users/${challenge.user.slug}`}
              className={classes['user-link']}
            >
              <span>{challenge.user.username}</span>
            </Link>
          </div>
          <div className={classes['attempt-button']}>
            <AttemptButton
              userAttempted={challenge.user_attempted}
              userAttemptId={
                challenge.user_attempted ? challenge.user_attempt_id : null
              }
              basePath={basePath}
              challengeId={challenge.id}
            />
          </div>
        </div>
        <hr className={classes.divider} />
        <div className={classes['votes']}>
          <VoteButton
            userVote={challenge.user_vote}
            upvotes={challenge.upvotes}
            downvotes={challenge.downvotes}
            basePath={basePath}
            challengeId={challenge.id}
          />
        </div>
      </div>
      {showSlideUpModal && (
        <SlideUpModal
          header={'Rate Difficulty'}
          onClick={() => handleSlideUpModalToggle(null)}
        >
          <DifficultySlideUpForm
            userRating={userRating}
            difficultiesCount={difficultiesCount}
            average={difficultyRating}
            basePath={basePath}
            challengeId={challenge.id}
            handleDifficultyRating={handleDifficultyRating}
          />
        </SlideUpModal>
      )}
    </>
  )
}

export default ChallengeCard
