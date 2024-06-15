import 'src/index.css'

import App from 'src/App'
import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom/client'

import store from 'src/store/index'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)
