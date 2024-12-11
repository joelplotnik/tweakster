import { RiSkullLine } from 'react-icons/ri'

import classes from './ReportButton.module.css'

const ReportButton = () => {
  const handleClick = () => {
    // Placeholder for report action (future implementation)
    console.log('Report button clicked')
  }

  return (
    <div className={classes['report-button']} onClick={handleClick}>
      <RiSkullLine className={classes['icon']} />
      <span className={classes['text']}>Report</span>
    </div>
  )
}

export default ReportButton
