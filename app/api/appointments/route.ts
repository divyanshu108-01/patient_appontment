import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { NextResponse, type NextRequest } from 'next/server';
import { bookAppointmentSchema } from '@/lib/validations';

// POST - Book an appointment
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { doctor_id, slot_id, visit_reason } = body;
  const parsed = bookAppointmentSchema.safeParse({ doctor_id, slot_id, visit_reason });

  if (!parsed.success) {
    console.error('Booking Validation Error:', parsed.error.format());
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Use the parsed data
  const { doctor_id: dId, slot_id: sId, visit_reason: vReason } = parsed.data;

  // Check if slot is available
  const { data: slot } = await supabase
    .from('slots')
    .select('*')
    .eq('id', sId)
    .eq('is_available', true)
    .single();

  if (!slot) {
    return NextResponse.json({ error: 'Slot is not available' }, { status: 409 });
  }

  // Check for duplicate booking
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', userId)
    .eq('slot_id', sId)
    .not('status', 'in', '("cancelled","rejected")')
    .single();

  if (existing) {
    return NextResponse.json({ error: 'You have already booked this slot' }, { status: 409 });
  }

  // Create appointment
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: userId,
      patient_name: body.patient_name || 'Patient',
      patient_email: body.patient_email || '',
      doctor_id: dId,
      slot_id: sId,
      visit_reason: vReason,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark slot as unavailable
  await supabase.from('slots').update({ is_available: false }).eq('id', sId);

  return NextResponse.json(appointment, { status: 201 });
}

// GET - Patient's own appointments
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctors ( name, specialty, photo_url ),
      slots ( date, start_time, end_time )
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('API Error /api/appointments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
