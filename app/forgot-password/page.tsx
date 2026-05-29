'use client';

import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, CheckCircle2, ChevronLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const clerkSignIn = useSignIn();
  const { isLoaded, signIn, setActive } = clerkSignIn as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (!isLoaded) return null;

  // Send OTP to email
  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setSuccessfulCreation(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Verify OTP and reset password
  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/auth-redirect');
      } else {
        console.log(result);
        setError('Verification failed. Please check the code.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-[420px]">
        {/* Back Link */}
        <Link 
          href="/sign-in" 
          className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-400 hover:text-brand-600 mb-6 transition-colors transition-transform hover:-translate-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        <div className="bg-white rounded-3xl border border-border p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          {/* Top accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-600/10" />

          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              {successfulCreation ? (
                <ShieldCheck className="w-6 h-6 text-brand-600" />
              ) : (
                <Lock className="w-5 h-5 text-brand-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {successfulCreation ? 'Verify OTP' : 'Forgot Password?'}
            </h1>
            <p className="text-[14px] text-slate-400 mt-2 leading-relaxed">
              {successfulCreation 
                ? `We've sent a 6-digit verification code to your email address.` 
                : "No worries! Enter your email address and we'll send you an OTP code to reset your password."}
            </p>
          </div>

          <form onSubmit={successfulCreation ? reset : create} className="space-y-5">
            {!successfulCreation ? (
              <div className="space-y-2">
                <label htmlFor="email" className="text-[13px] font-semibold text-slate-700 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="code" className="text-[13px] font-semibold text-slate-700 ml-1">
                    Verification Code (OTP)
                  </label>
                  <input
                    id="code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-[14px] text-center font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="pass" className="text-[13px] font-semibold text-slate-700 ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                    <input
                      id="pass"
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] leading-relaxed flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-[14px] shadow-lg shadow-brand-600/15 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {successfulCreation ? 'Reset Password' : 'Send OTP Code'}
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-slate-400">
            Remembered your password?{' '}
            <Link href="/sign-in" className="font-bold text-brand-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-6 flex items-start gap-4 p-4 rounded-2xl bg-brand-50/50 border border-brand-100/50">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-[12px] text-brand-700/80 leading-relaxed italic">
            "OTP verification ensures that only the rightful owner of this email can reset the password, keeping your medical records safe."
          </p>
        </div>
      </div>
    </div>
  );
}
