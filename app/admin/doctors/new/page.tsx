'use client'

import AdminGuard from '@/components/AdminGuard'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddDoctorPage() {
    const [formData, setFormData] = useState({
        name: '',
        specialization: '',
        start_time: '',
        end_time: '',
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            console.log("Submitting formData:", formData)
            const { error } = await supabase.from('doctors').insert([formData])

            if (error) {
                throw error
            }

            // Success
            alert('Doctor Added Successfully!')
            router.push('/admin/doctors')
            router.refresh()
        } catch (error: any) {
            console.error("Error adding doctor:", error)
            alert('Error adding doctor: ' + (error.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AdminGuard>
            <div className="max-w-2xl mx-auto px-4 py-10">
                <Link href="/admin/doctors" className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back to Doctors
                </Link>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Doctor</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Dr. Smith"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Specialization</label>
                            <select
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                value={formData.specialization}
                                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                            >
                                <option value="" disabled>Select Specialization</option>
                                <option value="General Physician">General Physician</option>
                                <option value="Cardiologist">Cardiologist</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="Pediatrician">Pediatrician</option>
                                <option value="Neurologist">Neurologist</option>
                                <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                                <option value="Gynecologist">Gynecologist</option>
                                <option value="ENT Specialist">ENT Specialist</option>
                                <option value="Dentist">Dentist</option>
                                <option value="Ophthalmologist">Ophthalmologist</option>
                                <option value="Psychiatrist">Psychiatrist</option>
                                <option value="Urologist">Urologist</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                <input
                                    type="time"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.start_time}
                                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Time</label>
                                <input
                                    type="time"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.end_time}
                                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Doctor'}
                        </button>
                    </form>
                </div>
            </div>
        </AdminGuard>
    )
}
