import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Calendar, Clock, Stethoscope, ChevronRight, Star, ShieldCheck } from 'lucide-react'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function Home() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: doctors } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true)
        .order('name')

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden border-b border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <svg
                            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
                            fill="currentColor"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <polygon points="50,0 100,0 50,100 0,100" />
                        </svg>

                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4 border border-blue-100">
                                    Trusted by 10,000+ Patients
                                </span>
                                <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Healthcare access</span>{' '}
                                    <span className="block text-blue-600 xl:inline">simplified.</span>
                                </h1>
                                <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Book appointments with top specialists in seconds. Get your live token number and track your status in real-time without the wait.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-3">
                                    <div className="rounded-md shadow">
                                        <a
                                            href="#doctors"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg transition-all shadow-lg hover:shadow-blue-500/30"
                                        >
                                            Find a Doctor
                                        </a>
                                    </div>
                                    <div className="mt-3 sm:mt-0">
                                        <Link
                                            href="/my-appointments"
                                            // Added border-2 and slate-200 for better visibility
                                            className="w-full flex items-center justify-center px-8 py-3 border-2 border-slate-200 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 md:py-4 md:text-lg transition-colors"
                                        >
                                            My Appointments
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-slate-100">
                    <div className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center text-slate-300">
                        {/* Hero Icon */}
                        <ShieldCheck size={120} className="text-blue-200" />
                    </div>
                </div>
            </div>

            {/* Doctor List Section */}
            <div id="doctors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Specialists</h2>
                    <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-full mb-6 text-blue-700 font-medium text-sm">
                        <Calendar size={16} className="mr-2" />
                        Today's Availability: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Book Your Appointment Today
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
                        Choose from our team of experienced doctors.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {doctors && doctors.length > 0 ? (
                        doctors.map((doctor) => (
                            <div key={doctor.id} className="group glass-card overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-slate-200 rounded-2xl">
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                            <Stethoscope size={28} />
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Available
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{doctor.name}</h3>
                                    <p className="text-sm font-medium text-blue-600 mb-4">{doctor.specialization}</p>

                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                        <div className="flex items-center text-slate-500 text-sm">
                                            <Clock size={16} className="mr-2 text-slate-400" />
                                            {doctor.start_time.slice(0, 5)} - {doctor.end_time.slice(0, 5)}
                                        </div>
                                        <div className="flex items-center text-slate-500 text-sm">
                                            <Star size={16} className="mr-2 text-yellow-400 fill-yellow-400" />
                                            4.8 (120+ reviews)
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 group-hover:bg-blue-50 transition-colors">
                                    <Link href={`/book/${doctor.id}`} className="flex items-center justify-between text-blue-700 font-semibold group-hover:text-blue-800">
                                        Book Token
                                        <ChevronRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-full mb-4">
                                <Stethoscope size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No active doctors found</h3>
                            <p className="text-slate-500 mt-1">Please check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
