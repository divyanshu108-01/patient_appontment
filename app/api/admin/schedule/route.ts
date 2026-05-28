import { auth, createClerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { type NextRequest, NextResponse } from 'next/server';
import { ADMIN_EMAIL } from '@/lib/constants';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await clerkClient.users.getUser(userId);
  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() || '';
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const date = request.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctors ( name, specialty, photo_url ),
      slots!inner ( date, start_time, end_time )
    `)
    .eq('slots.date', date)
    .eq('status', 'approved')
    .order('created_at');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by doctor
  const grouped: Record<string, { doctor: { name: string; specialty: string; photo_url: string }; appointments: typeof data }> = {};
  for (const appt of data || []) {
    const doctorId = appt.doctor_id;
    if (!grouped[doctorId]) {
      grouped[doctorId] = {
        doctor: appt.doctors as { name: string; specialty: string; photo_url: string },
        appointments: [],
      };
    }
    grouped[doctorId].appointments.push(appt);
  }

  return NextResponse.json({ date, schedule: grouped });
}
