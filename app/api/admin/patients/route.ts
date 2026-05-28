import { auth, createClerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { ADMIN_EMAIL } from '@/lib/constants';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// GET - All unique patients with their appointment counts (admin only)
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await clerkClient.users.getUser(userId);
  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() || '';
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch all appointments and aggregate unique patients
  const { data, error } = await supabase
    .from('appointments')
    .select('patient_id, patient_name, patient_email, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by patient_id to get unique patients
  const patientsMap: Record<string, {
    patient_id: string;
    patient_name: string;
    patient_email: string;
    total_appointments: number;
    pending: number;
    approved: number;
    last_visit: string;
  }> = {};

  for (const appt of data || []) {
    if (!patientsMap[appt.patient_id]) {
      patientsMap[appt.patient_id] = {
        patient_id: appt.patient_id,
        patient_name: appt.patient_name,
        patient_email: appt.patient_email,
        total_appointments: 0,
        pending: 0,
        approved: 0,
        last_visit: appt.created_at,
      };
    }
    patientsMap[appt.patient_id].total_appointments++;
    if (appt.status === 'pending') patientsMap[appt.patient_id].pending++;
    if (appt.status === 'approved') patientsMap[appt.patient_id].approved++;
  }

  return NextResponse.json(Object.values(patientsMap));
}
