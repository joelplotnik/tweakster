import React from 'react';
import classes from './AboutPage.module.css';
import Card from '../components/UI/Card';

function AboutPage() {
  return (
    <Card className={classes.card}>
      <div className={classes['about-page']}>
        <h1>Welcome to Tweakster</h1>
        <p className={classes['mission-statement']}>
          Our mission is to empower individuals to make informed decisions by
          providing a platform to rate the integrity of content pieces and
          fine-tune them for accuracy and reliability.
        </p>
        <p className={classes.description}>
          The name Tweakster represents the idea of refining information to make
          it more accurate and reliable. At Tweakster, we believe that everyone
          can contribute to a more informed and enlightened society by sharing
          accurate information and working together to create a more accurate
          and reliable picture of the world.
        </p>
        <p className={classes.goal}>
          Our platform allows users to rate content pieces considering several
          criteria, including accuracy, factualness, and objectivity.
          Additionally, users can fine-tune and refine content pieces for
          accuracy and reliability, enabling them to actively participate in
          promoting the highest standards of journalism. With just one click of
          a button, users can contribute to helping others make informed
          decisions based on reliable information.
        </p>
        <p className={classes.thanks}>
          Thank you for choosing Tweakster and joining us in our mission to
          promote integrity and honesty in journalism.
        </p>
      </div>
    </Card>
  );
}

export default AboutPage;
