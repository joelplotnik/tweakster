import { useLocation, useRouteLoaderData } from 'react-router-dom';

import PieceForm from '../../components/Content/Forms/PieceForm';
import NoPieces from '../../components/Content/NoPieces';

import classes from './NewPiecePage.module.css';
import { API_URL } from '../../constants/constants';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const NewPiecePage = () => {
  const token = useRouteLoaderData('root');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const channelId = queryParams.get('channelId');
  const pieceId = queryParams.get('pieceId');
  const tweakText = queryParams.get('text') === 'true';
  const [pieceData, setPieceData] = useState(null);
  const [hasSubscriptions, setHasSubscriptions] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const typeRef = useRef('new');

  useEffect(() => {
    async function fetchData() {
      if (channelId && pieceId) {
        typeRef.current = 'tweak';

        const response = await fetch(
          `${API_URL}/channels/${channelId}/pieces/${pieceId}`
        );

        if (!response.ok) {
          throw new Error('Could not find piece');
        }

        const data = await response.json();
        setPieceData(data);
      }
    }

    async function checkSubscriptions() {
      const response = await fetch(
        `${API_URL}/subscriptions/check_user_subscriptions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Could not check user subscriptions');
      }

      const data = await response.json();
      setHasSubscriptions(data.hasSubscriptions);
    }

    async function fetchDataAndSubscriptions() {
      try {
        await Promise.all([fetchData(), checkSubscriptions()]);
        setDataReady(true);
      } catch (error) {
        console.error('Error:', error.message);
        toast.error('Error creating new piece');
      }
    }

    fetchDataAndSubscriptions();
  }, [channelId, pieceId, token]);

  return (
    <div className={classes['new-piece-page']}>
      <h1 className={classes.heading}>
        {typeRef.current === 'new' ? 'Create a piece' : 'Create a tweak piece'}
      </h1>
      <hr className={classes.divider} />
      {dataReady && hasSubscriptions ? (
        channelId && pieceId ? (
          pieceData ? (
            <PieceForm
              type={typeRef.current}
              piece={pieceData}
              tweakText={tweakText}
            />
          ) : (
            <p>Loading piece data...</p>
          )
        ) : (
          <PieceForm type={typeRef.current} />
        )
      ) : null}
      {dataReady && !hasSubscriptions && <NoPieces listPage={'new'} />}
    </div>
  );
};

export default NewPiecePage;
