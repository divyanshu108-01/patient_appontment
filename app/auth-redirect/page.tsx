// Already handled by the Sidebar which redirects correctly based on Clerk publicMetadata
// No explicit need for a separate sign-in redirect page if middleware is set up

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function AuthRedirect() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect('/sign-in');
  }

  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() || '';
  const isAdmin = email === ADMIN_EMAIL.toLowerCase();
  
  if (isAdmin) {
    redirect('/admin/dashboard');
  } else {
    redirect('/patient/dashboard');
  }
}
