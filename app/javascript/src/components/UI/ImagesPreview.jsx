import React from 'react';
import classes from './Dropzone.module.css';

const ImagesPreview = ({ imageUrls }) => {
  return (
    <div className={classes['image-container']}>
      {imageUrls.map((imageUrl, index) => (
        <div key={index} className={classes['dropzone-container-preview']}>
          <img
            src={imageUrl}
            alt={`${index + 1}`}
            className={classes['image-preview']}
          />
        </div>
      ))}
    </div>
  );
};

export default ImagesPreview;
