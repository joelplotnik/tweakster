import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

import { API_URL } from '../../constants/constants'
import SortDropdown from '../UI/SortDropdown'
import Tweak from './Tweak'
// import TweaksForm from './Forms/TweaksForm'
import classes from './Tweaks.module.css'

// import TweakVote from './TweakVote'

const Tweaks = ({ piece, pieceClassModalRef }) => {
  const [tweaks, setTweaks] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSortOption, setSelectedSortOption] = useState('top')
  const selectedSortOptionRef = useRef(selectedSortOption)
  const tweaksTitle = piece.tweaks_count === 1 ? 'Tweak' : 'Tweaks'
  const [isScrollableTargetAvailable, setScrollableTargetAvailable] =
    useState(false)

  useEffect(() => {
    if (pieceClassModalRef?.current || pieceClassModalRef === 'page') {
      setScrollableTargetAvailable(true)
    }
  }, [pieceClassModalRef])

  const handleSortChange = useCallback(
    option => {
      if (option === selectedSortOptionRef.current) {
        return
      }
      setTweaks([])
      setSelectedSortOption(option)
      setPage(1)
      setHasMore(true)
    },
    [selectedSortOptionRef]
  )

  const fetchTweaks = async currentPage => {
    try {
      const response = await fetch(
        `${API_URL}/channels/${piece.channel_id}/pieces/${piece.id}/tweaks?page=${currentPage}&sort=${selectedSortOption}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch tweaks')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error: ', error.message)
      toast.error('Error fetching tweaks')
    }
  }

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true)

      const { tweaks: tweaksFromServer, meta } = await fetchTweaks(page)

      if (Array.isArray(tweaksFromServer)) {
        if (selectedSortOption !== selectedSortOptionRef.current) {
          // If the selectedSortOption has changed, reset tweaks
          selectedSortOptionRef.current = selectedSortOption
          setTweaks(tweaksFromServer)
        } else {
          // If the selectedSortOption is the same, append fetched data to existing tweaks
          setTweaks(prevTweaks => [...prevTweaks, ...tweaksFromServer])
        }

        if (tweaksFromServer.length === 0 || !meta.has_more) {
          setHasMore(false)
        }
        setPage(prevPage => prevPage + 1)
      } else {
        console.error('Expected an array of tweaks')
      }

      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSortOption])

  return (
    <div className={classes.tweaks}>
      <div className={classes['header-container']}>
        <h2 className={classes.title}>
          {piece.tweaks_count} {tweaksTitle}
        </h2>
        {tweaks.length > 0 && <SortDropdown onSortChange={handleSortChange} />}
      </div>
      <div className={classes['tweak-layout']}>
        {tweaks.length === 0 && (
          <p className={classes.note}>Be the first to tweak this piece!</p>
        )}
        <div className={classes['tweaks-container']}>
          {tweaks.map(tweak => (
            <div key={tweak.id} className={classes['tweak-wrapper']}>
              <Tweak tweak={tweak} />
            </div>
          ))}
        </div>
        <div className={classes.pagination}>
          <button
            className={classes['load-more-button']}
            onClick={fetchData}
            disabled={isLoading || !hasMore}
          >
            {isLoading ? 'Loading...' : 'Load More Tweaks'}
          </button>
        </div>
      </div>
      {/* <TweaksForm piece={piece} /> */}
    </div>
  )
}

export default Tweaks
