import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

import ThemeToggle from '../components/ThemeToggle'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  return user ? (
    <div className='flex h-screen bg-secondary overflow-hidden'>
      {/* Sidebar */}
      <Sidebar
        sidebar={sidebarOpen}
        setSidebar={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>

        {/* Mobile Header */}
        <div className='sm:hidden flex items-center justify-between p-4 bg-background border-b border-border'>
          <button onClick={() => setSidebarOpen(true)} className='p-2 -ml-2 text-muted-foreground hover:text-foreground'>
            <Menu className='w-6 h-6' />
          </button>
          <span className='font-medium text-foreground'>QuickAI</span>
          <ThemeToggle />
        </div>

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth'>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  ) : (
    <div className='flex items-center justify-center h-screen bg-secondary'>
      <SignIn />
    </div>
  )
}

export default Layout