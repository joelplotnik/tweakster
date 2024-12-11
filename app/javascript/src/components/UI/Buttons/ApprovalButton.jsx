import { useState } from 'react'
import { RiAwardFill, RiAwardLine } from 'react-icons/ri'

import classes from './ApprovalButton.module.css'

const ApprovalButton = ({ approvalsCount }) => {
  const [isSelected, setIsSelected] = useState(false)

  const toggleSelected = () => {
    setIsSelected(prev => !prev)
  }

  return (
    <div className={classes['approval-button']} onClick={toggleSelected}>
      {isSelected ? (
        <RiAwardFill className={classes['icon-selected']} />
      ) : (
        <RiAwardLine className={classes['icon-unselected']} />
      )}
      <div
        className={`${classes['approval-count']} ${
          isSelected ? classes['selected'] : classes['unselected']
        }`}
      >
        {approvalsCount}
      </div>
    </div>
  )
}

export default ApprovalButton
