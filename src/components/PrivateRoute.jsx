import React from 'react'
import { useAuthContext } from '../context/Auth'
import { Navigate, useNavigate } from 'react-router-dom'

const PrivateRoute = ({ Component, role }) => {
    const { isAuth, user } = useAuthContext()
    if (!isAuth) {
        return <Navigate to='/auth/login' />
    }
    if (user?.role !== role) {
        return <Navigate to="/" />;
    }
    return <Component />
}

export default PrivateRoute
