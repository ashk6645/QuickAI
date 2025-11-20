import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const Hero = () => {
  const navigate = useNavigate()

  return (
    <div className='relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 overflow-hidden bg-background'>
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 opacity-30" />

      <div className='text-center max-w-4xl mx-auto space-y-8'>


        <h1 className='text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]'>
          Create amazing content <br />
          with <span className='text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600'>AI tools</span>
        </h1>

        <p className='max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed'>
          Transform your content creation with our suite of premium AI tools.
          Write articles, generate images, and enhance your workflow in seconds.
        </p>

        <div className='flex flex-col sm:flex-row items-center justify-center gap-4 pt-4'>
          <button
            onClick={() => navigate('/ai')}
            className='group relative px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden'
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Creating Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>

        </div>
      </div>

      {/* UI Preview / Mockup could go here */}
      <div className="mt-20 w-full max-w-5xl mx-auto rounded-xl border border-border shadow-2xl bg-card/50 backdrop-blur-sm p-2 transform rotate-x-12 perspective-1000 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
        <div className="aspect-video rounded-lg bg-secondary/50 overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            UI Preview Placeholder
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero