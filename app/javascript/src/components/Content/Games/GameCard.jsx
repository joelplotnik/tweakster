import placeholderCover from '../../../assets/default_cover.png'
import { formatDate } from '../../../util/format'
import classes from './GameCard.module.css'

const GameCard = ({ game }) => {
  const formattedDate = formatDate(game.first_release_date)
  const platforms =
    game.platforms?.length > 0 ? game.platforms.join(', ') : 'Unknown'

  return (
    <div className={classes['game-card']}>
      <div className={classes['cover-wrapper']}>
        <img
          src={
            game.cover_url && game.cover_url !== 'https:'
              ? game.cover_url
              : placeholderCover
          }
          alt={`Cover of ${game.name}`}
          className={classes['cover']}
        />
      </div>

      <div className={classes['game-info']}>
        <div className={classes['top-section']}>
          <h1 className={classes['game-title']}>{game.name}</h1>
        </div>

        <div className={classes['meta-section']}>
          <div className={classes['meta-item']}>
            <span className={classes['meta-label']}>Released:</span>
            <span className={classes['meta-value']}>{formattedDate}</span>
          </div>
          <div className={classes['meta-item']}>
            <span className={classes['meta-label']}>Platforms:</span>
            <span className={classes['meta-value']}>{platforms}</span>
          </div>
        </div>

        <div className={classes['summary-section']}>
          <h2 className={classes['summary-title']}>Summary</h2>
          <p className={classes['summary']}>{game.summary}</p>
        </div>
      </div>
    </div>
  )
}

export default GameCard
