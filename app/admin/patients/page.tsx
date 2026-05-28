'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  User,
  Mail,
  Calendar,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';

interface Patient {
  patient_id: string;
  patient_name: string;
  patient_email: string;
  count: number;
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/patients')
      .then((res) => res.json())
      .then((data) => {
        setPatients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      p.patient_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registered Patients</h1>
        <p className="text-muted-fg mt-1">Overview of all patients who have interacted with the clinic.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border outline-none focus:ring-2 focus:ring-brand-600/20 transition-all font-medium"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/20 border-b border-slate-50">
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Patient</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Email Address</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Appointments</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50 text-sm">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-300 italic">Loading patients...</td></tr>
              ) : filteredPatients.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-300 italic">No patients found.</td></tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.patient_id} className="group hover:bg-slate-50/30 transition-colors h-16">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-foreground tracking-tight">{p.patient_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
                        <Mail className="w-3.5 h-3.5 opacity-40" />
                        {p.patient_email}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 font-bold text-[10px] uppercase tracking-wider">
                        {p.count} Bookings
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-100 text-slate-300 hover:text-brand-600 hover:bg-brand-50 transition-all">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
