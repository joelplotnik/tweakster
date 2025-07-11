export const formatNumber = number => {
  if (number < 10000) {
    return number.toLocaleString()
  } else if (number < 100000) {
    return Math.floor((number / 1000) * 10) / 10 + 'k'
  } else if (number < 1000000) {
    return Math.floor((number / 1000) * 10) / 10 + 'k'
  } else if (number < 1000000000) {
    return Math.floor((number / 1000000) * 10) / 10 + 'm'
  } else {
    return Math.floor((number / 1000000000) * 10) / 10 + 'b'
  }
}

export const formatDate = isoString => {
  if (!isoString) return 'Unknown'

  const date = new Date(isoString)

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  return date.toLocaleDateString(undefined, options)
}
