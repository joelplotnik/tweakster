import {
  RiArrowDownCircleFill,
  RiArrowDownCircleLine,
  RiArrowUpCircleFill,
  RiArrowUpCircleLine,
  RiThumbDownFill,
  RiThumbDownLine,
  RiThumbUpFill,
  RiThumbUpLine,
} from 'react-icons/ri'

import classes from './VoteButton.module.css'

const VoteButton = ({ upvotes, downvotes, userVote = { vote_type: 1 } }) => {
  const handleUpvote = () => console.log('Upvote clicked')
  const handleDownvote = () => console.log('Downvote clicked')
  return (
    <>
      <div className={classes['vote-section']}>
        <button className={classes['vote-button']} onClick={handleUpvote}>
          {userVote?.vote_type === 1 ? (
            <RiThumbUpFill className={classes['upvote-filled']} />
          ) : (
            <RiThumbUpLine className={classes['upvote']} />
          )}
        </button>
        <span className={classes['vote-count']}>{upvotes - downvotes}</span>
        <button className={classes['vote-button']} onClick={handleDownvote}>
          {userVote?.vote_type === -1 ? (
            <RiThumbDownFill className={classes['downvote-filled']} />
          ) : (
            <RiThumbDownLine className={classes['downvote']} />
          )}
        </button>
      </div>
      {/* {showModal && (
        <AuthModal authType={'login'} onClick={handleModalToggle} />
      )} */}
    </>
  )
}

export default VoteButton
