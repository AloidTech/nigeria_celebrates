'use client';

import { checkPassword } from '@/lib/utils/authUtils';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

type PasswordInputProps = {
    value: string;
    onChange: (value: string) => void;
    showForgot?: boolean;
};

export default function PasswordInput({ value, onChange, showForgot = true }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');


    return (
        <div>
            <div className='mb-1 flex items-center justify-between gap-4'>
                <span className='text-sm font-semibold text-[#1A1A1A]'>Password</span>
                {showForgot ? (
                    <button type='button' className='cursor-pointer text-sm font-medium text-[#1A3C2E] hover:underline'>
                        Forgot Password?
                    </button>
                ) : null}
            </div>
            <div className='relative'>
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={(event) => setError(checkPassword(event.target.value))}
                    placeholder='Enter your password'
                    className='w-full rounded-xl border border-black/10 bg-white px-4 py-3 pr-12 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-[#1A3C2E] focus:ring-2 focus:ring-[#1A3C2E]/20'
                />
                <button
                    type='button'
                    onClick={() => setShowPassword((current) => !current)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition hover:text-[#1A3C2E]'
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                </button>

            </div>
        </div>
    );
}
