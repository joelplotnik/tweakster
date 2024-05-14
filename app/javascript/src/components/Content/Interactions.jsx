import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { selectPieceById } from '../../store/pieces';
import Comments from './Comments';
import Tweaks from './Tweaks';

import classes from './Interactions.module.css';

const Interactions = ({ pieceId, pieceClassModalRef }) => {
  const location = useLocation();
  const navigate = useNavigate();
  let inPiecesSlice;
  const piece = useSelector((state) => {
    const selectedPiece = selectPieceById(state, pieceId);
    inPiecesSlice = !!selectedPiece;
    return selectedPiece || state.piece.piece;
  });
  const [activeTab, setActiveTab] = useState('comments');

  useEffect(() => {
    const tabState = location.state && location.state.tab;

    if (tabState) {
      setActiveTab(tabState);
    } else {
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');

      if (tabParam === 'tweaks') {
        setActiveTab('tweaks');
      } else {
        setActiveTab('comments');
      }
    }
  }, [location.state, location.search]);

  const handleTabClick = (tab) => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');

    if (tabParam) {
      params.set('tab', tab);
      navigate(`${location.pathname}?${params}`, { replace: true });
    }

    setActiveTab(tab);
  };

  return (
    <>
      <div className={classes['tab-container']}>
        <button
          className={`${classes.tab} ${
            activeTab === 'comments' ? `${classes.active}` : ''
          }`}
          onClick={() => handleTabClick('comments')}
        >
          {piece.comments_count} Comments
        </button>
        <button
          className={`${classes.tab} ${
            activeTab === 'tweaks' ? `${classes.active}` : ''
          }`}
          onClick={() => handleTabClick('tweaks')}
        >
          {piece.tweaks_count} Tweaks
        </button>
      </div>

      {activeTab === 'comments' && (
        <div>
          <Comments
            piece={piece}
            inPiecesSlice={inPiecesSlice}
            pieceClassModalRef={pieceClassModalRef}
          />
        </div>
      )}

      {activeTab === 'tweaks' && (
        <div>
          <Tweaks piece={piece} pieceClassModalRef={pieceClassModalRef} />
        </div>
      )}
    </>
  );
};

export default Interactions;
