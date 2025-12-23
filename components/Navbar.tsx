'use client'

import Link from 'next/link'
import { useUserRole } from '@/hooks/useUserRole'
import { LogOut, User as UserIcon, Menu } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navbar() {
    const { user, role, loading } = useUserRole()
    const supabase = createClient()
    const router = useRouter()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm py-2' : 'bg-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <div className="w-5 h-5 border-2 border-white rounded-full"></div>
                        </div>
                        <Link href="/" className={`text-2xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                            Medi<span className="text-blue-600">Token</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {loading ? (
                            <div className="flex items-center space-x-4 animate-pulse">
                                <div className="hidden md:block h-4 w-24 bg-slate-200 rounded"></div>
                                <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                                <div className="h-4 w-20 bg-slate-200 rounded hidden md:block"></div>
                            </div>
                        ) : (
                            <>
                                {user ? (
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center gap-3 mr-2">
                                            <div className="hidden md:flex flex-col items-end">
                                                <span className="text-base font-bold text-slate-900">
                                                    {user.user_metadata?.name || 'User'}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                    }`}>
                                                    {role?.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white ring-2 ring-blue-50">
                                                {user.user_metadata?.name ? user.user_metadata.name[0].toUpperCase() : 'U'}
                                            </div>
                                        </div>

                                        {role === 'admin' ? (
                                            <Link href="/admin/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                                Dashboard
                                            </Link>
                                        ) : (
                                            <Link href="/my-appointments" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                                My Appointments
                                            </Link>
                                        )}

                                        <div className="h-6 w-px bg-slate-200"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-500 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            <span className="hidden md:inline">Sign Out</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link href="/login">
                                            <button className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                                Login
                                            </button>
                                        </Link>
                                        <Link href="/register">
                                            <button className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                                Get Started
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                        <button className="md:hidden p-2 text-slate-600">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
