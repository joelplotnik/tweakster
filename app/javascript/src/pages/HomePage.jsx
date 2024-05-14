import React from 'react';
import PieceList from '../components/Content/PieceList';
import ChannelList from '../components/Content/ChannelList';

import classes from './HomePage.module.css';

const HomePage = () => {
  return (
    <div>
      <div className={classes.container}>
        <div className={classes['piece-list']}>
          <PieceList isHomePage={true} />
        </div>
        <div className={classes['channel-list']}>
          <ChannelList />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
