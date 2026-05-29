import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <SignIn
          forceRedirectUrl="/auth-redirect"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-lg border border-border rounded-2xl w-full',
            },
          }}
        />
        <div className="mt-4 text-center">
          <a 
            href="/forgot-password" 
            className="text-[13px] font-semibold text-brand-600 hover:underline"
          >
            Forgot Password? (OTP Verification)
          </a>
        </div>
      </div>
    </div>
  );
}
