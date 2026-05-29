'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import AuthCard from '@/components/auth/AuthCard';
import AuthDivider from '@/components/auth/AuthDivider';
import EmailInput from '@/components/auth/EmailInput';
import GoogleButton from '@/components/auth/GoogleButton';
import PasswordInput from '@/components/auth/PasswordInput';

export default function SignUpPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSignUp() {
        setLoading(true);
        setError('');
        setSuccess(false);

        if (!email || !password) {
            setError('Please enter an email and password.');
            setLoading(false);
            return;
        }

        setTimeout(() => {
            setSuccess(true);
            router.push('/arena');
        }, 450);
    }

    return (
        <AuthCard>
            <div className='space-y-4'>
                <EmailInput value={email} onChange={setEmail} />
                <PasswordInput value={password} onChange={setPassword} showForgot />
                {error ? <p className='text-center text-sm text-red-500'>{error}</p> : null}
                {success ? <p className='text-center text-sm text-[#1A3C2E]'>Check your email to confirm your account.</p> : null}
                <button
                    type='button'
                    onClick={handleSignUp}
                    disabled={loading}
                    className='mt-2 w-full rounded-xl bg-[#1A3C2E] py-3.5 text-sm font-semibold text-white transition hover:bg-[#142e23] disabled:cursor-not-allowed disabled:opacity-60'>
                    {loading ? 'Signing up...' : 'Sign up'}
                </button>
                <AuthDivider />
                <GoogleButton disabled={loading} onClick={() => setError('Google sign-up is not connected yet.')} />
                <p className='mt-6 text-center text-sm text-gray-500'>
                    Already have an account?{' '}
                    <Link href='/sign-in' className='font-medium text-[#1A3C2E]'>
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthCard>
    );
}
