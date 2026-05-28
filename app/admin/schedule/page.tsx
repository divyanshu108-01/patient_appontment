'use client';

import { useEffect, useState } from 'react';
import { cn, formatDate, formatTime } from '@/lib/utils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Stethoscope,
  Phone,
  MessageSquare,
} from 'lucide-react';

interface ScheduleEntry {
  doctor: {
    name: string;
    specialty: string;
    photo_url: string;
  };
  appointments: any[];
}

export default function AdminSchedulePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState<Record<string, ScheduleEntry>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/schedule?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setSchedule(data?.schedule || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [date]);

  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  const doctorIds = Object.keys(schedule);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Schedule</h1>
          <p className="text-muted-fg mt-1">Daily overview of all confirmed appointments per doctor.</p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-4 bg-card border border-border p-1.5 rounded-xl">
          <button
            onClick={() => changeDate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-fg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center px-4 min-w-[140px]">
            <span className="text-sm font-bold text-foreground">{formatDate(date)}</span>
            <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-fg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-fg">Loading schedule...</div>
      ) : doctorIds.length === 0 ? (
        <div className="py-20 text-center text-muted-fg bg-card rounded-2xl border border-border">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <p className="text-lg font-medium text-foreground">No bookings today</p>
          <p className="text-sm">There are no approved appointments for this date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {doctorIds.map((id) => {
            const item = schedule[id];
            return (
              <div
                key={id}
                className="bg-card rounded-2xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
              >
                {/* Doctor Head */}
                <div className="px-6 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-600">
                      {item.doctor.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight">{item.doctor.name}</p>
                      <p className="text-xs text-brand-600 font-medium">{item.doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                      {item.appointments.length} Visits
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 p-6 space-y-4">
                  {item.appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="relative pl-6 border-l-2 border-brand-100 py-1 space-y-2 group"
                    >
                      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-brand-600 group-hover:scale-125 transition-transform" />
                      
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                          <Clock className="w-3.5 h-3.5 text-brand-600" />
                          {formatTime(appt.slots.start_time)} – {formatTime(appt.slots.end_time)}
                        </div>
                      </div>

                      <div className="bg-muted px-4 py-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[13px] font-bold text-foreground">{appt.patient_name}</span>
                        </div>
                        <p className="text-xs text-muted-fg leading-relaxed">
                          {appt.visit_reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button className="text-[11px] font-bold text-brand-600 flex items-center gap-1 hover:underline">
                          <MessageSquare className="w-3 h-3" />
                          Pre-visit Notes
                        </button>
                        <button className="text-[11px] font-bold text-slate-400 flex items-center gap-1 hover:text-foreground">
                          <Phone className="w-3 h-3" />
                          Patient Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
