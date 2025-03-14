import React, { useState } from 'react'
import { Form, useActionData, useNavigation } from 'react-router-dom'

import CategorySelectDropdown from '../../UI/Buttons/CategorySelectDropdown'
import GameSelectDropdown from '../../UI/Buttons/GameSelectDropdown'
import Dropzone from '../../UI/Dropzone'
import classes from './ChallengeForm.module.css'

const ChallengeForm = () => {
  const data = useActionData()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const [selectedGame, setSelectedGame] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [image, setImage] = useState([])

  const handleGameSelect = game => {
    setSelectedGame(game)
  }
  const handleCategorySelect = category => {
    setSelectedCategory(category)
  }

  //   data.append('challenge[title]', data.get('title'))
  //   data.append('challenge[description]', data.get('description'))
  //   data.append('challenge[category]', data.get('category'))
  //   data.append('challenge[game]', data.get('game'))
  //   data.append('challenge[image]', data.get('image'))

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
        <GameSelectDropdown
          onGameSelect={handleGameSelect}
          selectedGame={selectedGame}
          isChallengeForm={true}
        />
        <input
          className={classes['title-input']}
          type="text"
          id="title"
          title="title"
          placeholder="Title"
          required
        />
        <Dropzone onImageChange={newImage => setImage(newImage)} />
        <CategorySelectDropdown
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
        />
        <textarea
          className={classes['form-textarea']}
          id="description"
          name="description"
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
