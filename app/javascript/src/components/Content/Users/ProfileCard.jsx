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
            {!isOwner && (
              <button className={classes['follow-button']}>Follow</button>
            )}
            {isOwner && (
              <button className={classes['edit-button']}>Edit Profile</button>
            )}
          </div>
        </div>
        <div className={classes['stats-section']}>
          <div className={classes['stats-item']}>
            <span className={classes['stats-number']}>120</span>
            <span className={classes['stats-label']}>Points</span>
          </div>
          <div className={classes['stats-item']}>
            <span className={classes['stats-number']}>500</span>
            <span className={classes['stats-label']}>Followers</span>
          </div>
          <div className={classes['stats-item']}>
            <span className={classes['stats-number']}>180</span>
            <span className={classes['stats-label']}>Following</span>
          </div>
        </div>
        <div className={classes['bio-section']}>
          {user.bio && <p className={classes['bio']}>{user.bio}</p>}
          {user.url && (
            <p className={classes['url']}>
              <a href={user.url} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            </p>
          )}
          {user.currently_playing && (
            <p className={classes['currently-playing']}>
              Currently Playing: {user.currently_playing}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
