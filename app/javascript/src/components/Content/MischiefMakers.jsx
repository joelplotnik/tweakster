import React, { useEffect, useState } from 'react'

import { API_URL } from '../../constants/constants'
import { MischiefCard } from '../UI/MischiefCard'
import { Error } from './Error'
import classes from './MischiefMakers.module.css'
import MischiefMakerSkeleton from './Skeletons/MischiefMakerSkeleton'

const MischiefMakers = () => {
  const [mischiefMakers, setMischiefMakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/mischief_makers`)
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const data = await response.json()
        setMischiefMakers(data)
      } catch (error) {
        console.error('Error: ', error.message)
        setError('Failed to fetch mischief makers')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <MischiefMakerSkeleton />
  }

  if (error) {
    return <Error message={`Error: ${error}`} />
  }

  return (
    <>
      {mischiefMakers.length > 0 && <h4>Mischief Makers</h4>}
      <div className={classes.container}>
        {mischiefMakers.map(piece => (
          <MischiefCard key={piece.id} piece={piece} />
        ))}
      </div>
    </>
  )
}

export default MischiefMakers
