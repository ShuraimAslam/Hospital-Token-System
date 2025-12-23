'use client'

import AdminGuard from '@/components/AdminGuard'
import { createClient } from '@/utils/supabase/client'
import { Appointment, Doctor } from '@/types'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, Play, CheckCircle, RefreshCcw, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function QueueManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [doctor, setDoctor] = useState<Doctor | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchData = async () => {
        setLoading(true)
        const [docRes, apptRes] = await Promise.all([
            supabase.from('doctors').select('*').eq('id', id).single(),
            supabase.from('appointments')
                .select('*')
                .eq('doctor_id', id)
                .eq('appointment_date', new Date().toISOString().split('T')[0])
                .neq('status', 'CANCELLED')
                .order('token_number', { ascending: true })
        ])

        if (docRes.data) setDoctor(docRes.data)
        if (apptRes.data) setAppointments(apptRes.data as Appointment[])
        setLoading(false)
    }

    useEffect(() => {
        fetchData()

        const channel = supabase
            .channel('queue_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${id}` },
                () => fetchData() // brute force refresh for simplicity
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [id])


    const updateStatus = async (id: string, status: string) => {
        await supabase.from('appointments').update({ status }).eq('id', id)
        // Optimistic update or wait for realtime
        fetchData()
    }

    const currentPatient = appointments.find(a => a.status === 'IN_PROGRESS')
    const waitingPatients = appointments.filter(a => a.status === 'WAITING')
    const nextPatient = waitingPatients[0]
    const completedCount = appointments.filter(a => a.status === 'COMPLETED').length

    return (
        <AdminGuard>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <Link href="/admin/doctors" className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back to Doctors
                </Link>

                {doctor && (
                    <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <p className="text-blue-600 font-medium">{doctor.specialization} Queue</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Total Appointments</p>
                            <p className="text-2xl font-bold">{appointments.length}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* CURRENTLY SERVING */}
                    <div className="md:col-span-1">
                        <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-blue-100 uppercase tracking-wider text-sm font-bold mb-2">Currently Serving</h2>
                                {currentPatient ? (
                                    <div className="text-center py-6">
                                        <span className="text-6xl font-black block mb-2">{currentPatient.token_number}</span>
                                        <span className="px-3 py-1 bg-blue-500 bg-opacity-50 rounded-full text-sm">In Progress</span>
                                        <button
                                            onClick={() => updateStatus(currentPatient.id, 'COMPLETED')}
                                            className="mt-8 w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
                                        >
                                            <CheckCircle size={20} />
                                            <span>Complete Visit</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-blue-200">No patient in progress</p>
                                        {nextPatient && (
                                            <button
                                                onClick={() => updateStatus(nextPatient.id, 'IN_PROGRESS')}
                                                className="mt-6 w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
                                            >
                                                <Play size={20} />
                                                <span>Call Next: #{nextPatient.token_number}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 bg-green-50 rounded-2xl p-6 border border-green-100 text-center">
                            <h3 className="text-green-800 font-bold mb-1">Completed</h3>
                            <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                        </div>
                    </div>

                    {/* UPCOMING LIST */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-900">Upcoming Patients</h3>
                                <span className="text-sm text-gray-500">{waitingPatients.length} Waiting</span>
                            </div>

                            {waitingPatients.length > 0 ? (
                                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                                    {waitingPatients.map((apt) => (
                                        <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700">
                                                    {apt.token_number}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Wait Time approx. {((apt.token_number - (currentPatient?.token_number || 0)) * 15)} mins</p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-semibold">WAITING</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center text-gray-500">
                                    No patients waiting in queue.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminGuard>
    )
}
