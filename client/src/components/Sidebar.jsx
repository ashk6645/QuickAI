import { Protect, useClerk, useUser } from '@clerk/clerk-react';
import { Eraser, FileText, Hash, House, Image, LogOut, Scissors, SquarePen, Users, Briefcase, ChevronLeft, GraduationCap, ChevronRight } from 'lucide-react';
import React from 'react'
import { Link, NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const navItems = [
    { to: '/ai', label: 'Dashboard', Icon: House },
    { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
    { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
    { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
    { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
    { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
    { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
    { to: '/ai/job-opportunities', label: 'Job Opportunities', Icon: Briefcase },
    { to: '/ai/learning-resources', label: 'Learning Resources', Icon: GraduationCap },
    { to: '/ai/community', label: 'Community', Icon: Users },
]

import ThemeToggle from './ThemeToggle';

const Sidebar = ({ sidebar, setSidebar, isCollapsed, setIsCollapsed }) => {
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-full bg-background border-r border-border flex flex-col transition-all duration-300 ease-in-out ${sidebar ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'} fixed sm:relative z-50`}>

            {/* Logo Area */}
            <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-border`}>
                <Link to="/" className={isCollapsed ? 'hidden' : 'block'}>
                    <img src={assets.logo} alt="QuickAI" className="h-8" />
                </Link>
                <Link to="/" className={isCollapsed ? 'block' : 'hidden'}>
                    <img src={assets.logo_icon} alt="Q" className="h-8 w-8 object-contain" />
                </Link>

                <div className={`flex items-center gap-2 ${isCollapsed ? 'hidden' : ''}`}>
                    <ThemeToggle />
                    <button onClick={() => setSidebar(false)} className="sm:hidden text-muted-foreground">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className='flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar'>
                {navItems.map(({ to, label, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/ai'}
                        onClick={() => setSidebar(false)}
                        className={({ isActive }) => `
                        flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }
                    `}
                        title={isCollapsed ? label : ''}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                ))}
            </div>

            {/* User Profile */}
            <div className={`p-4 border-t border-border ${isCollapsed ? 'flex justify-center' : ''}`}>
                {!isCollapsed ? (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer group">
                        <div onClick={openUserProfile} className="flex items-center gap-3 flex-1 min-w-0">
                            <img src={user?.imageUrl} className='w-8 h-8 rounded-full bg-secondary' alt="" />
                            <div className="flex-1 min-w-0 text-left">
                                <p className='text-sm font-medium truncate text-foreground'>{user?.fullName}</p>
                                <p className='text-xs text-muted-foreground truncate'>
                                    <Protect plan='premium' fallback="Free Plan">Premium Plan</Protect>
                                </p>
                            </div>
                        </div>
                        <button onClick={signOut} className='text-muted-foreground hover:text-destructive transition-colors p-1'>
                            <LogOut className='w-4 h-4' />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <img
                            src={user?.imageUrl}
                            onClick={openUserProfile}
                            className='w-8 h-8 rounded-full bg-secondary cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all'
                            alt=""
                            title={user?.fullName}
                        />
                        <button onClick={signOut} className='text-muted-foreground hover:text-destructive transition-colors p-1' title="Sign Out">
                            <LogOut className='w-4 h-4' />
                        </button>
                    </div>
                )}
            </div>

            {/* Collapse Toggle (Desktop Only) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background border border-border rounded-full items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shadow-sm z-50"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

        </div>
    )
}
export default Sidebar