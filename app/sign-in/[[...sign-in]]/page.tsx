import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn
        forceRedirectUrl="/auth-redirect"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg border border-border rounded-2xl',
          },
        }}
      />
    </div>
  );
}
