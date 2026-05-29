import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AuthRedirect() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect('/sign-in');
  }

  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() || '';
  const name = user.fullName || user.firstName || email.split('@')[0];
  const isAdmin = email === ADMIN_EMAIL.toLowerCase();
  
  // Sync user to Supabase profiles table
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      name: name,
      email: email,
      role: isAdmin ? 'admin' : 'patient',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing user profile:', error);
  }

  if (isAdmin) {
    redirect('/admin/dashboard');
  } else {
    redirect('/patient/dashboard');
  }
}
