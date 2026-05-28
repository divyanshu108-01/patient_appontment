'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { cn, formatDate, formatTime, getStatusColor } from '@/lib/utils';
import {
  CalendarPlus,
  Clock,
  Stethoscope,
  XCircle,
  ChevronRight,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: string;
  visit_reason: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  doctors: { name: string; specialty: string; photo_url: string };
  slots: { date: string; start_time: string; end_time: string };
}

export default function PatientDashboard() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    id: string | null;
  }>({ show: false, id: null });

  useEffect(() => {
    fetch('/api/appointments')
      .then((res) => res.json())
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCancelAction = async () => {
    if (!confirmModal.id) return;
    setSubmitting(true);
    const res = await fetch(`/api/appointments/${confirmModal.id}/cancel`, { method: 'PATCH' });
    if (res.ok) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === confirmModal.id ? { ...a, status: 'cancelled' } : a))
      );
      setConfirmModal({ show: false, id: null });
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to cancel');
    }
    setSubmitting(false);
  };

  const upcoming = appointments.filter(
    (a) => a.status === 'approved' && new Date(`${a.slots.date}T${a.slots.start_time}`) > new Date()
  );
  const pending = appointments.filter((a) => a.status === 'pending');

  const email = user?.primaryEmailAddress?.emailAddress || '';
  const defaultName = email ? email.split('@')[0].replace(/[0-9]/g, '') : 'Patient';
  const displayName = user?.firstName || (defaultName.charAt(0).toUpperCase() + defaultName.slice(1)) || 'Patient';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-medium text-slate-800 tracking-tight">
            Hello, <span className="font-semibold text-brand-600">{displayName}</span> 👋
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-semibold">All reports normal</span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Upcoming',
            value: upcoming.length,
            icon: Clock,
            color: 'text-brand-600 bg-brand-50/50',
          },
          {
            label: 'Pending',
            value: pending.length,
            icon: Clock,
            color: 'text-amber-500 bg-amber-50/50',
          },
          {
            label: 'Total',
            value: appointments.length,
            icon: Stethoscope,
            color: 'text-emerald-500 bg-emerald-50/50',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-slate-100/60 transition-all hover:bg-slate-50/20"
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', stat.color)}>
                <stat.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground leading-none tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-tight">My Recent Appointments</h2>
          <Link
            href="/patient/appointments"
            className="text-[12px] text-brand-600 font-semibold hover:underline inline-flex items-center gap-0.5"
          >
            View all history <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
            <p className="text-[13px]">Fetching appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <p className="text-sm font-medium mb-4">No appointments found in your record.</p>
            <Link
              href="/patient/doctors"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-lg bg-brand-600 text-white text-[13px] font-semibold hover:bg-brand-700 transition-all shadow-md active:scale-[0.98]"
            >
              Start Booking Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-300">
                    Doctor Detail
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-300">
                    Scheduled For
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-300">
                    Visit Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-300">
                    Current Status
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((appt) => (
                  <tr key={appt.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors h-16 group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-[11px] font-bold text-brand-600">
                          {appt.doctors.name[0]}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-foreground leading-tight group-hover:text-brand-600 transition-colors">{appt.doctors.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{appt.doctors.specialty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-[13px] text-foreground">
                      <div className="font-bold">{formatDate(appt.slots.date)}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{formatTime(appt.slots.start_time)}</div>
                    </td>
                    <td className="px-6 py-3 text-[12px] text-slate-600 max-w-[150px] truncate italic">
                      &ldquo;{appt.visit_reason}&rdquo;
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest',
                            getStatusColor(appt.status)
                          )}
                        >
                          {appt.status}
                        </span>
                        {appt.admin_note && (
                          <div className="text-[10px] text-slate-500 flex items-start gap-1 max-w-[140px] mt-0.5">
                            <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="italic leading-tight">{appt.admin_note}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {['pending', 'approved'].includes(appt.status) && (
                        <button
                          onClick={() => setConfirmModal({ show: true, id: appt.id })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-sm rounded-xl border border-slate-100 shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold mb-1 tracking-tight">Cancel Appointment?</h2>
            <p className="text-[13px] text-slate-500 mb-6 px-4 leading-relaxed">
              Are you sure you want to cancel this visit? This action cannot be reversed.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setConfirmModal({ show: false, id: null })}
                className="flex-1 h-10 rounded-lg border border-slate-100 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-colors"
                disabled={submitting}
              >
                Go Back
              </button>
              <button 
                onClick={handleCancelAction}
                disabled={submitting}
                className="flex-1 h-10 rounded-lg bg-red-500 text-white font-bold text-[13px] hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
