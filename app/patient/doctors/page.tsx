'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  Stethoscope,
  Star,
  MapPin,
  Calendar,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  bio: string;
  photo_url: string;
}

const specialties = [
  'All',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'General Medicine',
  'Neurology',
];

export default function DoctorListingPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  useEffect(() => {
    fetch('/api/doctors')
      .then((res) => res.json())
      .then((data) => {
        setDoctors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
                         doc.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Find a Doctor</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Browse our specialists and book your next consultation.</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100/60 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-brand-100 focus:ring-4 focus:ring-brand-600/5 outline-none text-[13px] transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          <div className="h-4 w-px bg-slate-100 mx-2 hidden md:block" />
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border',
                selectedSpecialty === s
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/10'
                  : 'bg-white text-slate-400 border-slate-100/80 hover:border-slate-200 hover:text-slate-600'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-300 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          <p className="text-[13px] font-medium italic">Finding our specialists...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-2xl border border-slate-100/60">
          <Stethoscope className="w-10 h-10 text-slate-100 mx-auto mb-4" />
          <p className="text-[13px] font-semibold text-slate-400">No doctors match your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-100/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-brand-600/5 transition-all duration-300 flex flex-col h-full group"
            >
              <div className="p-5 flex-1">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-foreground truncate tracking-tight">
                        {doc.name}
                      </h3>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        4.8
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mt-0.5">{doc.specialty}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-1">{doc.qualification}</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-6 h-10 italic opacity-80">
                  &ldquo;{doc.bio || 'Dedicated specialist providing expert healthcare and compassionate treatment.'}&rdquo;
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                    <MapPin className="w-3 h-3 text-brand-400" />
                    <span className="truncate">Central Clinic</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                    <Calendar className="w-3 h-3 text-brand-400" />
                    <span>Mon - Fri</span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 mt-auto">
                <Link
                  href={`/patient/book?doctorId=${doc.id}`}
                  className="w-full h-9 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 text-white text-[11px] font-bold hover:bg-brand-700 transition-all shadow-md shadow-brand-600/10 active:scale-[0.98]"
                >
                  Book Appointment
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
