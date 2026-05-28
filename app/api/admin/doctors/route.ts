import { auth, createClerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { NextResponse, type NextRequest } from 'next/server';
import { createDoctorSchema } from '@/lib/validations';
import { ADMIN_EMAIL } from '@/lib/constants';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function isAdmin(userId: string): Promise<boolean> {
  const user = await clerkClient.users.getUser(userId);
  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() || '';
  return email === ADMIN_EMAIL.toLowerCase();
}

// POST - Create doctor (admin)
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createDoctorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('doctors')
    .insert({ ...parsed.data, created_by: userId })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// GET - List doctors (admin)
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
