import moment from 'moment'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { formatNumber } from '../../../util/format'
import AttemptStatus from '../../UI/AttemptStatus'
import ApprovalButton from '../../UI/Buttons/ApprovalButton'
import CommentButton from '../../UI/Buttons/CommentButton'
import DifficultyButton from '../../UI/Buttons/DifficultyButton'
import ReportButton from '../../UI/Buttons/ReportButton'
import ShareButton from '../../UI/Buttons/ShareButton'
import SlideUpModal from '../../UI/Modals/SlideUpModal'
import DifficultySlideUpForm from '../Forms/DifficultySlideUpForm'
import classes from './Attempt.module.css'

const Attempt = ({ attempt }) => {
  const {
    id,
    status,
    completed_at,
    approvals_count,
    comments_count,
    proof_url,
    challenge,
    user,
    user_approved,
    user_challenge_rating,
  } = attempt
  const descriptionLimit = 250
  const [isExpanded, setIsExpanded] = useState(false)
  const rootUrl = window.location.origin
  const { username, name: gameName, challengeId } = useParams()
  const basePath = username ? `users/${username}` : `games/${gameName}`
  const isUserPage = username && !challengeId
  const isGameChallenge = gameName && challengeId
  const gameAttemptPath = `${rootUrl}/games/${challenge.game.slug}/challenges/${challenge.id}/attempts/${id}`
  const userAttemptPath = `${rootUrl}/users/${challenge.user.slug}/challenges/${challenge.id}/attempts/${id}`
  const pathToShare =
    isUserPage || isGameChallenge ? gameAttemptPath : userAttemptPath
  const [slideUpModalContentType, setSlideUpModalContentType] = useState(null)
  const [showSlideUpModal, setShowSlideUpModal] = useState(false)
  const [userRating, setUserRating] = useState(user_challenge_rating)
  const [difficultyRating, setDifficultyRating] = useState(
    challenge.difficulty_rating
  )
  const [difficultiesCount, setDifficultiesCount] = useState(
    challenge.difficulties_count
  )

  const handleDifficultyRating = (
    newUserRating,
    newDifficultyRating,
    newDifficultiesCount
  ) => {
    setUserRating(newUserRating)
    setDifficultyRating(newDifficultyRating)
    setDifficultiesCount(newDifficultiesCount)
  }

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev)
  }

  const handleSlideUpModalToggle = contentType => {
    setSlideUpModalContentType(contentType)
    setShowSlideUpModal(!showSlideUpModal)
  }

  const displayedDescription = isExpanded
    ? challenge.description
    : challenge.description.length > descriptionLimit
    ? challenge.description.slice(0, descriptionLimit) + '...'
    : challenge.description

  return (
    <>
      <div className={classes.attempt}>
        <div className={classes['user-game-details']}>
          {!isUserPage && (
            <>
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
              <div className={classes.status}>
                <AttemptStatus status={status} />
              </div>
            </>
          )}
          {isUserPage && (
            <div className={classes['game-info']}>
              <Link
                to={`/games/${challenge.game.slug}`}
                className={classes['game-name']}
              >
                {challenge.game.name}
              </Link>
              <p className={classes['game-platform']}>
                {challenge.game.platform}
              </p>
            </div>
          )}
        </div>
        <div className={classes['challenge-details']}>
          {isUserPage && (
            <>
              <div className={classes['challenge-header']}>
                <h3 className={classes['challenge-title']}>
                  <Link
                    to={`/games/${challenge.game.slug}/challenges/${challenge.id}`}
                    className={classes.link}
                  >
                    {challenge.title}
                  </Link>
                </h3>

                <div className={classes.status}>
                  <AttemptStatus status={status} />
                </div>
              </div>
            </>
          )}
          {isUserPage && (
            <>
              <hr className={classes.divider} />
              <div className={classes['category-difficulty']}>
                <DifficultyButton
                  rating={difficultyRating}
                  onClick={() => handleSlideUpModalToggle('rateDifficulty')}
                />
                <p className={classes.category}> {challenge.category}</p>
              </div>
              <hr className={classes.divider} />
              <div className={classes['challenge-description']}>
                <span className={classes['challenge-description-content']}>
                  {displayedDescription}
                </span>
                <div className={classes['description-actions']}>
                  {challenge.description.length > descriptionLimit && (
                    <button
                      onClick={toggleExpanded}
                      className={classes['show-more-button']}
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                  <Link
                    to={`/games/${challenge.game.slug}/challenges/${challenge.id}/attempts/${id}`}
                    className={classes['view-full-link']}
                  >
                    View Full Attempt
                  </Link>
                </div>
              </div>
            </>
          )}

          {(status === 'Complete' || status === 'In Progress') && (
            <>
              <div className={classes['completion-details']}>
                {status === 'Complete' && (
                  <p className={classes['completion-date']}>
                    Completed {moment(completed_at).fromNow()}
                  </p>
                )}
                <div className={classes['proof']}>
                  {proof_url ? (
                    proof_url.endsWith('.mp4') ? (
                      <video className={classes['proof-video']} controls>
                        <source src={proof_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={proof_url}
                        alt="Proof of Completion"
                        className={classes['proof-image']}
                      />
                    )
                  ) : (
                    <p>No proof provided</p>
                  )}
                </div>
              </div>
              <div className={classes['bottom-bar']}>
                {status === 'Complete' && (
                  <ApprovalButton
                    userApproval={user_approved}
                    approvalsCount={formatNumber(approvals_count)}
                    basePath={
                      isUserPage ? `games/${challenge.game.slug}` : basePath
                    }
                    challengeId={challenge.id}
                    attemptId={id}
                  />
                )}
                <CommentButton
                  commentsCount={formatNumber(comments_count)}
                  onClick={() => handleSlideUpModalToggle('comments')}
                />
                <ShareButton pathToShare={pathToShare} />
                <ReportButton />
              </div>
            </>
          )}
        </div>
      </div>
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
              basePath={isUserPage ? `games/${challenge.game.slug}` : basePath}
              challengeId={challenge.id}
              handleDifficultyRating={handleDifficultyRating}
            />
          )}
          {slideUpModalContentType === 'comments' && (
            <div>
              <p>HERES WHERE STUFF GOES</p>
            </div>
          )}
        </SlideUpModal>
      )}
    </>
  )
}

export default Attempt
