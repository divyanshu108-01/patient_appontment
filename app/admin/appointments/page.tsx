'use client';

import { useEffect, useState } from 'react';
import { cn, formatDate, formatTime, getStatusColor } from '@/lib/utils';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Calendar,
  Clock,
  User,
  ExternalLink,
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
  doctors: { name: string; specialty: string };
  slots: { date: string; start_time: string; end_time: string };
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppt, setSelectedAppt] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [rejectModal, setRejectModal] = useState<{ show: boolean; id: string | null; note: string }>({
    show: false, id: null, note: ''
  });

  useEffect(() => {
    fetch('/api/admin/appointments')
      .then((res) => res.json())
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_note: note }),
    });

    if (res.ok) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status, admin_note: note || null } : a))
      );
      setSelectedAppt(null);
      setNote('');
    }
  };

  const filteredAppts = appointments.filter((a) => {
    const matchesSearch = a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
                         a.doctors.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Appointment Management</h1>
        <p className="text-muted-fg mt-1">Review, approve, or manage patient booking requests.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
          <input
            type="text"
            placeholder="Search patient or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border outline-none focus:ring-2 focus:ring-brand-600/20 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 px-4 rounded-xl bg-card border border-border outline-none min-w-[160px] text-sm font-medium"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/20 border-b border-slate-50">
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Patient Detail
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Assigned Specialist
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Schedule
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-300">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-20" />
                    <p className="text-[13px] font-medium italic">Fetching records...</p>
                  </td>
                </tr>
              ) : filteredAppts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-300">
                    <p className="text-[13px] font-medium italic">No matches found</p>
                  </td>
                </tr>
              ) : (
                filteredAppts.map((appt) => (
                  <tr key={appt.id} className="group hover:bg-slate-50/30 transition-colors h-16">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[11px] font-bold text-slate-400">
                          {appt.patient_name[0]}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground leading-tight">
                            {appt.patient_name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">{appt.patient_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-[13px] font-semibold text-foreground tracking-tight">{appt.doctors.name}</p>
                      <p className="text-[10px] text-brand-600 font-bold uppercase tracking-widest">{appt.doctors.specialty}</p>
                    </td>
                    <td className="px-6 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[12px] text-foreground font-bold tracking-tight">
                          <Calendar className="w-3 h-3 text-slate-300" />
                          <span>{formatDate(appt.slots.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span>{formatTime(appt.slots.start_time)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest',
                          getStatusColor(appt.status)
                        )}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {appt.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedAppt(appt.id);
                              handleAction(appt.id, 'approved');
                            }}
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRejectModal({ show: true, id: appt.id, note: '' })}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-foreground hover:bg-muted transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                onClick={() => {
                  if (rejectModal.id) {
                    setNote(rejectModal.note);
                    handleAction(rejectModal.id, 'rejected');
                    setRejectModal({ show: false, id: null, note: '' });
                  }
                }}
                className="flex-1 h-9 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
