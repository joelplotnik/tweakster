import { RiFlag2Fill } from 'react-icons/ri'

import classes from './AttemptStatus.module.css'

const AttemptStatus = ({ status }) => {
  const renderIcon = () => {
    switch (status) {
      case 'Pending':
        return <RiFlag2Fill className={classes['pending']} />
      case 'In Progress':
        return <RiFlag2Fill className={classes['in-progress']} />
      case 'Complete':
        return <RiFlag2Fill className={classes['complete']} />
      default:
        return null
    }
  }

  return <div className={classes['attempt-status']}>{renderIcon()}</div>
}

export default AttemptStatus
