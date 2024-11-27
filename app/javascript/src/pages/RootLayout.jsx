import 'react-toastify/dist/ReactToastify.css'

import './Toastify.css'

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet, useLoaderData, useSubmit } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import Footer from '../components/Footer/Footer'
import MainNavigation from '../components/Header/MainNavigation'
import ScrollToTop from '../components/Misc/ScrollToTop'
import { EXPIRED_TOKEN } from '../constants/constants'
import { CableProvider } from '../context/Cable'
import RefreshContext from '../context/refresh'
import { userActions } from '../store/user'
import { fetchUserData } from '../store/user-actions'
import { getTokenDuration, refreshAuthToken } from '../util/auth'

const RootLayout = () => {
  const [refreshRoot, setRefreshRoot] = useState(false)
  const token = useLoaderData()
  const submit = useSubmit()
  const dispatch = useDispatch()

  useEffect(() => {
    let logoutTimeout

    const handleTokenExpiration = async () => {
      const refreshedToken = await refreshAuthToken()
      if (!refreshedToken) {
        handleLogout()
      } else {
        const newTokenDuration = getTokenDuration()
        logoutTimeout = setTimeout(
          handleTokenExpiration,
          newTokenDuration - 5000
        )
      }
    }

    if (token && token !== EXPIRED_TOKEN) {
      dispatch(fetchUserData())
      const tokenDuration = getTokenDuration()

      logoutTimeout = setTimeout(handleTokenExpiration, tokenDuration - 5000)
    } else if (token === EXPIRED_TOKEN) {
      handleLogout()
    }

    return () => clearTimeout(logoutTimeout)
  }, [token, dispatch, submit])

  const handleLogout = () => {
    dispatch(userActions.clearUser())
    submit(null, { action: '/logout', method: 'POST' })
  }

  useEffect(() => {
    const handleStorageChange = event => {
      if (event.key === 'token') {
        setRefreshRoot(true)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    if (refreshRoot) {
      setRefreshRoot(false)
      window.location.reload()
    }
  }, [refreshRoot])

  return (
    <RefreshContext.Provider value={setRefreshRoot}>
      {/* <CableProvider token={token}> */}
      <ToastContainer
        position="bottom-center"
        theme="colored"
        pauseOnHover={false}
        autoClose={5000}
        closeOnClick={true}
        hideProgressBar={false}
        limit={5}
      />
      <MainNavigation />
      <main>
        <>
          <ScrollToTop />
          <Outlet />
        </>
      </main>
      <Footer />
      {/* </CableProvider> */}
    </RefreshContext.Provider>
  )
}

export default RootLayout
