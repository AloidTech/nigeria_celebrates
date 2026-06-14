'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Trophy, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function UserProfileButton({ user }: { user: any }) {

    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = getSupabaseBrowserClient();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    // Generate user initials
    const name = user?.displayName || user?.email || 'User';
    const initials = name
        .split(' ')
        .map((n: any) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    async function handleSignOut() {
        try {
            await supabase.auth.signOut();
            setIsOpen(false);
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-[#1A3C2E] text-sm font-semibold text-white hover:text-black transition-colors  shadow-sm transition hover:border-[#1A3C2E]/20 hover:bg-[#EEF4F0]/85 focus:outline-none"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className="text-xs font-bold ">
                    {initials.length > 0 ? initials : <User className="h-4 w-4" />}
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-black/5 bg-white p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-200 z-50">
                    <div className="px-3 py-2 border-b border-black/5 mb-1.5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-[#1A1A1A] truncate mt-0.5">{user?.displayName || 'Creator'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                        href="/arena"
                        onClick={() => setIsOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#1A1A1A] transition hover:bg-[#EEF4F0] hover:text-[#1A3C2E] font-medium"
                    >
                        <Trophy className="h-4.5 w-4.5 text-[#1A3C2E]" />
                        My Arena
                    </Link>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 font-medium mt-1 text-left"
                    >
                        <LogOut className="h-4.5 w-4.5" />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}
