import { auth, createClerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { type NextRequest, NextResponse } from 'next/server';
import { updateAppointmentSchema } from '@/lib/validations';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await clerkClient.users.getUser(userId);
  if (user.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { status, admin_note } = parsed.data;

  // Get the appointment to find the slot
  const { data: appointment } = await supabase
    .from('appointments')
    .select('slot_id')
    .eq('id', id)
    .single();

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  // Update appointment status
  const { error } = await supabase
    .from('appointments')
    .update({
      status,
      admin_note: admin_note || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If rejected, release the slot
  if (status === 'rejected') {
    await supabase
      .from('slots')
      .update({ is_available: true })
      .eq('id', appointment.slot_id);
  }

  return NextResponse.json({ message: `Appointment ${status}` });
}
