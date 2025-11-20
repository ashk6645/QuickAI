import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'

import ThemeToggle from './ThemeToggle'

const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { openSignIn } = useClerk()

  return (
    <div className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md h-16 flex items-center justify-between px-4 sm:px-8 lg:px-12 transition-all border-b border-border/40'>
      <img
        src={assets.logo}
        alt="QuickAI"
        className='h-10 cursor-pointer'
        onClick={() => navigate('/')}
      />

      <div className="flex items-center gap-4">
        <ThemeToggle />
        {user ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9"
              }
            }}
          />
        ) : (
          <button
            onClick={openSignIn}
            className='group flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md'
          >
            Get Started
            <ArrowRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform' />
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar