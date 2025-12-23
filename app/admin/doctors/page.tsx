'use client'

import AdminGuard from '@/components/AdminGuard'
import { createClient } from '@/utils/supabase/client'
import { Doctor } from '@/types'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Users, Clock, Stethoscope } from 'lucide-react'

export default function ManageDoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchDoctors()
    }, [])

    const fetchDoctors = async () => {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .order('name')

        if (data) setDoctors(data)
        setLoading(false)
    }

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        await supabase.from('doctors').update({ is_active: !currentStatus }).eq('id', id)
        fetchDoctors()
    }

    return (
        <AdminGuard>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
                    <Link href="/admin/doctors/new">
                        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-md">
                            <Plus size={20} />
                            <span>Add Doctor</span>
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {doctors.map(doctor => (
                        <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-3 mb-1">
                                    <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${doctor.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {doctor.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-blue-600 font-medium text-sm mb-3">{doctor.specialization}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={16} /> {doctor.start_time.slice(0, 5)} - {doctor.end_time.slice(0, 5)}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => toggleStatus(doctor.id, doctor.is_active)}
                                    className={`flex items-center justify-center w-full py-2 px-4 rounded-lg font-semibold border transition-colors ${doctor.is_active
                                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                            : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                        }`}
                                >
                                    {doctor.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminGuard>
    )
}
