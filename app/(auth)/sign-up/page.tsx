'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AuthCard from '@/components/auth/AuthCard';
import AuthDivider from '@/components/auth/AuthDivider';
import EmailInput from '@/components/auth/EmailInput';
import GoogleButton from '@/components/auth/GoogleButton';
import PasswordInput from '@/components/auth/PasswordInput';
import AuthForm, { AuthMultiForm } from '@/components/auth/AuthForm';
import { checkEmail, checkPassword } from '@/lib/utils/authUtils';
import { supabase } from '@/supabase';
import BirthdayInput from '@/components/auth/BirthDayInput';
import { toIsoFromInput } from '@/lib/utils/date';
import { signUpUser } from '@/lib/supabase/auth';
import { getUser, signIn } from '@/lib/supabase/client';

export default function SignUpPage() {
    const router = useRouter();

    const [step, setStep] = useState<"form" | "confirm">("form");

    const [name, setName] = useState<[string, string]>(['', '']);
    const [birthday, setBirthday] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUser(supabase).then(({ user }) => {
            if (user) router.push("/");
        });
    }, []);

    async function handleSignUp() {
        setLoading(true);
        setError('');

        const birthdayToIso = toIsoFromInput(birthday);

        if (!email || !password) {
            setError('Please enter an email and password.');
            setLoading(false);
            return;
        }

        const pwError = checkPassword(password);
        const emailError = checkEmail(email);

        if (pwError) {
            setError("Invalid Password");
            setLoading(false);
            return;
        }

        if (emailError) {
            setError("Invalid Email");
            setLoading(false);
            return;
        }

        try {
            const { data, profile } = await signUpUser(
                supabase,
                email,
                password,
                name,
                birthdayToIso
            );

            console.log("Successful Registration:", data, profile);

            // ❗ IMPORTANT: go to confirm screen instead of logging in
            setStep("confirm");

        } catch (e: any) {
            setError(e.message);
        }

        setLoading(false);
    }

    return (
        <AuthCard>
            {step === "form" ? (
                <div className='space-y-4'>
                    <AuthMultiForm
                        label={'Name'}
                        value={name}
                        onChange={setName}
                        type='text'
                        placeholder={['First Name', 'Last Name']}
                    />

                    <BirthdayInput value={birthday} onChange={setBirthday} />
                    <EmailInput value={email} onChange={setEmail} />
                    <PasswordInput value={password} onChange={setPassword} />

                    {error && <p className='text-sm text-red-500'>{error}</p>}

                    <div className='flex justify-center gap-2'>
                        <p className='text-sm text-slate-600'>
                            Already have an account?
                        </p>
                        <Link
                            className='text-sm font-semibold text-slate-600 hover:text-slate-900'
                            href='/sign-in'
                        >
                            Sign In
                        </Link>
                    </div>

                    <AuthDivider />

                    <div className='flex flex-col gap-3'>
                        <GoogleButton />

                        <button
                            className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50'
                            disabled={loading || !email || !password}
                            onClick={handleSignUp}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            ) : (
                // ✅ CONFIRM SCREEN
                <div className="flex flex-col items-center text-center space-y-4 py-6">
                    <h2 className="text-xl font-semibold text-[#1A1A1A]">
                        Confirm your email
                    </h2>

                    <p className="text-sm text-slate-600">
                        We’ve sent a confirmation link to:
                    </p>

                    <p className="text-sm font-semibold text-[#1A3C2E]">
                        {email}
                    </p>

                    <p className="text-xs text-slate-500">
                        Check your inbox and spam folder to continue.
                    </p>

                    <button
                        onClick={() => setStep("form")}
                        className="mt-4 text-sm font-medium text-[#1A3C2E] hover:underline"
                    >
                        ← Go back
                    </button>

                    <button
                        onClick={() => router.push("/sign-in")}
                        className="text-sm text-slate-600 hover:text-slate-900"
                    >
                        Already confirmed? Sign in
                    </button>
                </div>
            )}
        </AuthCard>
    );
}