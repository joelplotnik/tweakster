import ActionCable from 'actioncable'
import React from 'react'

import { WS_URL } from '../constants/constants'

const CableContext = React.createContext()

function CableProvider({ children, token }) {
  if (!token) {
    return <>{children}</>
  }

  const actionCableUrl =
    process.env.NODE_ENV === 'production'
      ? `wss://tweakster.com/cable?token=${token}`
      : `${WS_URL}?token=${token}`

  const CableApp = {}
  CableApp.cable = ActionCable.createConsumer(actionCableUrl)

  return (
    <CableContext.Provider value={CableApp}>{children}</CableContext.Provider>
  )
}

export { CableContext, CableProvider }
