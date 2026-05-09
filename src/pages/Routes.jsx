import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Frontend from './Frontend'
import Auth from './Auth'
import { useAuthContext } from '../context/Auth'
import DonorDashboard from './DonorDashboard'
import Admin from './Admin'
import NgoDashboard from './NgoDashboard'
import PrivateRoute from '../components/PrivateRoute'

const Index = () => {
  const { user, isAuth } = useAuthContext()
  return (
    <Routes>
      <Route path='/*' element={<Frontend />} />
      <Route path='/auth/*' element={isAuth ? <Navigate to={user.role === "Ngo" ? "/dashboard/overview" : "/admin/overview"} /> : <Auth />} />
      {/* <Route path='/auth/*' element={!isAuth ? <Auth /> : <Navigate to="/" />} /> */}
      <Route path='/admin/*' element={<PrivateRoute Component={Admin} role="Admin" />} />
      {/* <Route path='/donor/*' element={<PrivateRoute Component={DonorDashboard} role="Donor" />} /> */}
      <Route path='/dashboard/*' element={<PrivateRoute Component={NgoDashboard} role="Ngo" />} />
    </Routes>
  )
}

export default Index