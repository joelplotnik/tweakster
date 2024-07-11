import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { RiDeleteBin7Line } from 'react-icons/ri';
import { toast } from 'react-toastify';

import classes from './Dropzone.module.css';

const Dropzone = ({ onImagesChange }) => {
  const [images, setImages] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (acceptedFiles?.length) {
        if (images.length < 3) {
          const file = acceptedFiles[0];
          const newImage = Object.assign(file, {
            preview: URL.createObjectURL(file),
          });
          setImages([...images, newImage]);
          onImagesChange([...images, newImage]);
        } else {
          toast.error('Maximum 3 images can be uploaded.');
        }
      }

      if (rejectedFiles?.length) {
        const file = rejectedFiles[0];
        const errorMessage = file.errors[0].message;
        toast.error(errorMessage);
      }
    },
    [images, onImagesChange]
  );

  const deleteImage = (index) => {
    URL.revokeObjectURL(images[index].preview);
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    onImagesChange(newImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    },
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div>
      <div className={classes['image-container']}>
        {images.length > 0 && (
          <div className={classes['dropzone-row']}>
            {images.map((image, index) => (
              <div
                key={index}
                className={classes['dropzone-container-wrapper']}
              >
                <div className={classes['dropzone-container']}>
                  <img
                    src={image.preview}
                    alt={image.name}
                    className={classes['image-preview']}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => deleteImage(index)}
                  className={classes['delete-button']}
                >
                  <RiDeleteBin7Line />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length < 3 && (
          <div
            {...getRootProps()}
            className={`${classes['dropzone-container']} ${
              classes['dropzone-container-empty']
            } ${isDragActive ? classes.active : ''}`}
          >
            <input {...getInputProps()} className={classes['dropzone-input']} />
            {isDragActive ? (
              <p className={classes['dropzone-text']}>Drop image here</p>
            ) : (
              <p className={classes['dropzone-text']}>
                Drag 'n' drop image or click to upload
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropzone;
