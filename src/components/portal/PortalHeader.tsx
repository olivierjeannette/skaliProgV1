'use client'

import { useRouter } from 'next/navigation'
import { usePortalStore } from '@/stores/portal-store'
import { Button } from '@/components/ui/button'
import { Dumbbell, LogOut, ArrowLeft, RefreshCw } from 'lucide-react'

interface PortalHeaderProps {
  title?: string
  showBack?: boolean
  showRefresh?: boolean
  onRefresh?: () => void
}

export function PortalHeader({
  title = 'Skali Portal',
  showBack = false,
  showRefresh = false,
  onRefresh
}: PortalHeaderProps) {
  const router = useRouter()
  const { logout } = usePortalStore()

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Dumbbell className="h-6 w-6 text-emerald-400" />
          )}
          <span className="font-bold text-white">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {showRefresh && onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-slate-400 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
