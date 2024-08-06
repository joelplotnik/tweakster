import moment from 'moment'
import React from 'react'
import { Link } from 'react-router-dom'

import TweakVote from '../UI/TweakVote'
import classes from './Tweak.module.css'

const Tweak = ({ tweak, pieceClassModalRef }) => {
  return (
    <div className={classes.tweak}>
      <div className={classes.vote}>
        <TweakVote
          upvotes={tweak.upvotes}
          downvotes={tweak.downvotes}
          channelId={tweak.channel_id}
          pieceId={tweak.piece_id}
          tweakId={tweak.id}
          userVotes={tweak.votes}
        />
      </div>
      <div className={classes.content}>
        <p className={classes.annotation}>{tweak.annotation}</p>
        <div className={classes['author-info']}>
          <div className={classes['author-details']}>
            <Link
              to={`/users/${tweak.user_id}`}
              className={classes['tweak-user-link']}
            >
              {tweak.user.username}
            </Link>
            <p className={classes.date}>{moment(tweak.created_at).fromNow()}</p>
          </div>
          <Link
            to={`/users/${tweak.user_id}`}
            className={classes['user-link']}
            onClick={e => e.stopPropagation()}
          >
            <div className={classes['photo-container']}>
              <img
                className={classes.photo}
                src={tweak.user.avatar_url || '/default-avatar.png'}
                alt={`${tweak.user.username}'s avatar`}
              />
            </div>
          </Link>
        </div>
      </div>
      {/* <Comments
        commentable={tweak}
        commentableType={'Tweak'}
        pieceClassModalRef={pieceClassModalRef}
      /> */}
    </div>
  )
}

export default Tweak
