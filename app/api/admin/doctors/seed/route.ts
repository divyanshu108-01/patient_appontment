import { auth, createClerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { ADMIN_EMAIL } from '@/lib/constants';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const seedDoctors = [
  {
    name: 'Dr. Amit Sharma',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD (Cardiology), DM',
    bio: 'Senior cardiologist with 15+ years of experience in interventional cardiology and heart failure management.',
  },
  {
    name: 'Dr. Neha Gupta',
    specialty: 'Dermatology',
    qualification: 'MBBS, MD (Dermatology)',
    bio: 'Expert in cosmetic dermatology, laser treatments, and skin disorders with a patient-first approach.',
  },
  {
    name: 'Dr. Rajesh Kumar',
    specialty: 'Orthopedics',
    qualification: 'MBBS, MS (Ortho), Fellowship in Joint Replacement',
    bio: 'Specializes in joint replacement surgery, sports injuries, and advanced arthroscopy procedures.',
  },
  {
    name: 'Dr. Meera Patel',
    specialty: 'General Medicine',
    qualification: 'MBBS, MD (Internal Medicine)',
    bio: 'Experienced general physician skilled in managing chronic diseases, infections, and preventive healthcare.',
  },
  {
    name: 'Dr. Vikram Singh',
    specialty: 'Pediatrics',
    qualification: 'MBBS, MD (Pediatrics), Fellowship in Neonatology',
    bio: 'Dedicated pediatrician with expertise in newborn care, childhood vaccinations, and developmental assessments.',
  },
];

// POST - Seed doctors (admin only)
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await clerkClient.users.getUser(userId);
  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() || '';
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const results = [];
  for (const doc of seedDoctors) {
    const { data, error } = await supabase
      .from('doctors')
      .insert(doc)
      .select()
      .single();

    if (error) {
      results.push({ name: doc.name, status: 'failed', error: error.message });
    } else {
      results.push({ name: doc.name, status: 'created', id: data.id });
    }
  }

  return NextResponse.json({ message: 'Seeding complete', results });
}
