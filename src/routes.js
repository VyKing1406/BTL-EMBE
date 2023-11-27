import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const routes = [{ path: '/dashboard', name: 'Dashboard', element: Dashboard }]

export default routes
