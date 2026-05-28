'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { cn, formatTime } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
}

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const doctorId = searchParams.get('doctorId');

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    if (!doctorId) return;

    setLoading(true);
    Promise.all([
      fetch('/api/doctors').then((res) => res.json()),
      fetch(`/api/doctors/${doctorId}/slots`).then((res) => res.json()),
    ])
      .then(([docs, slotData]) => {
        const docList = Array.isArray(docs) ? docs : [];
        const slotList = Array.isArray(slotData) ? slotData : [];
        const doc = docList.find((d: Doctor) => d.id === doctorId);
        setDoctor(doc || null);
        setSlots(slotList);
        
        if (slotList.length > 0) {
          const uniqueDates = [...new Set(slotList.map((s: Slot) => s.date))].sort() as string[];
          setSelectedDate(uniqueDates[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, [doctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !reason) return;

    setSubmitting(true);
    setError(null);

    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress || '';
      const emailName = userEmail.split('@')[0].replace(/[0-9]/g, '');
      const derivedName = user?.fullName || (emailName.charAt(0).toUpperCase() + emailName.slice(1)) || 'Patient';

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: doctorId,
          slot_id: selectedSlot,
          visit_reason: reason,
          patient_name: derivedName,
          patient_email: userEmail,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/patient/dashboard'), 3000);
      } else {
        const data = await res.json();
        if (data.details?.fieldErrors) {
          const msgs = Object.values(data.details.fieldErrors).flat().join(', ');
          setError(msgs || data.error);
        } else {
          setError(data.error || 'Something went wrong');
        }
      }
    } catch {
      setError('Connection failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar helpers
  const availableDates = useMemo(() => new Set(slots.map((s) => s.date)), [slots]);
  const filteredSlots = useMemo(() => slots.filter((s) => s.date === selectedDate), [slots, selectedDate]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [calendarMonth]);

  const getDateString = (day: number) => {
    const y = calendarMonth.getFullYear();
    const m = String(calendarMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  if (!doctorId) return <div className="p-8 text-center text-slate-400">Invalid Doctor ID</div>;
  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
      <p className="text-sm">Loading booking details...</p>
    </div>
  );

  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Appointment Requested!</h1>
        <p className="text-sm text-slate-400 mb-8">
          Your request has been sent for approval. Redirecting...
        </p>
        <Link
          href="/patient/dashboard"
          className="inline-flex items-center text-sm text-brand-600 font-medium hover:underline"
        >
          Go to Dashboard now →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Link
        href="/patient/doctors"
        className="inline-flex items-center gap-1 text-[12px] text-slate-400 hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Back to doctors
      </Link>

      {/* Doctor Info Card - Compact */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground">{doctor?.name}</h1>
          <p className="text-[12px] text-brand-600 font-medium">{doctor?.specialty}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* Left: Calendar + Time */}
        <div className="space-y-4">
          {/* Calendar - Compact */}
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                Select Date
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                  className="w-6 h-6 rounded-md hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[12px] font-bold text-foreground min-w-[100px] text-center">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                  className="w-6 h-6 rounded-md hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-foreground transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-0.5">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="h-6 flex items-center justify-center text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid - Smaller Days */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} className="h-8" />;
                const dateStr = getDateString(day);
                const isAvailable = availableDates.has(dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedSlot(null);
                    }}
                    className={cn(
                      'h-8 rounded-lg text-[12px] font-bold transition-all relative',
                      isSelected
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                        : isAvailable
                        ? 'text-foreground hover:bg-brand-50 hover:text-brand-600'
                        : 'text-slate-200 cursor-not-allowed',
                      isToday && !isSelected && 'ring-1 ring-brand-100'
                    )}
                  >
                    {day}
                    {isAvailable && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-brand-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Selector - Smaller Buttons */}
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              Select Time
            </h3>
            {selectedDate ? (
              filteredSlots.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                  {filteredSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot.id)}
                      className={cn(
                        'h-8 rounded-md text-[11px] font-bold transition-all',
                        selectedSlot === slot.id
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                          : 'bg-slate-50 text-slate-500 hover:bg-brand-50 hover:text-brand-600 border border-slate-50'
                      )}
                    >
                      {formatTime(slot.start_time).replace(' AM', 'A').replace(' PM', 'P')}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic text-center py-2">No slots for this date.</p>
              )
            ) : (
              <p className="text-[11px] text-slate-400 italic text-center py-2">Select a date first</p>
            )}
          </div>
        </div>

        {/* Right: Reason + Submit */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <h3 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Reason for Visit</h3>
            <textarea
              required
              placeholder="Briefly describe..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-32 p-3 rounded-lg bg-slate-50 border border-slate-50 outline-none focus:ring-2 focus:ring-brand-600/5 focus:border-brand-100 transition-all text-[12px] text-foreground placeholder:text-slate-300 resize-none font-medium"
            />
          </div>

          {/* Summary - Compact */}
          {selectedSlot && (
            <div className="bg-brand-50/50 rounded-xl p-4 border border-brand-100/50">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-600 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium tracking-tight">Doctor</span>
                  <span className="font-bold text-foreground">{doctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium tracking-tight">Date</span>
                  <span className="font-bold text-foreground">
                    {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium tracking-tight">Time</span>
                  <span className="font-bold text-foreground">
                    {formatTime(filteredSlots.find(s => s.id === selectedSlot)?.start_time || '')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 text-red-500 text-[11px] flex items-start gap-2 border border-red-100 font-bold">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !selectedSlot || !reason}
            className="w-full h-10 rounded-lg bg-brand-600 text-white text-[13px] font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Confirming...
              </>
            ) : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="p-12 flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
        <span className="text-sm">Loading...</span>
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
