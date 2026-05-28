'use client';

import { useUser } from '@clerk/nextjs';
import { Search, Bell, Mail, Sun } from 'lucide-react';
import { ADMIN_EMAIL } from '@/lib/constants';

export default function TopBar() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const role = email === ADMIN_EMAIL ? 'admin' : 'patient';

  const defaultName = email.split('@')[0].replace(/[0-9]/g, '');
  const displayName = user?.firstName || (defaultName.charAt(0).toUpperCase() + defaultName.slice(1)) || 'User';

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-100 shrink-0">
      {/* Search */}
      <div className="relative w-72 hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full h-9 pl-10 pr-4 rounded-lg bg-slate-50 text-[13px] text-foreground placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-600/10 transition-all border border-transparent focus:border-brand-100"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <Sun className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <Mail className="w-4 h-4" />
        </button>
        <button className="relative w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-[6px] h-[6px] rounded-full bg-brand-600" />
        </button>

        {/* Divider + User chip */}
        <div className="w-px h-7 bg-slate-100 mx-2" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-[11px] font-semibold text-brand-600">
            {displayName[0] || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-[13px] font-medium text-foreground leading-tight">
              {user?.fullName || displayName}
            </p>
            <p className="text-[10px] text-slate-400 capitalize font-medium">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
