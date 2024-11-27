export const formatNumber = number => {
  if (number < 10000) {
    return number.toLocaleString()
  } else if (number < 100000) {
    return (number / 1000).toFixed(1) + 'k'
  } else if (number < 1000000) {
    return (number / 1000).toFixed(0) + 'k'
  } else if (number < 1000000000) {
    return (number / 1000000).toFixed(1) + 'm'
  } else {
    return (number / 1000000000).toFixed(1) + 'b'
  }
}
