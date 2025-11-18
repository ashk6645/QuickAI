import React, { use, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const {user} = useUser()


  return user ? (
    <div className='flex flex-col items-start justify-start h-screen overflow-hidden'>
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200 flex-shrink-0'>
        <img className='cursor-pointer w-32 sm:w-44' src={assets.logo} alt="" onClick={()=>navigate('/')}/>
        {
          sidebar ? <X onClick={()=> setSidebar(false)} className='w-6 h-6 text-gray-600 sm:hidden'/> 
          : <Menu onClick={()=> setSidebar(true)} className='w-6 h-6 text-gray-600 sm:hidden'/>
        }
      </nav>
      <div className='flex-1 w-full flex overflow-hidden'>
        <div className='hidden sm:block flex-shrink-0'>
          <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        </div>
        <div className={`sm:hidden absolute top-14 bottom-0 z-50 ${sidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
          <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        </div>
        <div className='flex-1 bg-[#F4F7FB] overflow-hidden'>
         <Outlet />
        </div>
      </div>
     
    </div>
  ) : (
    <div className='flex items-center justify-center h-screen'>
      <SignIn />

    </div>
  )
}

export default Layout
