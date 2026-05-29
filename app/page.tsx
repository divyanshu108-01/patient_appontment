'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Heart,
  Calendar,
  Shield,
  Clock,
  ArrowRight,
  Stethoscope,
  Users,
  CheckCircle2,
  Activity,
  Award,
  Zap,
  Globe,
} from 'lucide-react';

function StatTicker({ label, val }: { label: string, val: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  const rawNum = parseFloat(val.replace(/,/g, '').replace(/[^\d.]/g, ''));
  const suffix = val.replace(/[\d.,]/g, '');
  const isFloat = val.includes('.');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let startTimestamp: number | null = null;
        const duration = 2500;

        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          
          setCount(rawNum * easeProgress);

          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        
        window.requestAnimationFrame(step);
        observer.disconnect();
      }
    });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rawNum]);

  const displayString = isFloat 
    ? count.toFixed(1) + suffix 
    : Math.floor(count).toLocaleString() + suffix;

  return (
    <div ref={ref} className="flex flex-col items-center justify-center text-center space-y-2">
      <div className="text-5xl md:text-6xl font-black text-[#0F172A] tracking-tight">{displayString}</div>
      <div className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.15em]">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleDashboardRedirect = () => {
    if (user) {
      router.push('/patient/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] selection:bg-brand-100 selection:text-brand-700">
      <style>{`
        @keyframes slideUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 bg-white/80 backdrop-blur-md border-b border-brand-100/30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/20 group cursor-pointer overflow-hidden">
             <img src="/logo.png" alt="Logo" className="w-full h-full object-contain bg-white" />
          </div>
          <span className="text-2xl font-black text-foreground tracking-tight">Med<span className="text-brand-600">Care</span></span>
        </div>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <button
                onClick={handleDashboardRedirect}
                className="px-6 h-11 inline-flex items-center justify-center rounded-xl bg-brand-600 text-white text-[14px] font-bold hover:bg-brand-700 transition-all shadow-md active:scale-95"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="px-6 h-11 inline-flex items-center justify-center rounded-xl border-2 border-brand-100 text-slate-600 text-[14px] font-bold hover:bg-white hover:border-brand-600 hover:text-brand-600 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="hidden sm:inline-flex px-6 h-11 items-center justify-center rounded-xl text-slate-600 text-[14px] font-bold hover:text-brand-600 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="#about"
                className="px-8 h-12 inline-flex items-center justify-center rounded-xl bg-brand-600 text-white text-[15px] font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/25 active:scale-95"
              >
                About
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative px-6 md:px-12 py-20 md:py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-brand-50 rounded-full blur-[120px] opacity-20 -z-10" />
          
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-blue-100 shadow-sm text-blue-600 text-sm font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-2 duration-700">
              TRUSTED HEALTHCARE EVOLUTION
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[1.05] tracking-tighter text-sharp">
              Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-500">Reimagined</span> for You.
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed text-sharp">
              Skip the frustration. Experience the most intuitive doctor appointment booking platform designed for modern patient care.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-10 h-14 inline-flex items-center justify-center gap-3 rounded-2xl bg-brand-600 text-white text-[17px] font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/30 active:scale-95 group"
              >
                Start Booking Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="flex -space-x-3 items-center">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                  </div>
                ))}
                <div className="pl-6 text-sm font-bold text-slate-600 text-sharp">Joined by 10k+ Patients</div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Alternate Card Layout Section */}
        <section className="px-6 md:px-12 py-24 bg-white border-y border-brand-50">
          <div className="max-w-7xl mx-auto space-y-32">
            
            {/* Feature 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-brand-600" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight tracking-tight text-sharp">
                  Find the Best <br /> Specialists in Seconds
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Our database features over 500+ board-certified doctors across 40+ specialties. Filter by rating, proximity, and real-time availability.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-600" />
                    <span className="font-bold text-slate-700">Verified Profiles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-600" />
                    <span className="font-bold text-slate-700">Real Reviews</span>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-brand-600 rounded-3xl blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative bg-brand-50 rounded-[2.5rem] p-4 aspect-square flex flex-col border border-brand-100 overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=1000" alt="Doctor Profile" className="w-full h-full object-cover rounded-3xl shadow-lg transition-transform duration-700 group-hover:scale-105" />
                   <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl flex flex-col items-center text-center">
                      <div className="text-xl md:text-2xl font-black text-foreground">Dr. Alexander Smith</div>
                      <div className="text-sm font-bold text-brand-600 uppercase tracking-widest mt-1">Chief Surgeon</div>
                   </div>
                </div>
              </div>
            </div>

            {/* Feature 2 (Reversed) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
              <div className="lg:order-2 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight tracking-tight text-sharp">
                  Smart Scheduling, <br /> Zero Wait Time
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed">
                  No more endless phone calls. Our smart booking system updates in real-time. Pick a slot, get instant confirmation, and show up exactly when needed.
                </p>
                <div className="space-y-4 pt-4">
                  {[
                    'Instant SMS Notifications',
                    'Calendar Integration',
                    '1-Click Rescheduling',
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-slate-700">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:order-1 relative group">
                <div className="absolute inset-0 bg-emerald-500 rounded-3xl blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative bg-emerald-50 rounded-[2.5rem] p-12 aspect-[4/3] flex items-center justify-center border border-emerald-100">
                  <div className="grid grid-cols-2 gap-4 w-full h-full p-4 items-center content-center text-left">
                    {[
                      { icon: Shield, title: 'HIPAA Secure', desc: 'Bank-level encrypted records.' },
                      { icon: Zap, title: 'Instant Sync', desc: 'Real-time multi-device updates.' },
                      { icon: Clock, title: 'Zero Wait', desc: 'Smart routing cuts wait 80%.' },
                      { icon: Heart, title: '24/7 Care', desc: 'Priority support for you.' }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col p-6 rounded-[1.5rem] bg-white shadow-sm border border-emerald-50 hover:shadow-md transition-all hover:-translate-y-1">
                         <item.icon className="w-6 h-6 text-emerald-600 mb-4" />
                         <div className="font-black text-[#0F172A] text-[17px] leading-tight mb-2">{item.title}</div>
                         <div className="text-[14px] text-slate-500 font-medium leading-relaxed">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 md:px-12 py-16 border-y border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Successful Appointments', val: '500k+' },
                { label: 'Verified Doctors', val: '1,200+' },
                { label: 'Patient Satisfaction', val: '99.9%' },
                { label: 'Cities Covered', val: '50+' },
              ].map((s) => (
                <StatTicker key={s.label} label={s.label} val={s.val} />
              ))}
            </div>
          </div>
        </section>

        {/* Final Feature Grid */}
        <section id="about" className="px-6 md:px-12 py-24">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Everything You Need.</h2>
              <p className="text-slate-500 text-[18px]">The complete ecosystem for your health management.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: 'Data Sovereignty', desc: 'Your medical data belongs to you. Fully HIPAA compliant and encrypted.', bg: 'bg-blue-50', color: 'text-blue-600' },
                { icon: Award, title: 'Quality Assurance', desc: 'We only partner with clinics that meet our rigorous standards of care.', bg: 'bg-amber-50', color: 'text-amber-600' },
                { icon: Globe, title: 'Anywhere Access', desc: 'Securely access your records and book appointments from any device, anywhere.', bg: 'bg-purple-50', color: 'text-purple-600' },
              ].map((f) => (
                <div key={f.title} className="p-10 bg-white rounded-[2rem] border border-slate-100 hover:border-brand-100 hover:shadow-xl transition-all group">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", f.bg)}>
                    <f.icon className={cn("w-7 h-7", f.color)} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 md:px-12 py-32 text-center">
            <div className="max-w-3xl mx-auto space-y-10">
                <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">Ready to Experience <br /> the Future of Care?</h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        href="/sign-up"
                        className="px-12 h-16 inline-flex items-center justify-center rounded-2xl bg-brand-600 text-white text-lg font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/30 active:scale-95"
                    >
                        Create Your Account
                    </Link>
                    <Link
                        href="/patient/doctors"
                    className="px-12 h-16 inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 text-slate-600 text-lg font-bold hover:bg-white hover:border-brand-600 hover:text-brand-600 transition-all"
                    >
                        Browse Doctors
                    </Link>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-16 bg-white border-t border-brand-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-brand-600" fill="currentColor" />
              <span className="text-2xl font-black text-foreground">MedCare</span>
            </div>
            <p className="text-slate-500 max-w-sm">Providing seamless healthcare management through technology. Built for patients, loved by doctors.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">Platform</h4>
            <ul className="space-y-3 text-slate-500 text-sm">
              <li><Link href="/patient/doctors">Doctor Search</Link></li>
              <li><Link href="/sign-up">Request Early Access</Link></li>
              <li><Link href="/sign-in">Admin Portal</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">Support</h4>
            <ul className="space-y-3 text-slate-500 text-sm">
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} MedCare Technologies. Crafted with heart for healthcare.
          </p>
          <div className="flex gap-6 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Facebook</span>
                <span>Twitter</span>
                <span>LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
