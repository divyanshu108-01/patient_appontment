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
  Activity,
  Phone,
  X,
} from 'lucide-react';

interface Patient {
  patient_id: string;
  patient_name: string;
  patient_email: string;
  total_appointments: number;
  pending: number;
  approved: number;
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

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
                        <span className="font-semibold text-foreground tracking-tight">
                          {p.patient_name === 'Patient' ? (() => {
                            const emailName = p.patient_email.split('@')[0].replace(/[0-9]/g, '');
                            return emailName.charAt(0).toUpperCase() + emailName.slice(1);
                          })() : p.patient_name}
                        </span>
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
                        {p.total_appointments} Bookings
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => setSelectedPatient(p)}
                        className="h-8 px-3 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 font-medium text-[11px] hover:text-brand-600 hover:bg-brand-50 hover:border-brand-200 transition-all shadow-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-foreground">Patient File</h2>
              <button onClick={() => setSelectedPatient(null)} className="text-muted-fg hover:text-foreground transition-colors bg-white rounded-full p-1 shadow-sm border border-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-3 shadow-inner">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">
                  {selectedPatient.patient_name === 'Patient' ? (() => {
                    const emailName = selectedPatient.patient_email.split('@')[0].replace(/[0-9]/g, '');
                    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
                  })() : selectedPatient.patient_name}
                </h3>
                <a href={`mailto:${selectedPatient.patient_email}`} className="text-slate-500 text-[13px] font-medium hover:text-brand-600 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {selectedPatient.patient_email}
                </a>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
                <div className="flex flex-col items-center p-3 py-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <span className="text-xl font-black text-slate-700">{selectedPatient.total_appointments}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Total</span>
                </div>
                <div className="flex flex-col items-center p-3 py-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                  <span className="text-xl font-black text-emerald-600">{selectedPatient.approved}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 mt-1">Approved</span>
                </div>
                <div className="flex flex-col items-center p-3 py-4 rounded-xl border border-amber-100 bg-amber-50/30">
                  <span className="text-xl font-black text-amber-600">{selectedPatient.pending}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mt-1">Pending</span>
                </div>
              </div>

              <a 
                href={`mailto:${selectedPatient.patient_email}`}
                className="w-full h-11 rounded-xl bg-brand-600 text-white font-bold text-sm transition-all shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 hover:bg-brand-700"
              >
                <Mail className="w-4 h-4" />
                Contact Patient
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
