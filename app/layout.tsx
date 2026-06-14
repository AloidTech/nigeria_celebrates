import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import GlobalChrome from '@/components/layout/GlobalChrome';
import { AuthProvider } from '@/lib/auth/AuthContext';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin']
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
});

export const metadata: Metadata = {
    title: 'Naija Vibe',
    description: 'Celebrate the Rhythm of Our Nation'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
            <body className='min-h-full flex flex-col bg-[#f5f5f0] font-sans text-[#1a1a1a]'>
                <AuthProvider>
                    <GlobalChrome>{children}</GlobalChrome>
                </AuthProvider>
            </body>
        </html>
    );
}
