import { useSelector } from 'react-redux'

import AttemptsList from '../../components/Content/Lists/AttemptsList'
import classes from './PendingAttemptsPage.module.css'

const PendingAttemptsPage = () => {
  const user = useSelector(state => state.userPage.user)

  return (
    <div className={classes['pending-attempts-page']} key={user.id}>
      <h1 className={classes.heading}>Pending attempts</h1>
      <hr className={classes.divider} />
      <AttemptsList isPendingAttemptsPage={true} />
    </div>
  )
}

export default PendingAttemptsPage
