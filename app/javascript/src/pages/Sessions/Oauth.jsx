import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import Loading from '../../components/UI/Loading'
import { storeTokens } from '../../util/auth'

const OauthCallback = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const error = searchParams.get('error')
    const status = searchParams.get('status')
    const encodedData = searchParams.get('data')

    const handleError = message => {
      if (message) toast.error(message)
      setIsLoading(false)
      navigate('/')
    }

    if (error) {
      const decodedError = decodeURIComponent(error)
      console.error(`OAuth error (${status}):`, decodedError)
      handleError(decodedError || 'OAuth authentication failed.')
      return
    }

    if (!encodedData) {
      handleError('No callback data found.')
      return
    }

    try {
      const decodedData = atob(encodedData)
      const userTokenData = JSON.parse(decodedData)
      const { token, refresh_token, expires_in } = userTokenData

      storeTokens(token, refresh_token, expires_in)

      const previousPath = localStorage.getItem('previous') || '/'
      localStorage.removeItem('previous')
      window.location.href = previousPath
    } catch (error) {
      console.error('Error decoding data:', error)
      handleError('Failed to parse OAuth callback data.')
    }
  }, [navigate])

  return isLoading ? <Loading text={'Summoning your details...'} /> : null
}

export default OauthCallback
