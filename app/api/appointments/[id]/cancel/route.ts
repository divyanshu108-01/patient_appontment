import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { type NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Get the appointment
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, slots(date, start_time)')
    .eq('id', id)
    .eq('patient_id', userId)
    .single();

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  // Check if cancellable (pending or approved, and > 1 hour away)
  if (!['pending', 'approved'].includes(appointment.status)) {
    return NextResponse.json(
      { error: 'Only pending or approved appointments can be cancelled' },
      { status: 400 }
    );
  }

  const slotDateTime = new Date(`${appointment.slots.date}T${appointment.slots.start_time}`);
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

  if (slotDateTime <= oneHourFromNow) {
    return NextResponse.json(
      { error: 'Cannot cancel appointments less than 1 hour away' },
      { status: 400 }
    );
  }

  // Cancel the appointment
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Release the slot
  await supabase.from('slots').update({ is_available: true }).eq('id', appointment.slot_id);

  return NextResponse.json({ message: 'Appointment cancelled' });
}
