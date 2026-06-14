'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/sign-in');
        }
    }, [loading, router, user]);

    if (loading) {
        return <div className='flex min-h-screen items-center justify-center bg-[#F5F5F0] px-6 text-center text-sm text-gray-500'>Loading your arena...</div>;
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
