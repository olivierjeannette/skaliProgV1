'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuthStore, useMemberStore, useUIStore } from '@/store/member-store'
import { LoadingSpinner, SessionExpired, NoProfileLinked } from '@/components/common'
import {
  Home,
  FileEdit,
  Images,
  Target,
  Camera,
  BarChart3,
  LogOut,
  Menu,
  X,
  Dumbbell,
  Settings,
  PieChart,
  History,
} from 'lucide-react'

// Navigation items - Primary
const NAV_ITEMS = [
  { href: '/home', label: 'Accueil', icon: Home },
  { href: '/data-entry', label: 'Donnees', icon: FileEdit },
  { href: '/gallery', label: 'Cartes', icon: Images },
  { href: '/goals', label: 'Objectifs', icon: Target },
  { href: '/performances', label: 'Performances', icon: BarChart3 },
  { href: '/morpho', label: 'Morpho IA', icon: Camera },
]

// Navigation items - Secondary (shown in mobile menu and more dropdown)
const NAV_ITEMS_SECONDARY = [
  { href: '/stats', label: 'Statistiques', icon: PieChart },
  { href: '/history', label: 'Historique', icon: History },
  { href: '/settings', label: 'Parametres', icon: Settings },
]

function Navigation() {
  const pathname = usePathname()
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore()
  const { session } = useAuthStore()

  const handleLogout = () => {
    window.location.href = '/api/auth/logout'
  }

  return (
    <>
      {/* Desktop/Tablet Navigation */}
      <nav className="sticky top-0 z-40 bg-skali-darker/80 backdrop-blur-lg border-b border-glass-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/home" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-skali-green to-skali-accent rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-white">Portail Adhérent</h1>
                <p className="text-xs text-gray-400">Skàli Prog</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-skali-green to-skali-accent text-white font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                )
              })}

              {/* Separator */}
              <div className="h-6 w-px bg-glass-border mx-1" />

              {/* Secondary Nav */}
              {NAV_ITEMS_SECONDARY.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-skali-green to-skali-accent text-white font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm hidden lg:inline">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* User Info */}
              {session?.discord_user && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {session.discord_user.username}
                  </span>
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Déconnexion</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed inset-x-0 top-16 z-30 md:hidden bg-skali-darker/95 backdrop-blur-lg border-b border-glass-border max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {/* Primary Nav */}
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleMobileMenu}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-skali-green to-skali-accent text-white font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Separator */}
            <div className="h-px bg-glass-border my-3" />

            {/* Secondary Nav */}
            <p className="px-4 text-xs text-gray-500 uppercase tracking-wider">Plus</p>
            {NAV_ITEMS_SECONDARY.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleMobileMenu}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-skali-green to-skali-accent text-white font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Logout in Mobile */}
            <div className="h-px bg-glass-border my-3" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Deconnexion</span>
            </button>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { session, isLoading: authLoading } = useAuthStore()
  const {
    currentMember,
    isLoadingMember,
    loadMemberByDiscordId,
  } = useMemberStore()

  // Load member data when authenticated
  useEffect(() => {
    if (session?.discord_user?.id && !currentMember && !isLoadingMember) {
      loadMemberByDiscordId(session.discord_user.id)
    }
  }, [session, currentMember, isLoadingMember, loadMemberByDiscordId])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !session) {
      router.replace('/')
    }
  }, [authLoading, session, router])

  // Loading state
  if (authLoading || isLoadingMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Chargement du portail..." />
      </div>
    )
  }

  // Session expired
  if (!session) {
    return (
      <SessionExpired onLogin={() => router.replace('/')} />
    )
  }

  // No profile linked
  if (!session.is_linked || !currentMember) {
    return <NoProfileLinked />
  }

  return (
    <div className="min-h-screen bg-skali-darker">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom safe area for mobile */}
      <div className="h-8 md:h-0" />
    </div>
  )
}
