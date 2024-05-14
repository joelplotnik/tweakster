import React, { useState, useEffect } from 'react';

import classes from './CommentForm.module.css';

const PieceCommentForm = ({
  comment,
  parentId,
  onCancel,
  onSubmit,
  showCancel,
}) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (comment) {
      setMessage(comment.message);
    }
  }, [comment]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const commentId = comment ? comment.id : null;

    onSubmit(message, parentId, commentId);
    setMessage('');
    showCancel && onCancel();
  };

  return (
    <form className={classes['comment-form']} onSubmit={handleSubmit}>
      <textarea
        className={classes['comment-text-area']}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Add a comment..."
      />
      <div className={classes['button-container']}>
        <button className={classes['comment-submit-button']} type="submit">
          {comment ? 'Update Comment' : 'Comment'}
        </button>
        {showCancel && (
          <button
            className={classes['cancel-button']}
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default PieceCommentForm;
