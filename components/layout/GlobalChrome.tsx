'use client';

import { usePathname } from 'next/navigation';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

const authRoutes = ['/sign-in', '/sign-up'];

export default function GlobalChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route));

    if (isAuthRoute) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
