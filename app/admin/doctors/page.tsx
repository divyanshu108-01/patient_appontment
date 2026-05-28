'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Stethoscope,
  Trash2,
  Edit2,
  Calendar,
  X,
  PlusCircle,
  Clock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  bio: string;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState<string | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  
  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'success';
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
  });

  // Form states
  const [docForm, setDocForm] = useState({
    name: '',
    specialty: 'General Medicine',
    qualification: '',
    bio: '',
  });
  
  const [slotForm, setSlotForm] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '09:30',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = () => {
    setLoading(true);
    fetch('/api/admin/doctors')
      .then((res) => res.json())
      .then((data) => {
        setDoctors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/admin/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docForm),
    });
    if (res.ok) {
      const newDoc = await res.json();
      setDoctors((prev) => [...prev, newDoc]);
      setShowAddModal(false);
      setDocForm({ name: '', specialty: 'General Medicine', qualification: '', bio: '' });
    }
    setSubmitting(false);
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setSubmitting(true);
    const res = await fetch(`/api/admin/doctors/${editingDoctor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editingDoctor.name,
        specialty: editingDoctor.specialty,
        qualification: editingDoctor.qualification,
        bio: editingDoctor.bio,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDoctors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setEditingDoctor(null);
    } else {
      const errData = await res.json();
      const errorMsg = errData.details?.fieldErrors 
        ? Object.values(errData.details.fieldErrors).flat().join(', ')
        : (errData.error || 'Failed to update doctor');
      alert(`Error: ${errorMsg}`);
    }
    setSubmitting(false);
  };

  const handleDeleteDoctorAction = async (id: string) => {
    setSubmitting(true);
    const res = await fetch(`/api/admin/doctors/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      setConfirmModal({ ...confirmModal, show: false });
    } else {
      alert('Failed to delete doctor');
    }
    setSubmitting(false);
  };

  const handleBulkGenerateAction = async (doctorId: string) => {
    setSubmitting(true);
    const res = await fetch(`/api/admin/doctors/${doctorId}/slots/bulk`, { method: 'POST' });
    if (res.ok) {
      setConfirmModal({ ...confirmModal, show: false });
      alert('Weekly slots generated successfully!');
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to generate slots');
    }
    setSubmitting(false);
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSlotModal) return;
    setSubmitting(true);
    const res = await fetch(`/api/admin/doctors/${showSlotModal}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slotForm),
    });
    if (res.ok) {
      alert('Slot added successfully');
      setShowSlotModal(null);
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to add slot');
    }
    setSubmitting(false);
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctor Management</h1>
          <p className="text-muted-fg mt-1">Add new specialists and configure their availability slots.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 h-11 rounded-lg bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Doctor
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
        <input
          type="text"
          placeholder="Filter doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border outline-none focus:ring-2 focus:ring-brand-600/20 transition-all"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm">Loading doctors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-100/60 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col group hover:shadow-xl hover:shadow-brand-600/5 transition-all duration-300"
            >
              <div className="flex gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate tracking-tight">{doc.name}</h3>
                  <p className="text-[12px] font-bold text-brand-600 uppercase tracking-wider">{doc.specialty}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{doc.qualification}</p>
                </div>
              </div>

              <div className="flex-1 mb-5">
                <p className="text-[11px] text-slate-500 line-clamp-3 bg-slate-50/50 p-3 rounded-lg border border-slate-100/50 italic leading-relaxed">
                  &ldquo;{doc.bio || 'No bio provided for this specialist.'}&rdquo;
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSlotModal(doc.id)}
                    className="flex-1 h-8 rounded-lg bg-brand-50 text-brand-600 text-[11px] font-bold hover:bg-brand-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3 h-3" />
                    Slots
                  </button>
                  <button 
                    onClick={() => setConfirmModal({
                      show: true,
                      title: 'Weekly Slots',
                      message: `Generate weekly availability for ${doc.name}?`,
                      type: 'success',
                      onConfirm: () => handleBulkGenerateAction(doc.id)
                    })}
                    className="flex-1 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3 h-3" />
                    Gen. Week
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingDoctor(doc)}
                    className="flex-1 h-8 rounded-lg border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-colors gap-2 text-[11px] font-bold"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button 
                    onClick={() => setConfirmModal({
                      show: true,
                      title: 'Remove Doctor',
                      message: `Remove ${doc.name}?`,
                      type: 'danger',
                      onConfirm: () => handleDeleteDoctorAction(doc.id)
                    })}
                    className="flex-1 h-8 rounded-lg border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all gap-2 text-[11px] font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className={cn(
              "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
              confirmModal.type === 'danger' ? "bg-red-100 text-red-600" : 
              confirmModal.type === 'success' ? "bg-emerald-100 text-emerald-600" : 
              "bg-amber-100 text-amber-600"
            )}>
              {confirmModal.type === 'danger' ? <Trash2 className="w-8 h-8" /> : 
               confirmModal.type === 'success' ? <Calendar className="w-8 h-8" /> : 
               <AlertTriangle className="w-8 h-8" />}
            </div>
            <h2 className="text-xl font-bold mb-2">{confirmModal.title}</h2>
            <p className="text-sm text-muted-fg mb-8 px-4">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className="flex-1 h-11 rounded-xl border border-border text-foreground font-bold text-sm hover:bg-muted transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                disabled={submitting}
                className={cn(
                  "flex-1 h-11 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2",
                  confirmModal.type === 'danger' ? "bg-red-500 hover:bg-red-600" : 
                  confirmModal.type === 'success' ? "bg-emerald-600 hover:bg-emerald-700" : 
                  "bg-brand-600 hover:bg-brand-700"
                )}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Doctor Profile</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-fg hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDoctor} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Dr. John Doe"
                    value={docForm.name}
                    onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-brand-600/20"
                  />
                </div>
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider ml-1">Specialty</label>
                  <select
                    value={docForm.specialty}
                    onChange={(e) => setDocForm({ ...docForm, specialty: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-brand-600/20 font-medium"
                  >
                    {['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'General Medicine'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider ml-1">Qualification</label>
                <input
                  required
                  type="text"
                  placeholder="MBBS, MS"
                  value={docForm.qualification}
                  onChange={(e) => setDocForm({ ...docForm, qualification: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider ml-1">Short Bio</label>
                <textarea
                  placeholder="Brief description of experience..."
                  value={docForm.bio}
                  onChange={(e) => setDocForm({ ...docForm, bio: e.target.value })}
                  className="w-full h-24 p-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors mt-4 shadow-lg shadow-brand-600/25"
              >
                {submitting ? 'Creating...' : 'Register Specialist'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Doctor Profile</h2>
              <button onClick={() => setEditingDoctor(null)} className="text-muted-fg hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateDoctor} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={editingDoctor.name}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-brand-600/20"
                  />
                </div>
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider ml-1">Specialty</label>
                  <select
                    value={editingDoctor.specialty}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialty: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-brand-600/20 font-medium"
                  >
                    {['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'General Medicine'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider ml-1">Qualification</label>
                <input
                  required
                  type="text"
                  value={editingDoctor.qualification}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, qualification: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider ml-1">Short Bio</label>
                <textarea
                  value={editingDoctor.bio}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                  className="w-full h-24 p-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors mt-4 shadow-lg shadow-brand-600/25"
              >
                {submitting ? 'Saving Changes...' : 'Update Specialist'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Availability Slot</h2>
              <button onClick={() => setShowSlotModal(null)} className="text-muted-fg hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSlot} className="p-6 space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider ml-1">Date</label>
                <input
                  required
                  type="date"
                  value={slotForm.date}
                  onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider ml-1">Start Time</label>
                  <input
                    required
                    type="time"
                    value={slotForm.start_time}
                    onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider ml-1">End Time</label>
                  <input
                    required
                    type="time"
                    value={slotForm.end_time}
                    onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors mt-4 shadow-lg shadow-emerald-600/25"
              >
                {submitting ? 'Generating...' : 'Confirm Availability'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
