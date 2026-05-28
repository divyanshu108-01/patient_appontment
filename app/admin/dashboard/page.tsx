'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { cn, formatDate, formatTime, getStatusColor } from '@/lib/utils';
import {
  Users,
  CalendarCheck,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Stethoscope,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  visit_reason: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  doctor_id: string;
  doctors: { name: string; specialty: string; photo_url: string };
  slots: { date: string; start_time: string; end_time: string };
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  photo_url: string;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Rejection modal
  const [rejectModal, setRejectModal] = useState<{ show: boolean; id: string | null; note: string }>({
    show: false, id: null, note: ''
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/appointments').then((r) => r.json()),
      fetch('/api/admin/doctors').then((r) => r.json()),
    ])
      .then(([apptData, docData]) => {
        setAppointments(Array.isArray(apptData) ? apptData : []);
        setDoctors(Array.isArray(docData) ? docData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected', note?: string) => {
    setActionLoading(id);
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_note: note }),
    });

    if (res.ok) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status, admin_note: note || null } : a))
      );
    }
    setActionLoading(null);
    setRejectModal({ show: false, id: null, note: '' });
  };

  const pendingAppts = appointments.filter((a) => a.status === 'pending');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayApproved = appointments.filter(
    (a) => a.status === 'approved' && a.slots?.date === todayStr
  );
  const totalPatients = new Set(appointments.map((a) => a.patient_name)).size;

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        <span className="text-sm">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Welcome back, {user?.firstName || 'Admin'}
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Here&apos;s what&apos;s happening at your clinic today.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-[12px] font-semibold">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Patients',
            value: totalPatients,
            icon: Users,
            iconBg: 'bg-blue-50/50',
            iconColor: 'text-brand-600',
          },
          {
            label: 'Today\'s Appts',
            value: todayApproved.length,
            icon: CalendarCheck,
            iconBg: 'bg-purple-50/50',
            iconColor: 'text-purple-500',
          },
          {
            label: 'Pending',
            value: pendingAppts.length,
            icon: Clock,
            iconBg: 'bg-amber-50/50',
            iconColor: 'text-amber-500',
          },
          {
            label: 'Total Appts',
            value: appointments.length,
            icon: TrendingUp,
            iconBg: 'bg-emerald-50/50',
            iconColor: 'text-emerald-500',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-slate-100/60 hover:shadow-sm hover:shadow-slate-100/50 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2.5">
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-colors', stat.iconBg)}>
                <stat.icon className={cn('w-3.5 h-3.5', stat.iconColor)} />
              </div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main content: 65/35 split */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Left — Pending appointments */}
        <div className="bg-white rounded-xl border border-slate-100/60">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
            <h2 className="text-[13px] font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
              Pending Appointments
              {pendingAppts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-600 text-[10px] font-bold">
                  {pendingAppts.length}
                </span>
              )}
            </h2>
          </div>

          {pendingAppts.length === 0 ? (
            <div className="p-12 text-center text-slate-300">
              <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-emerald-200" />
              <p className="text-[13px] font-medium italic">No new requests</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50/50">
              {pendingAppts.map((appt) => (
                <div key={appt.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[11px] font-bold text-slate-400 shrink-0">
                    {appt.patient_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground leading-none">{appt.patient_name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {appt.doctors.name} · {formatDate(appt.slots.date)} · {formatTime(appt.slots.start_time)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleAction(appt.id, 'approved')}
                      disabled={actionLoading === appt.id}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-[11px] font-bold hover:bg-brand-700 transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectModal({ show: true, id: appt.id, note: '' })}
                      disabled={actionLoading === appt.id}
                      className="px-3 py-1.5 rounded-lg border border-slate-100 text-slate-400 text-[11px] font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Doctor Panel */}
        <div className="bg-white rounded-xl border border-slate-100/60 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-[12px] font-bold text-foreground uppercase tracking-wide">Doctors</h3>
            <a
              href="/admin/doctors"
              className="text-[11px] text-brand-600 font-bold hover:underline uppercase tracking-wider"
            >
              Manage →
            </a>
          </div>

          <div className="divide-y divide-slate-50/50">
            {doctors.slice(0, 5).map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-[10px] font-bold text-brand-600 shrink-0">
                  {doc.name.split(' ').pop()?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-foreground truncate">{doc.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{doc.specialty}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500/80">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Appointments Table */}
      <div className="bg-white rounded-xl border border-slate-100/60">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
          <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wide">Recent Bookings</h2>
          <a
            href="/admin/appointments"
            className="text-[11px] text-brand-600 font-bold hover:underline uppercase tracking-wider"
          >
            Full History →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/20">
                {['Patient', 'Doctor', 'Schedule', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {appointments.slice(0, 10).map((appt) => (
                <tr key={appt.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {appt.patient_name[0]}
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">{appt.patient_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs font-medium text-slate-600 truncate max-w-[120px]">{appt.doctors.name}</td>
                  <td className="px-5 py-3">
                    <p className="text-xs font-semibold text-slate-700">{formatDate(appt.slots.date)}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">{formatTime(appt.slots.start_time)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest',
                        getStatusColor(appt.status)
                      )}
                    >
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <div className="p-10 text-center text-slate-400 text-sm">No appointments yet.</div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-xl border border-slate-100 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Reject Appointment</h3>
                <p className="text-[11px] text-slate-400">Provide a reason for rejection (optional)</p>
              </div>
            </div>
            <textarea
              value={rejectModal.note}
              onChange={(e) => setRejectModal({ ...rejectModal, note: e.target.value })}
              placeholder="Reason for rejection..."
              className="w-full h-24 p-3 rounded-lg bg-slate-50 border border-slate-100 text-[13px] outline-none focus:ring-2 focus:ring-red-100 resize-none placeholder:text-slate-400 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectModal({ show: false, id: null, note: '' })}
                className="flex-1 h-9 rounded-lg border border-slate-100 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectModal.id && handleAction(rejectModal.id, 'rejected', rejectModal.note)}
                disabled={!!actionLoading}
                className="flex-1 h-9 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
