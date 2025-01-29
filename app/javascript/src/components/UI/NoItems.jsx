import { useState } from 'react'
import { RiTreasureMapLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import AuthModal from './Modals/AuthModal'
import classes from './NoItems.module.css'

const NoItems = ({ item }) => {
  const token = useSelector(state => state.token.token)
  const user = useSelector(state => state.user.user)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const navigate = useNavigate()

  const handleClick = e => {
    if (!token) {
      e.preventDefault()
      setShowAuthModal(true)
    } else {
      navigate(`/users/${user?.username}/challenges/new`)
    }
  }

  return (
    <>
      <div className={classes['no-item']}>
        <div className={classes.body}>
          <RiTreasureMapLine className={classes.icon} />
          <div className={classes.text}>
            <h2>No {item}s here... yet!</h2>
            <p>
              The adventure hasn’t begun. Will you be the one to set things in
              motion?
            </p>
            <Link onClick={handleClick} className={classes.link}>
              Create a new challenge
            </Link>
          </div>
        </div>
      </div>
      {showAuthModal && (
        <AuthModal authType="login" onClick={() => setShowAuthModal(false)} />
      )}
    </>
  )
}

export default NoItems
