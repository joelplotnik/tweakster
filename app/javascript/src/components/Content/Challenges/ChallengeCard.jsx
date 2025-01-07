import moment from 'moment'
import { Link } from 'react-router-dom'

import AttemptButton from '../../UI/Buttons/AttemptButton'
import VoteButton from '../../UI/Buttons/VoteButton'
import Difficulty from '../../UI/Difficulty'
import classes from './ChallengeCard.module.css'

const ChallengeCard = ({ challenge, isOwner, basePath }) => {
  return (
    <div className={classes['challenge-card']}>
      <div className={classes['challenge-card-main']}>
        <div className={classes['game-info']}>
          <Link
            to={`/games/${challenge.game.slug}`}
            className={classes['game-link']}
          >
            {challenge.game.name}
          </Link>
          <span className={classes['platform']}>{challenge.game.platform}</span>
        </div>
        {challenge.image_url ? (
          <div className={classes['image-container']}>
            <img
              src={challenge.image_url}
              alt={challenge.title}
              className={classes['challenge-image']}
            />
          </div>
        ) : (
          <hr className={classes.divider} />
        )}
        <div className={classes.meta}>
          <hr className={classes.divider} />
          <div className={classes['difficulty-category']}>
            <Difficulty
              rating={challenge.difficulty_rating}
              id="difficulty-rating"
            />
            <span className={classes['category']}>{challenge.category}</span>
          </div>
          <hr className={classes.divider} />
        </div>
        <h1 className={classes['title']}>{challenge.title}</h1>
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
          <AttemptButton />
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
  )
}

export default ChallengeCard
