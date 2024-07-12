import { throttle } from 'lodash'
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import { API_URL } from '../../constants/constants'
import { getAuthToken } from '../../util/auth'
import Error from './Error'
import NoPieces from './NoPieces'
import Piece from './Piece'
import classes from './PieceList.module.css'
import PieceSkeleton from './Skeletons/PieceSkeleton'

const PieceList = ({ isHomePage }) => {
  const [pieces, setPieces] = useState([])
  const [pieceIds, setPieceIds] = useState(new Set())
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const throttledFetchData = throttle(() => fetchData(), 500)

  const fetchPieces = async currentPage => {
    try {
      const fetchUrl = isHomePage
        ? `${API_URL}/personal_feed?page=${currentPage}`
        : `${API_URL}?page=${currentPage}`

      const token = isHomePage ? getAuthToken() : null
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(isHomePage && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pieces')
      }

      const data = await response.json()
      return data
    } catch (error) {
      setError(error.message)
    }
  }

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true)

      const piecesFromServer = await fetchPieces(page)

      if (piecesFromServer) {
        const newPieces = piecesFromServer.filter(
          piece => !pieceIds.has(piece.id)
        )

        setPieces([...pieces, ...newPieces])
        setPieceIds(new Set([...pieceIds, ...newPieces.map(piece => piece.id)]))

        if (newPieces.length === 0) {
          setHasMore(false)
        }
        setPage(page + 1)
      }

      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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
          {pieces.map(piece => (
            <Piece key={piece.id} piece={piece} />
          ))}
        </div>
      </InfiniteScroll>
    </>
  )
}

export default PieceList
