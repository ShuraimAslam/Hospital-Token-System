'use client'

import AdminGuard from '@/components/AdminGuard'
import { createClient } from '@/utils/supabase/client'
import { Doctor } from '@/types'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Clock, ArrowRight } from 'lucide-react'

export default function QueueListPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchDoctors()
    }, [])

    const fetchDoctors = async () => {
        // Only fetch ACTIVE doctors for the queue list, as inactive doctors don't have queues
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('is_active', true)
            .order('name')

        if (data) setDoctors(data)
        setLoading(false)
    }

    return (
        <AdminGuard>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Queue Management</h1>
                        <p className="text-gray-500 mt-2">Select a doctor to manage their live patient queue.</p>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center text-blue-700 font-medium">
                        <Clock size={20} className="mr-2" />
                        <span>Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map(doctor => (
                        <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                                    <p className="text-blue-600 font-medium text-sm">{doctor.specialization}</p>
                                </div>
                                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                    <Users size={20} />
                                </div>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-6">
                                <Clock size={16} className="mr-1" />
                                {doctor.start_time.slice(0, 5)} - {doctor.end_time.slice(0, 5)}
                            </div>

                            <Link href={`/admin/doctors/${doctor.id}/queue`}>
                                <button className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors">
                                    <span>Manage Queue</span>
                                    <ArrowRight size={18} />
                                </button>
                            </Link>
                        </div>
                    ))}

                    {doctors.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No active doctors found.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminGuard>
    )
}
