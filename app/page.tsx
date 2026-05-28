'use client';

import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ADMIN_EMAIL } from '@/lib/constants';
import {
  Heart,
  Calendar,
  Shield,
  Clock,
  ArrowRight,
  Stethoscope,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleDashboardRedirect = () => {
    if (user) {
      const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
      const isAdmin = email === ADMIN_EMAIL.toLowerCase();
      router.push(isAdmin ? '/admin/dashboard' : '/patient/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-foreground">MedCare</span>
        </div>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <button
                onClick={handleDashboardRedirect}
                className="px-5 h-10 inline-flex items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="px-5 h-10 inline-flex items-center justify-center rounded-lg border border-border text-foreground text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-5 h-10 inline-flex items-center justify-center rounded-lg border-[1.5px] border-brand-600 text-brand-600 text-sm font-semibold hover:bg-brand-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-5 h-10 inline-flex items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 text-sm font-medium mb-6">
            <Stethoscope className="w-4 h-4" />
            Trusted Healthcare Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Book Your Doctor{' '}
            <span className="text-brand-600">Appointment</span> with Ease
          </h1>
          <p className="text-lg md:text-xl text-muted-fg max-w-2xl mx-auto mb-10">
            Skip the waiting room chaos. Browse doctors, book available slots, and manage your
            appointments — all in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 text-white text-base font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25"
            >
              Book Appointment Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-16 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            Why Choose MedCare?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Easy Scheduling',
                desc: 'Browse doctors by specialty, view available slots for the next 7 days, and book in seconds.',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                desc: 'Your data is protected with industry-standard encryption and role-based access controls.',
              },
              {
                icon: Clock,
                title: 'Real-time Status',
                desc: 'Track your appointment status from booking to approval — no more guesswork.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-fg leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Register', desc: 'Create your free account in seconds' },
              { step: '2', title: 'Find a Doctor', desc: 'Browse by specialty or name' },
              { step: '3', title: 'Book a Slot', desc: 'Pick a time that works for you' },
              { step: '4', title: 'Get Confirmed', desc: 'Admin approves your booking' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-fg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-600" fill="currentColor" />
            <span className="font-semibold text-foreground">MedCare</span>
          </div>
          <p className="text-sm text-muted-fg">
            © {new Date().getFullYear()} MedCare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
