import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from "./Home"
import About from "./About"
import Contact from "./Contact"
import NoPage from '../Misc/NoPage'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import CompaignPage from './CompaignPage'
import AllCompaigns from './AllCompaigns'
const Frontend = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compaigns" element={<AllCompaigns />} />
        <Route path="/compaign/:id" element={<CompaignPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default Frontend