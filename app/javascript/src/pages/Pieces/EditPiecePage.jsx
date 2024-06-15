import React, { useEffect } from 'react';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';

import PieceForm from '../../components/Content/Forms/PieceForm';

import classes from './EditPiecePage.module.css';

const EditPiecePage = () => {
  const piece = useRouteLoaderData('piece');
  const navigate = useNavigate();

  useEffect(() => {
    if (piece && piece.tweaks_count > 0) {
      navigate(`/channels/${piece.channel_id}/pieces/${piece.id}`);
    }
  }, [piece, navigate]);

  return (
    <div className={classes['edit-piece-page']}>
      <h1 className={classes.heading}>Edit piece</h1>
      <hr className={classes.divider} />
      <PieceForm type="edit" piece={piece} />
    </div>
  );
};

export default EditPiecePage;
