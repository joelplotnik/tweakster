import AboutPage from '../pages/General/AboutPage'
import NotificationsPage from '../pages/General/NotificationsPage'
import PopularPage from '../pages/General/PopularPage'

const generalRoutes = [
  {
    path: 'notifications',
    element: <NotificationsPage />,
  },
  {
    path: 'popular',
    element: <PopularPage />,
  },
  {
    path: 'about',
    element: <AboutPage />,
  },
]

export default generalRoutes
