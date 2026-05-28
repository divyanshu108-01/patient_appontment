'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';
import { ADMIN_EMAIL } from '@/lib/constants';
import {
  LayoutDashboard,
  Stethoscope,
  CalendarCheck,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Heart,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const patientNav = [
  { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
  { label: 'Doctors', href: '/patient/doctors', icon: Stethoscope },
  { label: 'My Appointments', href: '/patient/appointments', icon: CalendarCheck },
];

const adminNav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
  { label: 'Appointments', href: '/admin/appointments', icon: ClipboardList },
  { label: 'Schedule', href: '/admin/schedule', icon: Calendar },
  { label: 'Patients', href: '/admin/patients', icon: Users },
];



export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();

  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
  const role = email === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'patient';
  const navItems = role === 'admin' ? adminNav : patientNav;

  const defaultName = email.split('@')[0].replace(/[0-9]/g, '');
  const displayName = user?.firstName || (defaultName.charAt(0).toUpperCase() + defaultName.slice(1)) || 'User';

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/' });
  };

  const NavContent = () => (
    <>
      {/* Logo Section */}
      <div className={cn(
        "flex items-center gap-3 px-5 h-[72px] shrink-0 transition-all duration-300",
        isCollapsed && "px-0 justify-center"
      )}>
        <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden flex items-center justify-center bg-white">
          <img src="/logo.png" alt="MedCare Logo" className="w-full h-full object-contain" />
        </div>
        {!isCollapsed && (
          <span className="text-[17px] font-bold text-foreground tracking-tight animate-in fade-in duration-300">
            MedCare
          </span>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto no-scrollbar">
        {!isCollapsed && (
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-300 animate-in fade-in duration-300">
            Menu
          </p>
        )}
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 h-[42px] rounded-lg text-[13px] font-semibold transition-all duration-200 group relative',
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600',
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <item.icon className={cn(
                    'w-[18px] h-[18px] shrink-0 transition-colors',
                    isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                  )} />
                  {!isCollapsed && (
                    <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                      {item.label}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-600 rounded-r-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User & Sign Out */}
      <div className={cn(
        "border-t border-slate-50 px-4 py-4 shrink-0 transition-all duration-300",
        isCollapsed && "px-0 flex flex-col items-center gap-4"
      )}>
        <div className={cn("flex items-center gap-3", isCollapsed && "flex-col")}>
          <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-[11px] font-bold text-brand-600 shrink-0">
            {displayName[0] || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <p className="text-[13px] font-bold text-foreground truncate leading-tight">
                {user?.fullName || displayName}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{role}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={cn(
              "p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all",
              isCollapsed ? "w-8 h-8 flex items-center justify-center" : ""
            )}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-slate-100"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Desktop */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-50 flex flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[72px]' : 'w-[260px]',
          mobileOpen ? 'translate-x-0 !w-[260px]' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Toggle Button for Desktop */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-white border border-slate-100 shadow-sm items-center justify-center text-slate-400 hover:text-brand-600 hover:shadow-md transition-all z-50"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden absolute top-5 right-4 p-1"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        )}
        <NavContent />
      </aside>
    </>
  );
}
