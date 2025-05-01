import moment from 'moment'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { formatNumber } from '../../../util/format'
import AttemptStatus from '../../UI/AttemptStatus'
import ApprovalButton from '../../UI/Buttons/ApprovalButton'
import DifficultyButton from '../../UI/Buttons/DifficultyButton'
import ReportButton from '../../UI/Buttons/ReportButton'
import ShareButton from '../../UI/Buttons/ShareButton'
import ReportModal from '../../UI/Modals/ReportModal'
import SlideUpModal from '../../UI/Modals/SlideUpModal'
import DifficultySlideUpForm from '../Forms/DifficultySlideUpForm'
import classes from './AttemptCard.module.css'

const AttemptCard = ({ attempt, isOwner, basePath }) => {
  const { challenge, user } = attempt
  const [showSlideUpModal, setShowSlideUpModal] = useState(false)
  const [userRating, setUserRating] = useState(attempt.user_rating)
  const [difficultyRating, setDifficultyRating] = useState(
    attempt.challenge.difficulty_rating
  )
  const [difficultiesCount, setDifficultiesCount] = useState(
    attempt.challenge.difficulties_count
  )
  const [showReportModal, setShowReportModal] = useState(false)
  const rootUrl = window.location.origin
  const sharePath = `${rootUrl}/${basePath}/challenges/${challenge.id}/attempts/${attempt.id}`

  const handleSlideUpModalToggle = () => {
    setShowSlideUpModal(!showSlideUpModal)
  }

  const handleReportModalToggle = () => {
    setShowReportModal(!showReportModal)
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
      <div className={classes['attempt-card']}>
        <div className={classes['attempt-header']}>
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
        </div>
        <div className={classes['completion-details']}>
          <div className={classes['status-info']}>
            <div className={classes['title-date']}>
              <div className={classes['attempt-title']}>
                <p className={classes['attempt-label']}>
                  Attempting:{' '}
                  <Link
                    to={`/${basePath}/challenges/${challenge.id}`}
                    className={classes['challenge-title']}
                  >
                    {challenge.title}
                  </Link>
                </p>
              </div>
              {attempt.completed_at && attempt.status === 'Complete' && (
                <p className={classes['completion-date']}>
                  Completed {moment(attempt.completed_at).fromNow()}
                </p>
              )}
            </div>
            <div className={classes.status}>
              <AttemptStatus status={attempt.status} />
            </div>
          </div>
          <div className={classes['proof']}>
            {attempt.proof_url ? (
              attempt.proof_url.endsWith('.mp4') ? (
                <video className={classes['proof-video']} controls>
                  <source src={attempt.proof_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={attempt.proof_url}
                  alt="Proof of Completion"
                  className={classes['proof-image']}
                />
              )
            ) : (
              <p>No proof provided</p>
            )}
          </div>
          <div className={classes['bottom-bar']}>
            {attempt.status === 'Complete' && (
              <ApprovalButton
                userApproval={attempt.user_approved}
                approvalsCount={formatNumber(attempt.approvals_count)}
                basePath={basePath}
                challengeId={challenge.id}
                attemptId={attempt.id}
              />
            )}
            <ShareButton sharePath={sharePath} />
            <ReportButton onClick={handleReportModalToggle} />
          </div>
        </div>
        <h3 className={classes['section-header']}>Challenge Description</h3>
        <div className={classes['small-details']}>
          <div className={classes['small-details-container']}>
            <p className={classes.category} id="description">
              {challenge.description}
            </p>
          </div>
        </div>
        <hr className={classes.divider} />
        <h3 className={classes['section-header']}>Challenge Details</h3>
        <div className={classes['small-details']}>
          <div className={classes['difficulty-container']}>
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
              {challenge.category}
            </p>
          </div>
          <div className={classes['small-details-container']}>
            <label htmlFor="createdAt" className={classes.label}>
              Created:
            </label>
            <p className={classes.category} id="createdAt">
              {moment(challenge.created_at).fromNow()}
            </p>
          </div>
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
      {showReportModal && (
        <ReportModal
          onClick={handleReportModalToggle}
          content={{ type: 'attempt', id: attempt.id }}
        />
      )}
    </>
  )
}
export default AttemptCard
