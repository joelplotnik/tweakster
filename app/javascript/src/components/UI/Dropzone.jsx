import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { RiDeleteBin7Line } from 'react-icons/ri'
import { toast } from 'react-toastify'

import classes from './Dropzone.module.css'

const SingleImageDropzone = ({ onImageChange }) => {
  const [image, setImage] = useState(null)

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (acceptedFiles?.length) {
        const file = acceptedFiles[0]
        const newImage = Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
        setImage(newImage)
        onImageChange(newImage)
      }

      if (rejectedFiles?.length) {
        const file = rejectedFiles[0]
        const errorMessage = file.errors[0].message
        toast.error(errorMessage)
      }
    },
    [onImageChange]
  )

  const deleteImage = () => {
    if (image) {
      URL.revokeObjectURL(image.preview)
      setImage(null)
      onImageChange(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
  })

  return (
    <div className={classes['image-container']}>
      {image ? (
        <div className={classes['dropzone-row']}>
          <div className={classes['dropzone-container-wrapper']}>
            <div className={classes['dropzone-container']}>
              <img
                src={image.preview}
                alt={image.name}
                className={classes['image-preview']}
              />
            </div>
            <button
              type="button"
              onClick={deleteImage}
              className={classes['delete-button']}
            >
              <RiDeleteBin7Line />
            </button>
          </div>
        </div>
      ) : (
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
              Drag 'n' drop an image or click to upload
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default SingleImageDropzone
