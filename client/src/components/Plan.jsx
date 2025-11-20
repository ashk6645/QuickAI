import React from 'react'
import { PricingTable } from '@clerk/clerk-react'
import { useTheme } from '../context/ThemeContext'
import { dark } from '@clerk/themes'

const Plan = () => {
  const { theme } = useTheme()

  return (
    <div className='py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center max-w-3xl mx-auto mb-16'>
          <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-4'>Choose Your Plan</h2>
          <p className='text-lg text-muted-foreground'>
            Start for free and scale up as you grow. Find the perfect plan for your content creation needs.
          </p>
        </div>
        <div className='flex justify-center'>
          <div className='w-full max-w-4xl'>
            <PricingTable
              appearance={{
                baseTheme: theme === 'dark' ? dark : undefined,
                variables: {
                  colorPrimary: '#6366f1',
                  colorText: theme === 'dark' ? '#f8fafc' : '#0f172a',
                  colorBackground: theme === 'dark' ? '#1e293b' : '#ffffff',
                  colorInputBackground: theme === 'dark' ? '#0f172a' : '#f1f5f9',
                  colorInputText: theme === 'dark' ? '#f8fafc' : '#0f172a',
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Plan