import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
    return (
        <footer className="bg-background border-t border-border pt-16 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="lg:col-span-1">
                        <img className="h-8 mb-6" src={assets.logo} alt="QuickAI" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Experience the power of AI with QuickAI.
Create smarter content and accelerate your learning with our suite of AI tools.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-6">Company</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">About us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy policy</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="font-semibold text-foreground mb-6">Subscribe to our newsletter</h3>
                        <p className="text-sm text-muted-foreground mb-4">Receive instant updates whenever we launch new features or improvements.</p>
                        <div className="flex gap-2 max-w-md">
                            <input
                                className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                type="email"
                                placeholder="Enter your email"
                            />
                            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Copyright {new Date().getFullYear()} © <a href="https://ashk.vercel.app" className="hover:text-primary transition-colors">Ashutosh</a>. All Right Reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer