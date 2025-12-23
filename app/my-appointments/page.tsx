'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Appointment } from '@/types'
import { Loader2, Calendar, Clock, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MyAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    const fetchAppointments = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        const { data, error } = await supabase
            .from('appointments')
            .select('*, doctors(*)')
            .eq('user_id', user.id)
            .order('appointment_date', { ascending: false })
            .order('created_at', { ascending: false })

        if (!error && data) {
            // @ts-ignore
            setAppointments(data as Appointment[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchAppointments()

        // Realtime subscription
        const channel = supabase
            .channel('appointments_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments',
                },
                () => {
                    // Simply refresh full list on any change to keep it simple and accurate
                    fetchAppointments()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WAITING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading && appointments.length === 0) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                <button
                    onClick={fetchAppointments}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Refresh"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            <div className="space-y-4">
                {appointments.length > 0 ? (
                    appointments.map((apt) => (
                        <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                            <div className="flex-1">
                                <div className="flex items-start justify-between md:justify-start md:gap-4 mb-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>
                                        {apt.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm text-gray-500 flex items-center gap-1 md:hidden">
                                        <Calendar size={14} />
                                        {new Date(apt.appointment_date).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900">{apt.doctors?.name}</h3>
                                <p className="text-sm text-blue-600 font-medium mb-1">{apt.doctors?.specialization}</p>
                                {apt.patient_name && (
                                    <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
                                        Patient: <span className="text-gray-700 font-bold">{apt.patient_name}</span>
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="hidden md:flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        Token #{apt.token_number}
                                    </span>
                                </div>
                            </div>

                            {apt.status === 'WAITING' && (
                                <div className="flex flex-col items-center justify-center min-w-[100px] bg-blue-50 rounded-lg p-3 border border-blue-100">
                                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wider">Your Token</div>
                                    <div className="text-3xl font-black text-blue-700">{apt.token_number}</div>
                                </div>
                            )}
                            {apt.status === 'IN_PROGRESS' && (
                                <div className="flex flex-col items-center justify-center min-w-[100px] bg-indigo-50 rounded-lg p-3 border border-indigo-100 animate-pulse">
                                    <div className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Status</div>
                                    <div className="text-lg font-bold text-indigo-700">See Doctor</div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No appointments yet</h3>
                        <p className="text-gray-500 mb-6">Book your first appointment to avoid the queue.</p>
                        <Link href="/">
                            <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                Find a Doctor
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
