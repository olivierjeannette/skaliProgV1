'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Calendar, Dumbbell, Trophy, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: Home, href: '/portal' },
  { id: 'planning', label: 'Planning', icon: Calendar, href: '/portal/planning' },
  { id: 'workouts', label: 'WODs', icon: Dumbbell, href: '/portal/workouts' },
  { id: 'performance', label: 'Perfs', icon: Trophy, href: '/portal/performance' },
  { id: 'profile', label: 'Profil', icon: User, href: '/portal/profile' },
]

export function PortalNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 px-2 py-2 safe-area-pb z-50">
      <div className="max-w-lg mx-auto flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/portal' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
                isActive
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 hover:text-white active:scale-95'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
