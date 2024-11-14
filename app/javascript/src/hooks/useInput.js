import { useState } from 'react'

const useInput = (validateValue, initialValue = '') => {
  const [enteredValue, setEnteredValue] = useState(initialValue)
  const [isTouched, setIsTouched] = useState(false)

  const valueIsValid = validateValue(enteredValue)
  const hasError = !valueIsValid && isTouched && enteredValue !== ''

  const valueChangeHandler = event => {
    setEnteredValue(event.target.value)
  }

  const handleInputBlur = () => {
    setIsTouched(true)
  }

  const reset = () => {
    setEnteredValue(initialValue)
    setIsTouched(false)
  }

  return {
    value: enteredValue,
    isValid: valueIsValid,
    hasError,
    valueChangeHandler,
    handleInputBlur,
    reset,
  }
}

export default useInput
