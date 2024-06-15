import React from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { disableReactDevTools } from '@fvilers/disable-react-devtools'
import routes from './routes'

// if (process.env.REACT_APP_NODE_ENV === 'production') {
//   disableReactDevTools()
// }

const router = createBrowserRouter(routes)

function App() {
  return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
}

export default App
