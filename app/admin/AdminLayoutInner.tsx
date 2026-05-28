'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ADMIN_EMAIL } from '@/lib/constants';

export default function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
      if (email !== ADMIN_EMAIL.toLowerCase()) {
        router.replace('/patient/dashboard');
      }
    } else if (isLoaded && !user) {
      router.replace('/sign-in');
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || (user && user.primaryEmailAddress?.emailAddress?.toLowerCase() !== ADMIN_EMAIL.toLowerCase())) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
        isCollapsed ? "md:ml-[72px]" : "md:ml-[260px]"
      )}>
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
