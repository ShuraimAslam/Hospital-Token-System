'use client'

import AdminGuard from '@/components/AdminGuard'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, Stethoscope, ChevronRight } from 'lucide-react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        doctors: 0,
        activeQueues: 0,
        totalAppointments: 0
    })
    const supabase = createClient()

    useEffect(() => {
        const fetchStats = async () => {
            // Parallel fetching
            const doctorsPromise = supabase.from('doctors').select('*', { count: 'exact', head: true })
            const activeDoctorsPromise = supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('is_active', true)
            const appointmentsPromise = supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', new Date().toISOString().split('T')[0])

            const [doctorsRes, activeRes, appointmentsRes] = await Promise.all([doctorsPromise, activeDoctorsPromise, appointmentsPromise])

            setStats({
                doctors: doctorsRes.count || 0,
                activeQueues: activeRes.count || 0,
                totalAppointments: appointmentsRes.count || 0
            })
        }
        fetchStats()
    }, [])

    return (
        <AdminGuard>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                                <Stethoscope size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{stats.doctors}</span>
                        </div>
                        <h3 className="text-gray-500 font-medium">Total Doctors</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-100 p-3 rounded-xl text-green-600">
                                <Users size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{stats.activeQueues}</span>
                        </div>
                        <h3 className="text-gray-500 font-medium">Active Queues</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                                <Calendar size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</span>
                        </div>
                        <h3 className="text-gray-500 font-medium">Appointments Today</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link href="/admin/doctors" className="group">
                        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                            <div>
                                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                    <Stethoscope className="text-blue-600 group-hover:text-white transition-colors" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Doctors</h2>
                                <p className="text-gray-500 mb-6">Add new doctors, edit details, or manage availability.</p>
                            </div>
                            <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                                Go to Doctors <ChevronRight size={20} />
                            </div>
                        </div>
                    </Link>
                    <Link href="/admin/queues" className="group">
                        {/* Reusing route but highlighting queue aspect */}
                        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                            <div>
                                <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
                                    <Users className="text-green-600 group-hover:text-white transition-colors" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Queue Management</h2>
                                <p className="text-gray-500 mb-6">Monitor live queues and update patient status.</p>
                            </div>
                            <div className="flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform">
                                View Queues <ChevronRight size={20} />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </AdminGuard>
    )
}
