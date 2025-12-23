'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Doctor } from '@/types'
import { Loader2, CalendarCheck, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function BookAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [patientDetails, setPatientDetails] = useState({ name: '', phone: '' })
    const [doctor, setDoctor] = useState<Doctor | null>(null)
    const [loading, setLoading] = useState(true)
    const [booking, setBooking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            // Fetch Doctor
            const { data: doctorData, error: doctorError } = await supabase
                .from('doctors')
                .select('*')
                .eq('id', id)
                .single()

            if (doctorError) {
                console.error(doctorError)
                setError('Doctor not found')
            } else {
                setDoctor(doctorData)
            }

            // Fetch User Profile for pre-filling
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('public_users')
                    .select('name, phone')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setPatientDetails({
                        name: profile.name || user.user_metadata?.name || '',
                        phone: profile.phone || user.user_metadata?.phone || ''
                    })
                } else {
                    setPatientDetails({
                        name: user.user_metadata?.name || '',
                        phone: user.user_metadata?.phone || ''
                    })
                }
            }

            setLoading(false)
        }

        fetchData()
    }, [id])

    const handleBook = async () => {
        setBooking(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push(`/login`)
            return
        }

        // Call RPC
        const { data, error } = await supabase.rpc('book_appointment', {
            doctor_id_param: id,
            patient_name_param: patientDetails.name,
            patient_phone_param: patientDetails.phone
        })

        if (error) {
            setError(error.message)
            setBooking(false)
        } else {
            router.push('/book/success')
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        </div>
    )

    if (!doctor) return (
        <div className="text-center py-20 px-4">
            <h2 className="text-2xl font-bold text-gray-800">Doctor not found</h2>
            <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">Return Home</Link>
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CalendarCheck className="h-6 w-6" />
                        Confirm Appointment
                    </h2>
                </div>

                <div className="p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-500 uppercase tracking-wide mb-1">Doctor</h3>
                        <p className="text-3xl font-bold text-gray-900">{doctor.name}</p>
                        <p className="text-lg text-blue-600 font-medium">{doctor.specialization}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Clinic Hours</h4>
                            <p className="text-gray-900 font-semibold">{doctor.start_time.slice(0, 5)} - {doctor.end_time.slice(0, 5)}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Date</h4>
                            <p className="text-gray-900 font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="mb-8 space-y-4">
                        <h4 className="text-lg font-bold text-gray-800 border-b pb-2">Patient Details</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                            <input
                                type="text"
                                value={patientDetails.name}
                                onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Enter patient's full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={patientDetails.phone}
                                onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Enter contact number"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md flex items-start gap-3">
                            <AlertCircle className="text-red-500 h-5 w-5 mt-0.5" />
                            <div>
                                <h4 className="text-red-800 font-medium">Booking Failed</h4>
                                <p className="text-red-700 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Link href="/" className="flex-1">
                            <button className="w-full py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                        </Link>
                        <button
                            onClick={handleBook}
                            disabled={booking}
                            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {booking ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirm Booking'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
