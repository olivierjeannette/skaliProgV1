'use client'

import { useEffect, useState } from 'react'
import { usePortalStore } from '@/stores/portal-store'
import { PortalLogin } from '@/components/portal/PortalLogin'
import { InstallPrompt } from '@/components/pwa/install-prompt'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser, isLoading, checkSession } = usePortalStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkSession()
  }, [checkSession])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <PortalLogin />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <InstallPrompt />
      {children}
    </div>
  )
}
