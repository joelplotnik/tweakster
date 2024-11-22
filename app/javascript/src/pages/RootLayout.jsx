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
import { getTokenDuration } from '../util/auth'

const RootLayout = () => {
  const [refreshRoot, setRefreshRoot] = useState(false)
  const token = useLoaderData()
  const submit = useSubmit()
  const dispatch = useDispatch()
  const isUserLocalStorageChange = key => key === 'user'

  useEffect(() => {
    if (!token) {
      return
    }

    if (token === EXPIRED_TOKEN) {
      dispatch(userActions.clearUser())
      submit(null, { action: '/logout', method: 'POST' })
      return
    }

    const tokenDuration = getTokenDuration()

    setTimeout(async () => {
      dispatch(userActions.clearUser())
      submit(null, { action: '/logout', method: 'POST' })
    }, tokenDuration)
  }, [token, submit, dispatch])

  useEffect(() => {
    const handleStorageChange = event => {
      if (isUserLocalStorageChange(event.key)) {
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
