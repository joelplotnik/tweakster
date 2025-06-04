import moment from 'moment'
import { useEffect, useState } from 'react'
import { Form, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import DifficultyButton from '../../UI/Buttons/DifficultyButton'
import classes from './AttemptForm.module.css'

const STATUS_OPTIONS = {
  Pending: ['Pending', 'In Progress', 'Complete'],
  'In Progress': ['Pending', 'In Progress', 'Complete'],
  Complete: ['Complete'],
}

const AttemptForm = ({ attempt, onSubmit, user, onDropAttempt }) => {
  const [status, setStatus] = useState(attempt.status)
  //   const [twitchVideoLink, setTwitchVideoLink] = useState(
  //     attempt.twitch_video_link || ''
  //   )
  const [twitchVideoLink, setTwitchVideoLink] = useState(
    'https://player.twitch.tv/?video=v225861264&parent=streamernews.example.com&autoplay=false&parent=localhost'
  )
  const [isStreaming, setIsStreaming] = useState(false)
  const [showTwitchInput, setShowTwitchInput] = useState(false)
  const [showTwitchWarning, setShowTwitchWarning] = useState(false)
  const [isTwitchLinked, setIsTwitchLinked] = useState(false)
  const { challenge } = attempt
  // Check if Twitch is linked
  useEffect(() => {
    if (user.provider === 'twitch' && user.uid) {
      setIsTwitchLinked(true)
    }
  }, [user])

  // Handle state visibility
  useEffect(() => {
    if (status === 'In Progress') {
      setIsStreaming(true)
      setShowTwitchInput(false)
    } else if (status === 'Complete') {
      setIsStreaming(false)
      setShowTwitchInput(true)
    } else {
      setIsStreaming(false)
      setShowTwitchInput(false)
    }
  }, [status])

  const handleSubmit = e => {
    e.preventDefault()

    if (status === attempt.status) {
      toast.info('No changes detected. Update the status to submit.')
      return
    }

    if (status === 'Complete' && !twitchVideoLink) {
      toast.error(
        'You must provide a Twitch video link to complete the attempt.'
      )
      return
    }

    onSubmit({
      status,
      twitch_video_link: twitchVideoLink,
    })
  }

  const handleDropAttempt = () => {
    if (
      window.confirm(
        'Dropping this attempt will remove all comments and approvals. Continue?'
      )
    ) {
      onDropAttempt()
    }
  }

  return (
    <>
      <div className={classes['attempt-title']}>
        <p className={classes['attempt-label']}>
          <Link
            to={`/games/${challenge.game.slug}/challenges/${challenge.id}`}
            className={classes['challenge-title']}
          >
            {challenge.title}
          </Link>
        </p>
      </div>
      <Link
        to={`/games/${challenge.game.slug}`}
        className={classes['game-name']}
      >
        {challenge.game.name}
      </Link>
      <p className={classes['game-platform']}>{challenge.game.platform}</p>
      <Form
        method="POST"
        onSubmit={handleSubmit}
        className={classes['form-container']}
      >
        {attempt.status === 'Complete' ? (
          <div className={classes['completed-message']}>
            <div className={classes['message-content']}>
              <h3 className={classes['completed-heading']}>
                Challenge Complete!
              </h3>
              <p className={classes['completed-subtext']}>
                Done and dusted. Let’s see what challenge you can tackle next!
              </p>
            </div>
          </div>
        ) : (
          <div className={classes['form-group']}>
            <label className={classes['form-label']}>Status:</label>
            <select
              value={status}
              onChange={e => {
                const newStatus = e.target.value
                setStatus(newStatus)

                if (
                  !isTwitchLinked &&
                  (newStatus === 'In Progress' || newStatus === 'Complete')
                ) {
                  setShowTwitchWarning(true)
                } else {
                  setShowTwitchWarning(false)
                }
              }}
              className={classes['form-select']}
            >
              {STATUS_OPTIONS[attempt.status].map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {showTwitchInput && attempt.status !== 'Complete' && (
          <div className={classes['form-group']}>
            <label className={classes['form-label']}>Twitch Video Link:</label>
            <input
              type="url"
              value={twitchVideoLink}
              onChange={e => setTwitchVideoLink(e.target.value)}
              placeholder="https://www.twitch.tv/videos/..."
              className={classes['form-input']}
            />
          </div>
        )}

        {showTwitchWarning && (
          <p className={classes['google-warning']}>
            You need to{' '}
            <Link to="/settings/connections" className={classes['google-link']}>
              link your Twitch account
            </Link>{' '}
            to update the status.
          </p>
        )}

        {attempt.status !== 'Complete' && (
          <button
            type="submit"
            className={`${classes['form-submit-button']} ${
              (!isTwitchLinked && status !== 'Pending') ||
              status === attempt.status
                ? classes['disabled-button']
                : ''
            }`}
            disabled={
              (!isTwitchLinked && status !== 'Pending') ||
              status === attempt.status
            }
          >
            Update Attempt
          </button>
        )}
      </Form>

      {isStreaming && isTwitchLinked && (
        <div className={classes['form-group']}>
          {/* <iframe
              src={`https://player.twitch.tv/?channel=${user.username}&parent=localhost`}
              height="400"
              width="100%"
              frameBorder="0"
              allowFullScreen
            ></iframe> */}
          <iframe
            src="https://player.twitch.tv/?channel=dallas&parent=streamernews.example.com&muted=true&parent=localhost"
            height="400"
            width="100%"
            frameBorder="0"
            allowfullscreen
          ></iframe>
        </div>
      )}

      {status === 'Complete' && (
        <div className={classes['video-section']}>
          {twitchVideoLink ? (
            <iframe
              src="https://player.twitch.tv/?video=v225861264&parent=streamernews.example.com&autoplay=false&parent=localhost"
              height="400"
              width="100%"
              frameBorder="0"
            ></iframe>
          ) : (
            <p>No video attached.</p>
          )}
        </div>
      )}

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
            rating={challenge.difficulty_rating}
            id="difficulty-rating"
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
      <div></div>
      <hr className={classes.divider} />
      <button className={classes['abandon-button']} onClick={handleDropAttempt}>
        Abandon Attempt
      </button>
    </>
  )
}

export default AttemptForm
