'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'public_user' | null

export function useUserRole() {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<UserRole>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        let mounted = true

        const fetchUserAndRole = async () => {
            try {
                // getSession is smaller/faster than getUser for initial client checks
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) throw error

                const currentUser = session?.user ?? null
                if (mounted) setUser(currentUser)

                if (currentUser) {
                    const { data, error: roleError } = await supabase
                        .from('user_roles')
                        .select('roles(role_name)')
                        .eq('user_id', currentUser.id)
                        .single()

                    if (mounted && data && data.roles) {
                        // @ts-ignore
                        setRole(data.roles.role_name as UserRole)
                    }
                }
            } catch (e) {
                console.error('Error fetching user role:', e)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        fetchUserAndRole()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return

                const currentUser = session?.user ?? null
                setUser(currentUser)

                if (currentUser) {
                    const { data } = await supabase
                        .from('user_roles')
                        .select('roles(role_name)')
                        .eq('user_id', currentUser.id)
                        .single()

                    if (data && data.roles) {
                        // @ts-ignore
                        setRole(data.roles.role_name as UserRole)
                    }
                } else {
                    setRole(null)
                }
                setLoading(false)
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    return { user, role, loading }
}
