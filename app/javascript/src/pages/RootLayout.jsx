import 'react-toastify/dist/ReactToastify.css'
import './Toastify.css'

import {
  Outlet,
  Route,
  Routes,
  useLoaderData,
  useLocation,
  useSubmit,
} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'

import ChannelPage from './Channels/ChannelPage'
import ChannelsLayout from './Channels/ChannelsLayout'
import ChannelsPage from './Channels/ChannelsPage'
import { EXPIRED_TOKEN } from '../constants/constants'
import Footer from '../components/Footer/Footer'
import HomePage from './HomePage'
import MainNavigation from '../components/Header/MainNavigation'
import MainPage from './MainPage'
import NewChannelPage from './Channels/NewChannelPage'
import PieceModal from '../components/UI/Modals/PieceModal'
import RefreshContext from '../context/refresh'
import ScrollToTop from '../components/ScrollToTop'
import { ToastContainer } from 'react-toastify'
import UserPage from './Users/UserPage'
import UsersLayout from './Users/UsersLayout'
import UsersPage from './Users/UsersPage'
import { getTokenDuration } from '../util/auth'
import { selectPieceById } from '../store/pieces'
import { userActions } from '../store/user'

const RootLayout = () => {
  const [refreshRoot, setRefreshRoot] = useState(false)
  const [userKey, setUserKey] = useState(null)
  const token = useLoaderData()
  const submit = useSubmit()
  const dispatch = useDispatch()
  let location = useLocation()
  let background = location.state && location.state.background

  const isUserLocalStorageChange = (key) => key === 'user'

  const id = location.pathname.split('/')[2]
  const pieceListPage =
    location.pathname === `/channels/${id}` ||
    location.pathname === `/users/${id}` ||
    location.pathname === `/main` ||
    location.pathname === `/`

  const pieceId = location.pathname.split('/')[4]
  const piece = useSelector((state) => {
    const selectedPiece = selectPieceById(state, pieceId)
    return selectedPiece || state.piece.piece
  })

  useEffect(() => {
    if (
      location.pathname === `/users/${id}` ||
      location.pathname === `/channels/${id}`
    ) {
      setUserKey(id)
    }
  }, [location.pathname, id])

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
    }, tokenDuration) // set to 2 hours in AuthModal.js
  }, [token, submit, dispatch])

  useEffect(() => {
    const handleStorageChange = (event) => {
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
        {background && piece && (
          <Routes>
            <Route path="channels/:id/pieces/:id" element={<PieceModal />} />
          </Routes>
        )}
        {background || pieceListPage ? (
          <Routes location={background || location}>
            <Route
              path="/"
              element={
                <>
                  <ScrollToTop />
                  {token ? <HomePage /> : <MainPage />}
                </>
              }
            />
            <Route
              path="/main"
              element={
                <>
                  <ScrollToTop />
                  <MainPage />
                </>
              }
            />
            <Route
              path="channels"
              element={
                <>
                  <ScrollToTop />
                  <ChannelsLayout />
                </>
              }
            >
              <Route index element={<ChannelsPage />} />
              <Route path=":id" element={<ChannelPage key={userKey} />} />
              <Route path="new" element={<NewChannelPage />} />
            </Route>
            <Route
              path="users"
              element={
                <>
                  <ScrollToTop />
                  <UsersLayout />
                </>
              }
            >
              <Route index element={<UsersPage />} />
              <Route path=":id" element={<UserPage key={userKey} />} />
            </Route>
          </Routes>
        ) : (
          <>
            <ScrollToTop />
            <Outlet />
          </>
        )}
      </main>
      <Footer />
    </RefreshContext.Provider>
  )
}

export default RootLayout
