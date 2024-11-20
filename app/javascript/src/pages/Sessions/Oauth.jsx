import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

import Loading from '../../components/UI/Loading'
import { userActions } from '../../store/user'
import { storeTokens } from '../../util/auth'

const OauthCallback = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const encodedData = searchParams.get('data')

    if (encodedData) {
      try {
        const decodedData = atob(encodedData)
        const userTokenData = JSON.parse(decodedData)

        const { token, refresh_token, expires_in, resource_owner } =
          userTokenData

        storeTokens(token, refresh_token, expires_in)

        const { id, username, avatar_url, role } = resource_owner
        dispatch(userActions.setUser({ id, username, avatar_url, role }))
      } catch (error) {
        console.error('Error decoding data:', error)
        toast.error('Failed to parse OAuth callback data.')
      }
    } else {
      toast.error('No callback data found.')
    }

    const previousPath = localStorage.getItem('previous') || '/'
    localStorage.removeItem('previous')
    window.location.href = previousPath
  }, [dispatch])

  return <Loading text={'Loading your Twitch vibes...'} />
}

export default OauthCallback
