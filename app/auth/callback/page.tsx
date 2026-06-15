/*
  /app/auth/callback/page.tsx
  Handles the Supabase e‑mail verification redirect.
  Supabase adds `access_token`, `refresh_token`, `type=signup` etc. to the URL
  after the user clicks the verification link. `supabase.auth.getSessionFromUrl`
  parses these parameters, stores the session in client‑side storage, and then we
  can check that `user.email_confirmed_at` is populated. Once verified we redirect
  the user to the main app (e.g. `/`).
*/

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function EmailVerificationCallback() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'error' | 'verified'>('processing');

  useEffect(() => {
    async function handleRedirect() {
      // Supabase JS client automatically parses authentication tokens from the URL hash on init.
      // We just fetch the user to check if they are signed in and verified.
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Verification callback error:', error);
        setStatus('error');
        return;
      }

      if (user && user.email_confirmed_at) {
        setStatus('verified');
        // Send the user to the home page (or any protected route).
        router.replace('/');
      } else {
        // This should rarely happen – maybe the link was malformed.
        setStatus('error');
      }
    }

    handleRedirect();
  }, [supabase, router]);

  if (status === 'processing') {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Finalising your account…</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="max-w-md rounded bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-red-600">
            Verification failed
          </h2>
          <p className="mb-4 text-gray-600">
            Something went wrong while confirming your e‑mail address.
          </p>
          <a
            href="/sign-up"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Return to sign‑up
          </a>
        </div>
      </section>
    );
  }

  // 'verified' never actually renders because we redirect above.
  return null;
}
