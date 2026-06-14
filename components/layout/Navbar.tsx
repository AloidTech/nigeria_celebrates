'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import UserProfileButton from '@/components/auth/UserProfileButton';

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
    const [isOpen, setIsOpen] = useState(false);
    console.log("user at navbar:", user);

    return (
        <header className='sticky top-0 z-30 border-b border-black/5 bg-white/95 backdrop-blur transition-all duration-300'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <div className='flex h-16 items-center justify-between'>
                    {/* Logo/Brand */}
                    <div className='flex items-center'>
                        <Link href='/' className='text-xl font-bold uppercase tracking-[0.18em] text-[#1a3c2e]'>
                            Naija Vibe
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className='hidden lg:flex items-center gap-x-6 text-sm font-medium text-[#4d4d4d] lg:flex-1 lg:pl-10'>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={pathname === link.href ? 'text-[#1A3C2E] font-semibold underline underline-offset-4' : 'text-gray-600 transition hover:text-[#1A3C2E]'}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Action Buttons */}
                    <div className='hidden lg:flex items-center gap-3.5'>
                        {!loading && user ? (
                            <>
                                <Link
                                    href='/upload'
                                    className='inline-flex items-center gap-1.5 rounded-full bg-[#1a3c2e] px-4.5 py-2 text-sm font-semibold text-white transition hover:bg-[#153325] shadow-sm'
                                >
                                    <Upload className='h-4 w-4' />
                                    <span>Upload</span>
                                </Link>

                                <button
                                    type='button'
                                    className='flex justify-center items-center h-10 w-10 relative rounded-full text-[#1a3c2e] hover:bg-black/5 transition'
                                    aria-label='Notifications'
                                >
                                    <Bell className='h-6 w-6' />
                                    <span className='absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse' />
                                </button>

                                <UserProfileButton user={user} />
                            </>
                        ) : !loading && !user ? (
                            <>
                                <Link
                                    href='/sign-in'
                                    className='inline-flex items-center justify-center rounded-md border border-[#1a3c2e] px-5 py-2 text-sm font-semibold text-[#1a3c2e] transition hover:bg-[#1a3c2e] hover:text-white'>
                                    Login
                                </Link>
                                <Link
                                    href='/sign-up'
                                    className='inline-flex items-center justify-center rounded-md bg-[#1a3c2e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#153325]'>
                                    Join Now
                                </Link>
                            </>
                        ) : (
                            <div className='h-9 w-20 animate-pulse rounded-md bg-gray-100' />
                        )}
                    </div>

                    {/* Mobile Controls */}
                    <div className='flex lg:hidden items-center gap-3'>
                        {!loading && user && (
                            <div className='flex items-center gap-2'>
                                <Link
                                    href='/upload'
                                    className='inline-flex items-center justify-center p-2 rounded-full bg-[#1a3c2e]/10 text-[#1a3c2e] transition hover:bg-[#1a3c2e]/20'
                                    aria-label='Upload'
                                >
                                    <Upload className='h-5 w-5' />
                                </Link>
                                <UserProfileButton user={user} />
                            </div>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type='button'
                            className='inline-flex items-center justify-center rounded-md p-2 text-[#1a3c2e] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1a3c2e] transition'
                            aria-expanded={isOpen}
                        >
                            <span className='sr-only'>Open main menu</span>
                            {isOpen ? (
                                <X className='h-6 w-6 transition duration-200' />
                            ) : (
                                <Menu className='h-6 w-6 transition duration-200' />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div 
                className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] border-t border-black/5 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
            >
                <div className='space-y-1 px-4 pb-3 pt-3 bg-white'>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`block rounded-md px-3 py-2 text-base font-medium transition ${
                                pathname === link.href
                                    ? 'bg-[#1a3c2e]/10 text-[#1a3c2e] font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a3c2e]'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Mobile actions for guests */}
                {!loading && !user && (
                    <div className='border-t border-black/5 px-4 pt-4 pb-4 bg-white flex flex-col gap-2'>
                        <Link
                            href='/sign-in'
                            onClick={() => setIsOpen(false)}
                            className='flex w-full items-center justify-center rounded-md border border-[#1a3c2e] px-4 py-2.5 text-base font-medium text-[#1a3c2e] transition hover:bg-[#1a3c2e] hover:text-white'>
                            Login
                        </Link>
                        <Link
                            href='/sign-up'
                            onClick={() => setIsOpen(false)}
                            className='flex w-full items-center justify-center rounded-md bg-[#1a3c2e] px-4 py-2.5 text-base font-medium text-white transition hover:bg-[#153325]'>
                            Join Now
                        </Link>
                    </div>
                )}

                {/* Mobile notification link for logged in user */}
                {!loading && user && (
                    <div className='border-t border-black/5 px-4 py-3 bg-white flex items-center justify-between'>
                        <span className='text-sm text-gray-500 font-medium'>Notifications</span>
                        <button
                            type='button'
                            className='flex justify-center items-center h-10 w-10 relative rounded-full text-[#1a3c2e] hover:bg-gray-50'
                            aria-label='Notifications'
                        >
                            <Bell className='h-6 w-6' />
                            <span className='absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse' />
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

