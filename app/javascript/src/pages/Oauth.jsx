import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import Loading from '../components/UI/Loading'
import { userActions } from '../store/user'
import { storeTokens } from '../util/auth'

const OauthCallback = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash.substring(1)

    if (hash) {
      try {
        const decodedData = atob(hash)
        const userTokenData = JSON.parse(decodedData)
        const {
          access_token,
          refresh_token,
          expires_in,
          id,
          username,
          avatar_url,
          role,
        } = userTokenData

        storeTokens(access_token, refresh_token, expires_in)

        dispatch(userActions.setUser({ id, username, avatar_url, role }))
      } catch (error) {
        console.error('Error decoding data:', error)
        toast.error('Failed to parse OAuth callback data.')
      }
    } else {
      toast.error('No callback data found.')
    }

    const previousPath = localStorage.getItem('previousPath') || '/'
    window.location.href = previousPath
  }, [dispatch, navigate])

  return <Loading text={'Loading your Twitch vibes...'} />
}

export default OauthCallback
