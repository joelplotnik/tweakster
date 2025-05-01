import { RiEditBoxLine, RiHammerLine } from 'react-icons/ri'

import classes from './ChangeButton.module.css'

const ChangeButton = ({ label = 'Edit' }) => {
  const Icon = label.toLowerCase() === 'update' ? RiHammerLine : RiEditBoxLine

  return (
    <div className={classes['edit-button']}>
      <Icon className={classes['icon']} />
      <span className={classes['text']}>{label}</span>
    </div>
  )
}

export default ChangeButton
