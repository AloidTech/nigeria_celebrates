'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AuthCard from '@/components/auth/AuthCard';
import EmailInput from '@/components/auth/EmailInput';
import PasswordInput from '@/components/auth/PasswordInput';
import { supabase } from '@/supabase';
import { signUpUser } from '@/lib/supabase/queries/auth';
import { getUser } from '@/lib/supabase/client';

export default function SignUpPage() {
    const router = useRouter();

    const [step, setStep] = useState<"step1" | "step2" | "step3" | "confirm">("step1");

    // Step 1
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    
    // Step 2
    const [name, setName] = useState<[string, string]>(['', '']);
    const [birthday, setBirthday] = useState('');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    
    // Step 3
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUser(supabase).then(({ user }) => {
            if (user) router.push("/");
        });
    }, []);

    function checkEmail(email: string) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !re.test(email);
    }

    function checkPassword(pass: string) {
        return pass.length < 6;
    }

    function handleStep1() {
        setError('');
        if (!username || !email) {
            setError('Please enter a username and email.');
            return;
        }
        if (checkEmail(email)) {
            setError('Invalid Email');
            return;
        }
        setStep("step2");
    }

    function handleStep2() {
        setError('');
        if (!name[0] || !name[1] || !birthday || !password) {
            setError('Please fill out all fields.');
            return;
        }
        if (checkPassword(password)) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setStep("step3");
    }

    async function handleSignUp() {
        setLoading(true);
        setError('');

        const birthdayToIso = birthday ? new Date(birthday).toISOString() : '';

        try {
            const { data, profile } = await signUpUser(
                supabase,
                email,
                password,
                name,
                birthdayToIso,
                username,
                avatarFile,
                description
            );

            console.log("Successful Registration:", data, profile);

            // ❗ IMPORTANT: go to confirm screen instead of logging in
            setStep("confirm");

        } catch (e: any) {
            setError(e.message || 'Registration failed');
        }

        setLoading(false);
    }

    return (
        <AuthCard>
            {step === "step1" && (
                <div className='space-y-4'>
                    <h2 className="text-xl font-bold text-center mb-6">Create your account</h2>
                    
                    <div>
                        <label className='block text-sm font-semibold text-[#1A1A1A] mb-1'>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. zane"
                            className='w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-[#1A3C2E] focus:ring-2 focus:ring-[#1A3C2E]/20'
                        />
                    </div>

                    <EmailInput value={email} onChange={setEmail} />

                    {error && <p className='text-sm text-red-500 text-center'>{error}</p>}

                    <div className='flex flex-col gap-3 mt-6'>
                        <button
                            className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A3C2E] px-4 py-3 text-white hover:bg-[#142e23] focus:outline-none focus:ring-2 focus:ring-[#1A3C2E]/40 disabled:opacity-50'
                            onClick={handleStep1}
                        >
                            Continue
                        </button>
                    </div>

                    <div className='flex justify-center gap-2 mt-4'>
                        <p className='text-sm text-slate-600'>Already have an account?</p>
                        <Link className='text-sm font-semibold text-[#1A3C2E] hover:underline' href='/sign-in'>
                            Sign In
                        </Link>
                    </div>
                </div>
            )}

            {step === "step2" && (
                <div className='space-y-4'>
                    <div className="flex items-center mb-2">
                        <button onClick={() => setStep("step1")} className="text-sm text-slate-500 hover:text-slate-900">← Back</button>
                        <h2 className="text-lg font-bold mx-auto pr-8">Personal Info</h2>
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-[#1A1A1A] mb-1'>Name</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={name[0]}
                                onChange={(e) => setName([e.target.value, name[1]])}
                                placeholder="First Name"
                                className='w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-[#1A3C2E] focus:ring-2 focus:ring-[#1A3C2E]/20'
                            />
                            <input
                                type="text"
                                value={name[1]}
                                onChange={(e) => setName([name[0], e.target.value])}
                                placeholder="Last Name"
                                className='w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-[#1A3C2E] focus:ring-2 focus:ring-[#1A3C2E]/20'
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-[#1A1A1A] mb-1'>Birthday</label>
                        <input
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            className='w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-[#1A3C2E] focus:ring-2 focus:ring-[#1A3C2E]/20'
                        />
                    </div>

                    <PasswordInput value={password} onChange={setPassword} />

                    <label className='block mt-2'>
                        <span className='mb-1 block text-sm font-semibold text-[#1A1A1A]'>Short Bio (Optional)</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell us a little about yourself..."
                            className='w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-[#1A3C2E] focus:ring-2 focus:ring-[#1A3C2E]/20 h-24 resize-none'
                        />
                    </label>

                    {error && <p className='text-sm text-red-500 text-center'>{error}</p>}

                    <div className='flex flex-col gap-3 mt-6'>
                        <button
                            className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A3C2E] px-4 py-3 text-white hover:bg-[#142e23] focus:outline-none focus:ring-2 focus:ring-[#1A3C2E]/40 disabled:opacity-50'
                            onClick={handleStep2}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {step === "step3" && (
                <div className='space-y-4'>
                    <div className="flex items-center mb-2">
                        <button onClick={() => setStep("step2")} className="text-sm text-slate-500 hover:text-slate-900">← Back</button>
                        <h2 className="text-lg font-bold mx-auto pr-8">Profile Picture</h2>
                    </div>

                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 mt-4">
                        {avatarFile ? (
                            <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-32 h-32 rounded-full object-cover mb-4 shadow-md border-4 border-white" />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-slate-200 mb-4 flex items-center justify-center text-slate-400 border-4 border-white shadow-sm">
                                No Image
                            </div>
                        )}
                        <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition shadow-sm mt-2">
                            {avatarFile ? "Change Image" : "Select Image"}
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setAvatarFile(e.target.files[0]);
                                    }
                                }} 
                            />
                        </label>
                        <p className="text-xs text-slate-500 mt-4 text-center">You can skip this and add one later.</p>
                    </div>

                    {error && <p className='text-sm text-red-500 text-center'>{error}</p>}

                    <div className='flex flex-col gap-3 mt-6'>
                        <button
                            className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50'
                            disabled={loading}
                            onClick={handleSignUp}
                        >
                            {loading ? "Creating account..." : "Complete Sign Up"}
                        </button>
                    </div>
                </div>
            )}

            {step === "confirm" && (
                <div className="flex flex-col items-center text-center space-y-4 py-8">
                    <h2 className="text-2xl font-bold text-[#1A1A1A]">
                        Confirm your email
                    </h2>

                    <p className="text-slate-600 mt-2">
                        We've sent a confirmation link to:
                    </p>

                    <p className="font-semibold text-lg text-green-700 bg-green-50 px-4 py-2 rounded-lg w-full">
                        {email}
                    </p>

                    <p className="text-sm text-slate-500 mt-4">
                        Check your inbox and spam folder to continue.
                    </p>

                    <button
                        onClick={() => router.push("/sign-in")}
                        className="mt-8 text-sm font-medium text-slate-600 hover:text-slate-900 underline underline-offset-4"
                    >
                        Sign in
                    </button>
                </div>
            )}
        </AuthCard>
    );
}
