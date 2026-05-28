'use client';

import { useEffect, useState } from 'react';
import { cn, formatDate, formatTime, getStatusColor } from '@/lib/utils';
import {
  CalendarCheck,
  Clock,
  XCircle,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  Loader2,
  AlertTriangle,
  History,
  Timer,
} from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: string;
  visit_reason: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  doctor_id: string;
  doctors: { name: string; specialty: string; photo_url: string };
  slots: { date: string; start_time: string; end_time: string };
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'past'>('all');
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

  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return a.status === 'pending';
    if (activeTab === 'approved') return a.status === 'approved';
    if (activeTab === 'past') {
      return (
        ['completed', 'rejected', 'cancelled'].includes(a.status) ||
        new Date(`${a.slots.date}T${a.slots.start_time}`) < new Date()
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Appointments History</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Track your past consultations and upcoming visits.</p>
        </div>
        <Link
          href="/patient/doctors"
          className="px-5 h-10 rounded-lg bg-brand-600 text-white font-bold text-[13px] hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-[0.98]"
        >
          Book New Appointment
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-100 inline-flex items-center gap-1">
        {[
          { label: 'All', id: 'all', icon: History },
          { label: 'Pending', id: 'pending', icon: Timer },
          { label: 'Approved', id: 'approved', icon: Stethoscope },
          { label: 'History', id: 'past', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2',
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          <p className="text-[13px]">Recalling your visits...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-xl border border-border">
          <CalendarCheck className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <p className="text-sm font-bold text-foreground tracking-tight">No records found</p>
          <p className="text-xs text-slate-400 mt-1">You don&apos;t have any appointments in this status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 relative overflow-hidden"
            >
              {/* Status Indicator Bar */}
              <div className={cn('absolute left-0 top-0 bottom-0 w-1', getStatusColor(appt.status).split(' ')[0])} />

              {/* Doctor Info */}
              <div className="flex items-center gap-4 min-w-[220px]">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-[14px] leading-tight">{appt.doctors.name}</p>
                  <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider mt-0.5">{appt.doctors.specialty}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 text-[13px] text-foreground">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold">{formatDate(appt.slots.date)}</span>
                  <span className="text-slate-400 font-medium lowercase">@ {formatTime(appt.slots.start_time).toLowerCase()}</span>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 block mb-1">Clinic Note / Purpose</span>
                  <p className="text-[12px] text-slate-600 font-medium italic">&ldquo;{appt.visit_reason}&rdquo;</p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="shrink-0 flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <span
                    className={cn(
                      'inline-flex px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest',
                      getStatusColor(appt.status)
                    )}
                  >
                    {appt.status}
                  </span>
                  {appt.admin_note && (
                    <div className="mt-2 text-[11px] text-slate-500 flex items-start md:justify-end gap-1.5 max-w-[180px]">
                      <AlertCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <span className="italic leading-tight">{appt.admin_note}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {['pending', 'approved'].includes(appt.status) && (
                    <button
                      onClick={() => setConfirmModal({ show: true, id: appt.id })}
                      className="h-9 px-3 rounded-lg text-[11px] font-bold text-red-500 hover:bg-red-50 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5 inline" />
                      Cancel
                    </button>
                  )}
                  
                  <Link
                    href={`/patient/book?doctorId=${appt.doctor_id}`}
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all border border-slate-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-sm rounded-xl border border-slate-100 shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold mb-1 tracking-tight">Cancel Appointment?</h2>
            <p className="text-[13px] text-slate-500 mb-6 px-4 leading-relaxed">
              This action will release your slot back to other patients. Are you sure?
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setConfirmModal({ show: false, id: null })}
                className="flex-1 h-10 rounded-lg border border-slate-100 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-colors"
                disabled={submitting}
              >
                No, Keep it
              </button>
              <button 
                onClick={handleCancelAction}
                disabled={submitting}
                className="flex-1 h-10 rounded-lg bg-red-500 text-white font-bold text-[13px] hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
