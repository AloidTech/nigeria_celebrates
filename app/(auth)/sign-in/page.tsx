'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import AuthCard from '@/components/auth/AuthCard';
import EmailInput from '@/components/auth/EmailInput';
import PasswordInput from '@/components/auth/PasswordInput';
import { getSupabaseBrowserClient, signIn } from '@/lib/supabase/client';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSignIn() {
        setLoading(true);
        setError('');

        if (!email || !password) {
            setError('Please enter an email and password.');
            setLoading(false);
            return;
        }

        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            setError('Authentication service unavailable.');
            setLoading(false);
            return;
        }

        const result = await signIn(supabase, email, password);
        
        if (!result.success) {
            setError(result.error?.message || 'Invalid login credentials.');
            setLoading(false);
            return;
        }

        // Successfully signed in
        router.push('/');
    }

    return (
        <AuthCard>
            <div className='space-y-4'>
                <EmailInput value={email} onChange={setEmail} />
                <PasswordInput value={password} onChange={setPassword} showForgot />
                {error ? <p className='text-center text-sm text-red-500'>{error}</p> : null}
                <button
                    type='button'
                    onClick={handleSignIn}
                    disabled={loading}
                    className='mt-2 w-full rounded-xl bg-[#1A3C2E] py-3.5 text-sm font-semibold text-white transition hover:bg-[#142e23] disabled:cursor-not-allowed disabled:opacity-60'>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <p className='mt-6 text-center text-sm text-gray-500'>
                    Don&apos;t have an account?{' '}
                    <Link href='/sign-up' className='font-medium text-[#1A3C2E]'>
                        Sign Up
                    </Link>
                </p>
            </div>
        </AuthCard>
    );
}
