import React from 'react'
import { Route, Routes } from 'react-router-dom'
import NoPage from '../Misc/NoPage'
import Login from './Login'
import Register from './Register'

const Auth = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
    )
}

export default Auth