import React, { useEffect, useState } from 'react'
import { fetchPersonalPieces, fetchPieces } from '../../store/pieces-actions'
import { piecesActions, selectAllPieces } from '../../store/pieces'
import { useDispatch, useSelector } from 'react-redux'

import { Error } from './Error'
import InfiniteScroll from 'react-infinite-scroll-component'
import NoPieces from './NoPieces'
import Piece from './Piece'
import PieceSkeleton from './Skeletons/PieceSkeleton'
import classes from './PieceList.module.css'
import { throttle } from 'lodash'

const PieceList = ({ isHomePage }) => {
  const dispatch = useDispatch()
  const pieces = useSelector(selectAllPieces)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const throttledFetchData = throttle(() => fetchData(), 500)

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true)

      const fetchThunk = isHomePage ? fetchPersonalPieces : fetchPieces

      try {
        const response = await dispatch(fetchThunk(page))

        if (response) {
          if (response.hasMore) {
            setPage(page + 1)
          } else {
            setHasMore(false)
          }
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    dispatch(piecesActions.resetPieces())
    throttledFetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMoreData = () => {
    if (!isLoading && hasMore) {
      throttledFetchData()
    }
  }

  if (error) {
    return <Error message={`Error: ${error}`} />
  }

  return (
    <>
      <h4>{isHomePage ? 'Home Feed' : 'Popular Pieces'}</h4>
      <InfiniteScroll
        dataLength={pieces.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={isLoading && <PieceSkeleton />}
        endMessage={
          <>
            {pieces.length === 0 ? (
              <NoPieces listPage={'main'} isHomePage={isHomePage} />
            ) : (
              <></>
            )}
          </>
        }
      >
        <div className={classes['piece-list']}>
          {pieces.map((piece) => (
            <Piece key={piece.id} piece={piece} />
          ))}
        </div>
      </InfiniteScroll>
    </>
  )
}

export default PieceList
