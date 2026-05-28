import { auth, createClerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { ADMIN_EMAIL } from '@/lib/constants';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// GET - All appointments (admin)
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

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctors ( name, specialty, photo_url ),
      slots ( date, start_time, end_time )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
