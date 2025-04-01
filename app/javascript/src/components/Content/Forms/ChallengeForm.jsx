import React, { useRef, useState } from 'react'
import { Form, useActionData, useNavigation } from 'react-router-dom'

import CategorySelectDropdown from '../../UI/Buttons/CategorySelectDropdown'
import GameSelectDropdown from '../../UI/Buttons/GameSelectDropdown'
import classes from './ChallengeForm.module.css'

const ChallengeForm = () => {
  const data = useActionData()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const [selectedGame, setSelectedGame] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const fileInput = useRef(null)
  const [image, setImage] = useState(null)

  const handleGameSelect = game => {
    setSelectedGame(game)
  }

  const handleCategorySelect = category => {
    setSelectedCategory(category)
  }

  const handleImageUpload = event => {
    const file = event.target.files[0]

    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setImage(imageUrl)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
  }

  return (
    <>
      <Form
        method="POST"
        className={classes['form-container']}
        encType="multipart/form-data"
      >
        {data && data.errors && (
          <ul className={classes['form-error-list']}>
            {Object.values(data.errors).map(err => (
              <li className={classes['form-error']} key={err}>
                {err}
              </li>
            ))}
          </ul>
        )}
        <div className={classes['image-upload-container']}>
          {image && (
            <img
              src={image}
              alt="Uploaded preview"
              className={classes['image-preview']}
            />
          )}
          <input
            className={classes['file-input']}
            type="file"
            id="image"
            name="challenge[image]"
            accept="image/*"
            ref={fileInput}
            onChange={handleImageUpload}
          />
          {!image ? (
            <button
              className={classes['add-image-button']}
              onClick={event => {
                event.preventDefault()
                fileInput.current.click()
              }}
            >
              Add Image
            </button>
          ) : (
            <button
              type="button"
              className={classes['remove-image-button']}
              onClick={handleRemoveImage}
            >
              Remove Image
            </button>
          )}
        </div>

        <GameSelectDropdown
          onGameSelect={handleGameSelect}
          selectedGame={selectedGame}
          isChallengeForm={true}
        />
        <input
          className={classes['title-input']}
          type="text"
          id="title"
          name="challenge[title]"
          placeholder="Title"
          required
        />
        <CategorySelectDropdown
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
        />

        <textarea
          className={classes['form-textarea']}
          id="description"
          name="challenge[description]"
          placeholder="Description"
          defaultValue={''}
          required
        />

        <button
          type="submit"
          className={classes['form-submit-button']}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting' : 'Submit'}
        </button>
      </Form>
    </>
  )
}

export default ChallengeForm
