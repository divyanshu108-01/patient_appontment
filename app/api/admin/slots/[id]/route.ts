import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { type NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  // Check if slot is booked
  const { data: appointment } = await supabase
    .from('appointments')
    .select('id')
    .eq('slot_id', id)
    .not('status', 'in', '("cancelled","rejected")')
    .single();

  if (appointment) {
    return NextResponse.json(
      { error: 'Cannot delete a slot that has an active booking' },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('slots').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Slot deleted' });
}
