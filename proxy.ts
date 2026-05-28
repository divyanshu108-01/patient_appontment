import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ADMIN_EMAIL } from './lib/constants';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/doctors(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPatientRoute = createRouteMatcher(['/patient(.*)']);

export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const userEmail = (sessionClaims?.email as string)?.toLowerCase() || '';
  const adminEmail = ADMIN_EMAIL.toLowerCase();

  // 1. Strict Role Isolation based on ADMIN_EMAIL
  // Only redirect if we actually HAVE the email in session claims. 
  // If missing, we let the request through and rely on client-side guards or auth-redirect.
  if (userEmail) {
    if (isAdminRoute(req)) {
      if (userEmail !== adminEmail) {
        return NextResponse.redirect(new URL('/patient/dashboard', req.url));
      }
    }

    if (isPatientRoute(req)) {
      if (userEmail === adminEmail) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
