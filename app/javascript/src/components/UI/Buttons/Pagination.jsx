import React from 'react'

import classes from './Pagination.module.css'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = page => {
    onPageChange(page)
  }

  const isDisabled = totalPages === 0

  return (
    <div className={classes.pagination}>
      <button
        onClick={() => handlePageClick(1)}
        disabled={isDisabled || currentPage === 1}
        className={classes['pagination-button']}
      >
        First
      </button>
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={isDisabled || currentPage === 1}
        className={classes['pagination-button']}
      >
        Previous
      </button>
      <span className={classes['pagination-text']}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={isDisabled || currentPage === totalPages}
        className={classes['pagination-button']}
      >
        Next
      </button>
      <button
        onClick={() => handlePageClick(totalPages)}
        disabled={isDisabled || currentPage === totalPages}
        className={classes['pagination-button']}
      >
        Last
      </button>
    </div>
  )
}

export default Pagination
