'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AuthCard from '@/components/auth/AuthCard';
import AuthDivider from '@/components/auth/AuthDivider';
import EmailInput from '@/components/auth/EmailInput';
import GoogleButton from '@/components/auth/GoogleButton';
import PasswordInput from '@/components/auth/PasswordInput';
import { getUser, signIn } from '@/lib/supabase/client';
import { supabase } from '@/supabase';
import { useAuth } from '@/lib/auth/AuthContext';

export default function SignInPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user && !loading && !error) {
            router.push("/");
        }
    }, [user, loading, error, router]);

    async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!email || !password) {
            setError('Please enter an email and password.');
            setIsLoading(false);
            return;
        }
        const norm = (n: any) => String(n).trim();

        const { data, error } = await signIn(supabase, norm(email), norm(password));
        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        router.push("/");
        setIsLoading(false);
    }

    return (
        <AuthCard>
            <form onSubmit={(e) => handleSignIn(e)} className='space-y-4'>
                <EmailInput value={email} onChange={setEmail} />
                <PasswordInput value={password} onChange={setPassword} showForgot />
                {error ? <p className='text-center text-sm text-red-500'>{error}</p> : null}
                <button
                    type='submit'
                    disabled={isLoading}
                    className='mt-2 w-full rounded-xl bg-[#1A3C2E] py-3.5 text-sm font-semibold text-white transition hover:bg-[#142e23] disabled:cursor-not-allowed disabled:opacity-60'>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
                <AuthDivider />
                <GoogleButton disabled={isLoading} onClick={() => setError('Google sign-in is not connected yet.')} />
                <p className='mt-6 text-center text-sm text-gray-500'>
                    Don&apos;t have an account?{' '}
                    <Link href='/sign-up' className='font-medium text-[#1A3C2E]'>
                        Sign Up
                    </Link>
                </p>
            </form>
        </AuthCard>
    );
}
