import moment from 'moment'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { formatNumber } from '../../../util/format'
import AttemptStatus from '../../UI/AttemptStatus'
import ApprovalButton from '../../UI/Buttons/ApprovalButton'
import CommentButton from '../../UI/Buttons/CommentButton'
import ReportButton from '../../UI/Buttons/ReportButton'
import ShareButton from '../../UI/Buttons/ShareButton'
import Difficulty from '../../UI/Difficulty'
import classes from './Attempt.module.css'

const Attempt = ({ attempt, isUserPage }) => {
  const {
    id,
    status,
    completed_at,
    approvals_count,
    comments_count,
    proof_url,
    challenge,
    user,
  } = attempt
  const descriptionLimit = 250
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev)
  }

  const displayedDescription = isExpanded
    ? challenge.description
    : challenge.description.length > descriptionLimit
    ? challenge.description.slice(0, descriptionLimit) + '...'
    : challenge.description

  return (
    <div className={classes.attempt}>
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
          <Link
            to={`/games/${challenge.game.slug}`}
            className={classes['game-name']}
          >
            {challenge.game.name}
          </Link>
          <p className={classes['game-platform']}>{challenge.game.platform}</p>
        </div>
      </div>
      <div className={classes['challenge-details']}>
        <div className={classes['challenge-header']}>
          <h3 className={classes['challenge-title']}>
            <Link
              to={`/games/${challenge.game.slug}/challenges/${challenge.id}`}
              className={classes.link}
            >
              {challenge.title}
            </Link>
          </h3>
          <AttemptStatus status={status} />
        </div>
        <hr className={classes.divider} />
        <div className={classes['category-difficulty']}>
          <Difficulty rating={challenge.difficulty_rating} />
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
        {status === 'Complete' && (
          <>
            <div className={classes['completion-details']}>
              <p className={classes['completion-date']}>
                Completed {moment(completed_at).fromNow()}
              </p>
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
              <ApprovalButton approvalsCount={formatNumber(approvals_count)} />
              <CommentButton commentsCount={formatNumber(comments_count)} />
              <ShareButton />
              <ReportButton />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Attempt
