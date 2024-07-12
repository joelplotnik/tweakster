import 'src/index.css'

import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from 'src/App'
import store from 'src/store/index'

Bugsnag.start({
  apiKey: 'd226b964835b12d27ee482c8652f45c3',
  enabledReleaseStages: ['production', 'staging'],
  plugins: [new BugsnagPluginReact()],
})

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)
const ErrorView = () => (
  <div>
    <p>Whoops you're not supposed to be here! Refresh and try again.</p>
  </div>
)
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ErrorBoundary FallbackComponent={ErrorView}>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>
)
