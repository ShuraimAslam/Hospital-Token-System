import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function BookingSuccessPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-green-100 p-4 rounded-full mb-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Booking Confirmed!</h1>
            <p className="text-xl text-gray-600 max-w-lg mb-8">
                Your token has been generated successfully. You can track your appointment status in real-time.
            </p>
            <div className="flex gap-4">
                <Link href="/">
                    <button className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                        Back to Home
                    </button>
                </Link>
                <Link href="/my-appointments">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
                        View My Appointment
                    </button>
                </Link>
            </div>
        </div>
    )
}
