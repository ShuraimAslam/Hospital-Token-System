import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="global-not-found flex flex-col items-center justify-center min-h-screen text-center px-4">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8">Could not find requested resource</p>
            <Link href="/">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    Return Home
                </button>
            </Link>
        </div>
    )
}
