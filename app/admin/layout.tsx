'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Video, Sliders, ClipboardList, Home, Shield } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
            description: 'High-level stats & quick approvals'
        },
        {
            name: 'Submissions',
            href: '/admin/submissions',
            icon: Video,
            description: 'Full video approval queue'
        },
        {
            name: 'Quiz Settings',
            href: '/admin/quiz/settings',
            icon: Sliders,
            description: 'Quiz configuration & status'
        },
        {
            name: 'Quiz Questions',
            href: '/admin/quiz/questions',
            icon: ClipboardList,
            description: 'AI prompt & import pool'
        }
    ];

    return (
        <div className='min-h-screen bg-[#F5F5F0] text-[#1A1A1A] relative flex flex-col md:flex-row'>
            {/* Floating Navigation Bar */}
            <aside className='fixed z-50 bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-sm md:max-w-none md:translate-x-0 md:left-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-20 bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#E5E5E5] shadow-xl p-3 md:py-6 flex flex-row md:flex-col items-center justify-around md:justify-center gap-2 md:gap-6 transition-all duration-300 hover:border-[#1A3C2E]/30 hover:shadow-2xl'>
                
                {/* Admin Badge/Header on Desktop */}
                <div className='hidden md:flex flex-col items-center mb-2 text-[#1A3C2E]'>
                    <div className='p-2 rounded-xl bg-[#EEF4F0] border border-[#1A3C2E]/10'>
                        <Shield className='h-5 w-5 text-[#1A3C2E]' />
                    </div>
                    <span className='text-[9px] font-bold uppercase tracking-wider text-[#1A3C2E] mt-1'>Admin</span>
                </div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.name}
                            className={`group relative flex flex-col md:w-14 md:h-14 items-center justify-center p-2.5 rounded-xl md:rounded-2xl transition-all duration-200 ${
                                isActive
                                    ? 'bg-[#1A3C2E] text-white shadow-md shadow-[#1A3C2E]/20'
                                    : 'text-gray-500 hover:text-[#1A3C2E] hover:bg-[#EEF4F0]'
                            }`}
                        >
                            <Icon className={`h-5 w-5 md:h-6 md:w-6 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-[#D4A017]' : ''}`} />
                            <span className='text-[8px] md:hidden font-bold mt-1 text-center leading-tight'>{item.name}</span>
                            
                            {/* Hover Tooltip for Desktop */}
                            <span className='absolute left-20 hidden md:group-hover:inline-block bg-zinc-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-md pointer-events-none transition-all duration-150 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'>
                                <div className='font-bold text-[#D4A017]'>{item.name}</div>
                                <div className='text-[10px] text-zinc-300'>{item.description}</div>
                            </span>
                        </Link>
                    );
                })}

                <div className='hidden md:block w-8 h-[1px] bg-gray-200 my-2' />

                {/* Back to Home Link */}
                <Link
                    href='/'
                    title='Go to Home'
                    className='group relative flex flex-col md:w-14 md:h-14 items-center justify-center p-2.5 rounded-xl md:rounded-2xl text-gray-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200'
                >
                    <Home className='h-5 w-5 md:h-6 md:w-6 transition-transform duration-200 group-hover:scale-105' />
                    <span className='text-[8px] md:hidden font-bold mt-1 text-center leading-tight'>Home</span>
                    <span className='absolute left-20 hidden md:group-hover:inline-block bg-zinc-900 text-white text-xs font-medium px-2.5 py-1 rounded-md whitespace-nowrap shadow-md pointer-events-none'>
                        Back to Home
                    </span>
                </Link>
            </aside>

            {/* Main Content Area */}
            <div className='flex-1 md:pl-32 pb-24 md:pb-8 transition-all duration-300'>
                {children}
            </div>
        </div>
    );
}
