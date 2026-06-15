'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

const authRoutes = ['/sign-in', '/sign-up'];

export default function GlobalChrome({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route));
    const isTalentRoute = pathname?.startsWith('/talent/') && pathname.length > 8;
    const showBackButton = pathname == '/quiz/weekly';

    function handleBackClick() {
        if (window.history.length > 1) {
            router.back();
            return;
        }

        router.push('/');
    }

    if (isAuthRoute) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            {showBackButton ? (
                <div className='bg-[#f5f5f0]'>
                    <div className='mx-auto flex max-w-7xl px-4 py-3 sm:px-6 lg:px-8'>
                        <button
                            type='button'
                            onClick={handleBackClick}
                            aria-label='Go back'
                            className='inline-flex items-center gap-2 rounded-md border border-[#E5E5E5] bg-transparent px-3 py-2 text-sm font-medium text-[#1A3C2E] transition hover:border-[#1A3C2E] hover:bg-[#EEF4F0]'>
                            <ArrowLeft className='h-4 w-4' />
                            Back
                        </button>
                    </div>
                </div>
            ) : null}
            {children}
            {!isTalentRoute && <Footer />}
        </>
    );
}
