import React from 'react'

import Card from '../../components/UI/Card'
import classes from './AboutPage.module.css'

function AboutPage() {
  return (
    <Card className={classes.card}>
      <div className={classes['about-page']}>
        <h1>Welcome to Tweakster</h1>
        <p className={classes['mission-statement']}>
          Tweakster is the app that lets you reinvent the way you play! Gone are
          the days of relying solely on game developers for achievements—now,
          you create your own. With Tweakster, gamers can craft custom
          challenges, share them with the community, and put others to the test.
        </p>
        <p className={classes.description}>
          Whether you're designing a wild speedrun, a quirky challenge, or the
          ultimate mastery test, your creations can take center stage. Players
          can attempt these unique achievements, and once completed, validation
          comes straight from the community—users confirm each other’s
          accomplishments to keep things authentic. The best part is not that
          users can vote for the best challenges by upvoting or downvoting, it's
          that Tweakster brings players together to push boundaries and create
          experiences no one has thought of before. The most innovative and
          exciting challenges naturally rise to the top, making it easy to find
          popular challenges for each game.
        </p>
        <p className={classes.goal}>
          Tweakster isn't just an achievement tracker, it's a platform where
          gamers shape the experience for one another. Elevate your gameplay,
          showcase your creativity, and discover a whole new way to play.
        </p>
        <p className={classes.thanks}>
          Thank you for joining Tweakster! Together, we’re creating a new era of
          gameplay—one driven by imagination, collaboration, and the joy of
          shared challenges.
        </p>
      </div>
    </Card>
  )
}

export default AboutPage
