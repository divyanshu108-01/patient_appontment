import { auth, createClerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { type NextRequest, NextResponse } from 'next/server';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(
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
  
  // Generate slots for the next 7 days, 9AM to 5PM, every 30 mins
  const slots = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    for (let hour = 9; hour < 17; hour++) {
      for (let min of ['00', '30']) {
        slots.push({
          doctor_id: id,
          date: dateStr,
          start_time: `${hour.toString().padStart(2, '0')}:${min}`,
          end_time: min === '00' ? `${hour.toString().padStart(2, '0')}:30` : `${(hour + 1).toString().padStart(2, '0')}:00`,
          is_available: true
        });
      }
    }
  }

  const { error } = await supabase
    .from('slots')
    .insert(slots);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Slots generated successfully', count: slots.length });
}
