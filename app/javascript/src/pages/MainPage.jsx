import React from 'react';
import MischiefMakers from '../components/Content/MischiefMakers';
import PieceList from '../components/Content/PieceList';
import ChannelList from '../components/Content/ChannelList';

import classes from './MainPage.module.css';

const MainPage = () => {
  return (
    <div>
      <div className={classes['mischief-list']}>
        <MischiefMakers />{' '}
      </div>
      <div className={classes.container}>
        <div className={classes['piece-list']}>
          <PieceList />
        </div>
        <div className={classes['channel-list']}>
          <ChannelList />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
