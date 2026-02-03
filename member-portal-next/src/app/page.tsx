'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/member-store'
import { LoadingSpinner } from '@/components/common'
import { DiscordLoginScreen } from '@/components/portal/DiscordLoginScreen'

export default function HomePage() {
  const router = useRouter()
  const { session, isLoading } = useAuthStore()

  useEffect(() => {
    // If user is authenticated, redirect to portal home
    if (session?.is_linked) {
      router.replace('/home')
    }
  }, [session, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Vérification de la session..." />
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!session?.is_linked) {
    return <DiscordLoginScreen />
  }

  // Loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" message="Redirection..." />
    </div>
  )
}
