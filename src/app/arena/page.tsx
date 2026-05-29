'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BarChart3, CheckCircle, Plus, Share2, Trophy, ThumbsUp, Upload } from 'lucide-react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ArenaSectionHeader from '@/components/arena/ArenaSectionHeader';
import ArenaSummaryCard from '@/components/arena/ArenaSummaryCard';
import EmptyUploadsState from '@/components/arena/EmptyUploadsState';
import UploadHistoryCard from '@/components/arena/UploadHistoryCard';
import { useAuth } from '@/lib/firebase/AuthContext';

const uploads = [
    {
        id: '1',
        title: 'Eko Beats Freestyle',
        category: 'Music',
        votes: 1200,
        maxVotes: 5100,
        timestamp: 'Uploaded 2 days ago',
        status: 'live' as const
    },
    {
        id: '2',
        title: 'Aso-Oke Reimagined',
        category: 'Fashion',
        votes: 1100,
        maxVotes: 5100,
        timestamp: 'Uploaded 1 day ago',
        status: 'under_review' as const
    },
    {
        id: '3',
        title: 'Abuja Streets Skillset',
        category: 'Freestyle',
        votes: 3400,
        maxVotes: 5100,
        timestamp: 'Uploaded just now',
        status: 'live' as const
    }
];

export default function ArenaPage() {
    return (
        <ProtectedRoute>
            <ArenaPageContent />
        </ProtectedRoute>
    );
}

function ArenaPageContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'Creator';

    async function handleShareProfile() {
        await navigator.clipboard.writeText(`${window.location.origin}/arena`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
    }

    return (
        <main className='min-h-screen bg-[#F5F5F0] text-[#1A1A1A]'>
            <section className='px-8 pb-6 pt-10'>
                <div className='flex items-start justify-between gap-6'>
                    <div>
                        <p className='text-sm text-gray-500'>Welcome back,</p>
                        <h1 className='mt-0.5 text-3xl font-bold text-[#1A1A1A]'>{displayName}</h1>
                        <p className='mt-1 text-sm text-gray-500'>Here&apos;s how your talent is performing on Naija Vibe.</p>
                    </div>

                    <Link
                        href='/upload'
                        className='inline-flex items-center gap-2 rounded-md bg-[#1A3C2E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#142e23]'>
                        <Plus className='h-4 w-4' />
                        Upload New Talent
                    </Link>
                </div>
            </section>

            <section className='mb-8 grid grid-cols-1 gap-4 px-8 md:grid-cols-3'>
                <ArenaSummaryCard variant='dark' icon={<Upload className='h-8 w-8' />} value='3' label='Total Uploads' sublabel='Across all categories' />
                <ArenaSummaryCard variant='light' icon={<ThumbsUp className='h-8 w-8' />} value='6.7k' label='Total Votes' sublabel='+1.2k this week' />
                <ArenaSummaryCard variant='light' icon={<Trophy className='h-8 w-8' />} value='#12' label='Current Rank' sublabel='Top 5% of creators' />
            </section>

            <section className='px-8'>
                <ArenaSectionHeader title='My Uploads' subtitle='Manage and track all your talent submissions' actionLabel='View All' actionHref='/talent' />

                {uploads.length > 0 ? (
                    <div className='space-y-4'>
                        {uploads.map((upload) => (
                            <UploadHistoryCard key={upload.id} {...upload} />
                        ))}
                    </div>
                ) : (
                    <EmptyUploadsState />
                )}
            </section>

            <section className='mb-12 mt-10 px-8'>
                <ArenaSectionHeader title='Quick Actions' subtitle='Shortcuts to keep you moving' />

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <button
                        type='button'
                        onClick={() => router.push('/upload')}
                        className='rounded-xl border border-[#E5E5E5] bg-white p-5 text-left transition hover:border-[#1A3C2E]'>
                        <Upload className='mb-3 h-8 w-8 text-[#1A3C2E]' />
                        <div className='text-sm font-semibold text-[#1A1A1A]'>New Upload</div>
                        <p className='mt-1 text-xs text-gray-400'>Submit a new talent entry</p>
                    </button>

                    <button
                        type='button'
                        onClick={() => router.push('/votes')}
                        className='rounded-xl border border-[#E5E5E5] bg-white p-5 text-left transition hover:border-[#1A3C2E]'>
                        <BarChart3 className='mb-3 h-8 w-8 text-[#1A3C2E]' />
                        <div className='text-sm font-semibold text-[#1A1A1A]'>Browse & Vote</div>
                        <p className='mt-1 text-xs text-gray-400'>Discover and vote for other creators</p>
                    </button>

                    <button type='button' onClick={handleShareProfile} className='rounded-xl border border-[#E5E5E5] bg-white p-5 text-left transition hover:border-[#1A3C2E]'>
                        <Share2 className='mb-3 h-8 w-8 text-[#1A3C2E]' />
                        <div className='text-sm font-semibold text-[#1A1A1A]'>Share Profile</div>
                        <p className='mt-1 text-xs text-gray-400'>Invite friends to vote for your talent</p>
                    </button>
                </div>
            </section>

            <div
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-md bg-[#1A3C2E] px-4 py-3 text-sm text-white shadow-lg transition-all duration-200 ${copied ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>
                <CheckCircle className='h-4 w-4' />
                Link copied to clipboard!
            </div>
        </main>
    );
}
