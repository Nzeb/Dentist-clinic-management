'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      return // Wait for the auth state to be determined
    }

    if (user) {
      router.push('/patients')
    } else {
      router.push('/login')
    }
  }, [user, loading, router])

  return null // Or a loading spinner
}
