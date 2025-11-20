import React from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const AiTools = () => {
    const navigate = useNavigate()
    const { user } = useUser()

    return (
        <div className='py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30'>
            <div className='max-w-5xl mx-auto'>
                <div className='text-center max-w-3xl mx-auto mb-16'>
                    <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-4'>Powerful AI Tools</h2>
                    <p className='text-lg text-muted-foreground'>
                        Everything you need to create, enhance, and optimize your content with cutting-edge AI technology.
                    </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {AiToolsData.map((tools, index) => (
                        <div
                            key={index}
                            className='group bg-card p-6 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer'
                            onClick={() => user && navigate(tools.path)}
                        >
                            <div
                                className='w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110'
                                style={{ background: `linear-gradient(135deg, ${tools.bg.from}, ${tools.bg.to}` }}
                            >
                                <tools.Icon className='w-6 h-6 text-white' />
                            </div>

                            <h3 className='text-xl font-semibold text-foreground mb-2'>{tools.title}</h3>
                            <p className='text-sm text-muted-foreground leading-relaxed'>{tools.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AiTools