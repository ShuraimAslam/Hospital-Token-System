'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/hooks/useUserRole'
import { Loader2 } from 'lucide-react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { role, loading } = useUserRole()
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        if (!loading) {
            if (role === 'admin') {
                setAuthorized(true)
            } else {
                router.push('/admin/login') // or /unauthorized
            }
        }
    }, [role, loading, router])

    if (loading || !authorized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return <>{children}</>
}
