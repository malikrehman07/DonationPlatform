import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AddCompaign from './AddCompaign'
import AllCompaign from './AllCompaigns'
import EditCompaign from './EditCompaign'

const Compaigns = () => {
  return (
    <Routes>
      <Route path='/add' element={<AddCompaign/>} />
      <Route path='/all' element={<AllCompaign/>} />
      <Route path='/edit/:id' element={<EditCompaign/>} />
    </Routes>
  )
}

export default Compaigns