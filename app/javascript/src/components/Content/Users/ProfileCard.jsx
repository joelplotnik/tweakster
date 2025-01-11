import { Link } from 'react-router-dom'

import { formatNumber } from '../../../util/format'
import FollowButton from '../../UI/Buttons/FollowButton'
import classes from './ProfileCard.module.css'

const ProfileCard = ({ user, isOwner }) => {
  return (
    <div className={classes['profile-card']}>
      <div className={classes['avatar-wrapper']}>
        <img
          src={user.avatar_url}
          alt={`${user.username}'s avatar`}
          className={classes['avatar']}
        />
      </div>
      <div className={classes['user-info']}>
        <div className={classes['top-section']}>
          <h1 className={classes['username']}>{user.username}</h1>
          <div className={classes['button-group']}>
            <div className={classes['button-group']}>
              {!isOwner ? (
                <FollowButton />
              ) : (
                <button className={classes['edit-button']}>Edit Profile</button>
              )}
            </div>
          </div>
        </div>
        <div className={classes['stats-section']}>
          <div className={classes['stats-item']}>
            <span className={classes['stats-number']}>
              {formatNumber(user.points)}
            </span>
            <span className={classes['stats-label']}>Points</span>
          </div>
          <div className={classes['stats-item']}>
            <span className={classes['stats-number']}>
              {formatNumber(user.followers)}
            </span>
            <span className={classes['stats-label']}>Followers</span>
          </div>
          <div className={classes['stats-item']}>
            <span className={classes['stats-number']}>
              {formatNumber(user.following)}
            </span>
            <span className={classes['stats-label']}>Following</span>
          </div>
        </div>
        <div className={classes['bio-section']}>
          {user.bio && <p className={classes['bio']}>{user.bio}</p>}
          {user.currently_playing && (
            <div className={classes['currently-playing-container']}>
              <span className={classes['currently-playing-label']}>
                Currently Playing
              </span>
              <Link
                to={`/games/${user.currently_playing.slug}`}
                className={classes['currently-playing']}
              >
                {user.currently_playing.name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
