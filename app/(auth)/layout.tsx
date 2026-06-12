'use client';

import { useRouter } from 'next/navigation';

export default function AuthLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    function handleBackdropClick() {
        if (window.history.length > 1) {
            router.back();
            return;
        }

        router.push('/');
    }

    return (
        <div className='relative min-h-screen overflow-hidden bg-[#1A1A1A] px-4 py-16 text-white' onClick={handleBackdropClick}>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(26,60,46,0.62),transparent_34%),radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.08),transparent_16%),linear-gradient(180deg,rgba(10,10,10,0.45),rgba(10,10,10,0.82))]' />
            <div className='absolute inset-0 backdrop-blur-md' />
            <div className='absolute left-[8%] top-[10%] h-60 w-60 rounded-full bg-[#1A3C2E]/35 blur-3xl' />
            <div className='absolute right-[10%] top-[16%] h-72 w-72 rounded-full bg-white/12 blur-3xl' />
            <div className='absolute bottom-[12%] left-[18%] h-64 w-64 rounded-full bg-black/30 blur-3xl' />

            <div className='relative z-10 flex min-h-[calc(100vh-8rem)] items-center justify-center'>
                <div
                    className='grid w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/10 bg-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-[1fr_1.05fr]'
                    onClick={(event) => event.stopPropagation()}>
                    <div className='hidden flex-col justify-between border-r border-white/10 p-10 text-white/90 lg:flex'>
                        <div>
                            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-white/55'>Secure access</p>
                            <h2 className='mt-6 max-w-sm text-4xl font-bold leading-tight text-white'>Sign in to continue your journey.</h2>
                            <p className='mt-4 max-w-sm text-sm leading-6 text-white/70'>
                                Uploads are reserved for registered users. Use the modal to sign in or create an account and continue without leaving the page feel.
                            </p>
                        </div>
                        <div className='text-sm text-white/55'>
                            <p>Nigeria Celebrates</p>
                            <p className='mt-1'>One Nation. One Voice. One Celebration.</p>
                        </div>
                    </div>
                    <div className='p-1 sm:p-2'>
                        <div className=' rounded-[28px] border border-white/60 bg-white px-8 py-12 shadow-[0_18px_60px_rgba(0,0,0,0.25)]'>{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
