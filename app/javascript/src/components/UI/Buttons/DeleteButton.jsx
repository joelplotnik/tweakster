import { RiDeleteBin7Line } from 'react-icons/ri'

import classes from './DeleteButton.module.css'

const DeleteButton = ({ onClick, label = 'Delete' }) => {
  const handleDelete = () => onClick?.()

  return (
    <div className={classes['delete-button']} onClick={handleDelete}>
      <RiDeleteBin7Line className={classes['icon']} />
      <span className={classes['text']}>{label}</span>
    </div>
  )
}

export default DeleteButton
