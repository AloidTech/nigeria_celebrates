'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/talent', label: 'Talent Zone' },
    { href: '/votes', label: 'Naija Votes' },
    { href: '/quiz', label: 'Quiz' },
    { href: '/live', label: 'Live Streams' },
    { href: '/icons', label: 'Global Icons' },
    { href: '/arena', label: 'My Arena' }
] as const;

export default function Navbar() {
    const pathname = usePathname();
    const { user, loading } = useAuth();

    return (
        <header className='sticky top-0 z-30 border-b border-black/5 bg-white/95 backdrop-blur'>
            <div className='mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:justify-between lg:px-8'>
                <Link href='/' className='text-xl font-bold uppercase tracking-[0.18em] text-[#1a3c2e]'>
                    Naija Vibe
                </Link>
                <nav className='flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-[#4d4d4d] sm:gap-x-6 lg:flex-1'>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={pathname === link.href ? 'text-[#1A3C2E] font-semibold underline underline-offset-4' : 'text-gray-600 transition hover:text-[#1A3C2E]'}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className='flex w-full items-center justify-center gap-3 sm:w-auto'>
                    <Link
                        href='/sign-in'
                        className='flex-1 inline-flex items-center justify-center rounded-md border border-[#1a3c2e] px-5 py-2 text-sm font-semibold text-[#1a3c2e] transition hover:bg-[#1a3c2e] hover:text-white sm:flex-none'>
                        Login
                    </Link>
                    <Link
                        href='/sign-up'
                        className='flex-1 inline-flex items-center justify-center rounded-md bg-[#1a3c2e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#153325] sm:flex-none'>
                        Join Now
                    </Link>
                </div>
            </div>
        </header>
    );
}
