'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Toaster } from '@/components/ui/sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
    if (!session?.isAuthenticated) {
      router.push('/login');
    }
  }, [session, checkSession, router]);

  if (!session?.isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Mobile: padding-top for fixed header */}
        <div className="container py-6 pt-20 lg:pt-6">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
