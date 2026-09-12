import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Chatbox from './components/Chatbox'
import Credits from './pages/Credits'
import { IoMenu } from 'react-icons/io5'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'
import Login from './pages/Login'
import {Toaster} from 'react-hot-toast';

const App = () => {
   const [ismenuopen, setismenuopen] = useState(false)
   const {user,loading} = useAppContext()
   console.log("hi from app.jsx");
   const {pathname} = useLocation()
   if(pathname === '/loading' || loading) return <Loading/>
  return (
    <>
    <Toaster position="top-right" />
    {!ismenuopen && <IoMenu className='fixed top-3 z-50 md:hidden   left-3 w-8 h-8 cursor-pointer
    dark:text-[#ffffff]' onClick={() => setismenuopen(true)}/>}
    {user ? (<div className='dark:bg-linear-to-b from-[#242124] to-[#000000] dark:text-white'>
    <div className='flex h-screen w-screen'>
      <Sidebar ismenuopen = {ismenuopen} setismenuopen = {setismenuopen}/>
      <Routes>
        <Route path='/' element={<Chatbox/>}/>
        <Route path='/credits' element={<Credits/>}/>
        <Route path='/loading' element={<Loading/>}/>
      </Routes>
    </div>
    </div>) : (<div><Login/></div>)}
    </>
  )
}

export default App
