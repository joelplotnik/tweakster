import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

import Loading from '../../components/UI/Loading'
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

        const { token, refresh_token, expires_in } = userTokenData

        storeTokens(token, refresh_token, expires_in)
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
