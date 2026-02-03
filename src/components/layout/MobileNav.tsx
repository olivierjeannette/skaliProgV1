'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_NAV } from '@/config/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES } from '@/config/roles';
import { LogOut, ChevronDown, Menu, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

export function MobileNav() {
  const pathname = usePathname();
  const { session, logout } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState<string[]>(['#navigation', '#outils']);
  const [open, setOpen] = useState(false);

  const roleConfig = session?.role ? ROLES[session.role] : null;

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">S</span>
          </div>
          <span className="font-semibold">Skali Admin</span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">S</span>
                </div>
                Skali Admin
              </SheetTitle>
            </SheetHeader>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {ADMIN_NAV.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedItems.includes(item.href);
                  const isSection = item.isSection;

                  if (!hasChildren) {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={handleLinkClick}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.title}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li key={item.href} className={cn(isSection && 'mt-4')}>
                      <button
                        onClick={() => toggleExpanded(item.href)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                          isSection
                            ? 'font-semibold text-foreground/80 hover:text-foreground'
                            : 'font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
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

                              // Si openInNewWindow, utiliser un <a> avec target="_blank"
                              if (child.openInNewWindow) {
                                return (
                                  <li key={child.href}>
                                    <a
                                      href={child.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={handleLinkClick}
                                      className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                                        'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                      )}
                                    >
                                      <child.icon className="h-5 w-5" />
                                      {child.title}
                                      <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                                    </a>
                                  </li>
                                );
                              }

                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                                      isChildActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    )}
                                  >
                                    <child.icon className="h-5 w-5" />
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

            {/* User Footer */}
            <div className="border-t border-border p-4 mt-auto">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: roleConfig?.color || '#666' }}
                >
                  {session?.role?.[0] || '?'}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{roleConfig?.label || 'Non connecté'}</span>
                  <span className="text-xs text-muted-foreground">{session?.role}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
