'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_NAV } from '@/config/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES } from '@/config/roles';
import { LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { session, logout } = useAuthStore();
  // Par défaut, les sections sont ouvertes
  const [expandedItems, setExpandedItems] = useState<string[]>(['#navigation', '#outils']);

  const roleConfig = session?.role ? ROLES[session.role] : null;

  // Auto-expand section contenant la page active
  useEffect(() => {
    ADMIN_NAV.forEach((item) => {
      if (item.isSection && item.children) {
        const hasActiveChild = item.children.some(
          (child) => pathname === child.href || pathname.startsWith(child.href + '/')
        );
        if (hasActiveChild && !expandedItems.includes(item.href)) {
          setExpandedItems((prev) => [...prev, item.href]);
        }
      }
    });
  }, [pathname]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="font-semibold text-lg">Skali Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.href);
              const isSection = item.isSection;

              // Pour les items sans enfants (Dashboard, CRM)
              if (!hasChildren) {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              }

              // Pour les sections avec enfants
              return (
                <li key={item.href} className={cn(isSection && 'mt-4')}>
                  <button
                    onClick={() => toggleExpanded(item.href)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isSection
                        ? 'font-semibold text-foreground/80 hover:text-foreground'
                        : 'font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                    <ChevronDown
                      className={cn(
                        'ml-auto h-4 w-4 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-200',
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    {item.children && (
                      <ul className="ml-4 mt-1 space-y-1 border-l border-border/50 pl-2">
                        {item.children.map((child) => {
                          const isChildActive =
                            pathname === child.href || pathname.startsWith(child.href + '/');
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={cn(
                                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                  isChildActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                              >
                                <child.icon className="h-4 w-4" />
                                {child.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - User info */}
        <div className="border-t border-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: roleConfig?.color || '#666' }}
                >
                  {session?.role?.[0] || '?'}
                </div>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">{roleConfig?.label || 'Non connecté'}</span>
                  <span className="text-xs text-muted-foreground">{session?.role}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
