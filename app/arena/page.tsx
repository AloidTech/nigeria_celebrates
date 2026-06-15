'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, CheckCircle, Plus, Share2, Trophy, ThumbsUp, Upload, User, Pencil, FileText } from 'lucide-react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ArenaSectionHeader from '@/components/arena/ArenaSectionHeader';
import ArenaSummaryCard from '@/components/arena/ArenaSummaryCard';
import EmptyUploadsState from '@/components/arena/EmptyUploadsState';
import UploadHistoryCard from '@/components/arena/UploadHistoryCard';
import { useAuth } from '@/lib/auth/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getUploadsById } from '@/lib/supabase/queries/uploads';
import { getTotalUploads, getTotalVotes } from '@/lib/supabase/queries/participants';
import { getUserProfile, UserProfile } from '@/lib/supabase/queries/profiles';

type ArenaSubmission = {
    id: string;
    title: string;
    category: string;
    votes: number;
    maxVotes: number;
    timestamp: string;
    status: 'live' | 'under_review';
};

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
    const [activeTab, setActiveTab] = useState<'published' | 'under_review'>('published');
    const [creatorProfile, setCreatorProfile] = useState<UserProfile | null>(null);
    const [uploads, setUploads] = useState<ArenaSubmission[]>([]);
    const [stats, setStats] = useState({ totalUploads: 0, totalVotes: 0, rank: '#12' });
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        async function fetchArenaData() {
            if (!user?.id) return;
            setLoadingData(true);
            try {
                const supabase = getSupabaseBrowserClient();

                // Fetch current user's profile
                const profile = await getUserProfile(supabase, user.id);
                if (profile) {
                    setCreatorProfile(profile);
                }

                // Fetch uploads for the creator
                const dbUploads = await getUploadsById(supabase, user.id);

                // Map database submissions to ArenaSubmission format
                const mappedUploads: ArenaSubmission[] = await Promise.all(
                    dbUploads.map(async (sub) => {
                        const { count: voteCount } = await supabase
                            .from('votes')
                            .select('*', { count: 'exact', head: true })
                            .eq('submission_id', sub.id);

                        return {
                            id: sub.id,
                            title: sub.title,
                            category: sub.category,
                            votes: voteCount || 0,
                            maxVotes: 100,
                            timestamp: `Uploaded ${new Date(sub.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}`,
                            status: sub.is_approved ? 'live' as const : 'under_review' as const
                        };
                    })
                );

                setUploads(mappedUploads);

                // Fetch metrics
                const totalUploadsCount = await getTotalUploads(supabase, user.id);
                const totalVotesCount = await getTotalVotes(supabase, user.id);

                setStats({
                    totalUploads: totalUploadsCount,
                    totalVotes: totalVotesCount,
                    rank: totalVotesCount >= 50 ? '#3' : totalVotesCount >= 20 ? '#8' : '#12'
                });
            } catch (error) {
                console.error('Error fetching arena data:', error);
            } finally {
                setLoadingData(false);
            }
        }

        fetchArenaData();
    }, [user?.id]);

    async function handleShareProfile() {
        await navigator.clipboard.writeText(`${window.location.origin}/arena`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
    }


    const displayName = creatorProfile?.first_name
        ? `${creatorProfile.first_name} ${creatorProfile.last_name || ''}`.trim()
        : user?.email?.split('@')[0] || 'Creator';

    const handle = creatorProfile?.handle ? `${creatorProfile.handle}` : `@${user?.email?.split('@')[0] || 'creator'}`;

    // Filter uploads based on active tab
    const publishedUploads = uploads.filter((u) => u.status === 'live');
    const underReviewUploads = uploads.filter((u) => u.status === 'under_review');

    const currentTabUploads = activeTab === 'published' ? publishedUploads : underReviewUploads;

    // Generate profile initials
    const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <main className='min-h-screen bg-[#F5F5F0] text-[#1A1A1A]'>
            {/* Header - YouTube style creator profile area */}
            <section className='px-8 pt-8 pb-6 bg-[#F5F5F0]'>
                <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6'>
                    {/* Avatar */}
                    <div className='flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#1A3C2E] to-[#2E6B52] shadow-md border-2 border-white relative overflow-hidden'>
                        {creatorProfile?.avatar_url ? (
                            <img src={creatorProfile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                        ) : (
                            <span className='text-3xl font-bold text-white tracking-wider'>
                                {initials || <User className='h-12 w-12' />}
                            </span>
                        )}
                    </div>

                    {/* Channel / Profile Details */}
                    <div className='flex-1 text-center md:text-left pt-2'>
                        <h1 className='text-3xl font-bold text-[#1A1A1A]'>{displayName}</h1>
                        <p className='text-sm text-gray-500 font-semibold mt-1.5'>{handle}</p>

                        {creatorProfile?.description && (
                            <p className='text-sm text-gray-600 mt-3 max-w-2xl leading-relaxed'>
                                {creatorProfile.description}
                            </p>
                        )}

                        <div className='mt-2.5 text-xs text-gray-400 flex flex-wrap items-center justify-center md:justify-start gap-1 font-medium'>
                            <span>More about this creator</span>
                            <span className='cursor-pointer text-gray-600 hover:text-black transition-colors font-bold'>...more</span>
                        </div>

                        {/* Control Buttons */}
                        <div className='mt-5 flex flex-wrap items-center justify-center md:justify-start gap-2.5'>
                            <button
                                type='button'
                                onClick={() => router.push('/arena/customize')}
                                className='rounded-full bg-black/[0.06] hover:bg-black/[0.1] px-5 py-2.5 text-xs font-bold text-[#1A1A1A] transition active:scale-95'
                            >
                                Customise profile
                            </button>
                            <button
                                type='button'
                                onClick={handleShareProfile}
                                className='rounded-full bg-black/[0.06] hover:bg-black/[0.1] px-5 py-2.5 text-xs font-bold text-[#1A1A1A] transition active:scale-95 inline-flex items-center gap-1.5'
                            >
                                <Share2 className='h-3.5 w-3.5' />
                                Share profile
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Overview Stats */}
            <section className='mt-8 max-w-7xl mx-auto px-8 grid grid-cols-1 gap-4 md:grid-cols-3'>
                <ArenaSummaryCard
                    variant='dark'
                    icon={<Upload className='h-8 w-8' />}
                    value={loadingData ? <div className='h-8 w-12 skeleton-premium-bar bg-white/20' /> : String(stats.totalUploads)}
                    label='Total Uploads'
                    sublabel='Across all categories'
                />
                <ArenaSummaryCard
                    variant='light'
                    icon={<ThumbsUp className='h-8 w-8' />}
                    value={loadingData ? <div className='h-8 w-16 skeleton-premium-bar bg-black/10' /> : stats.totalVotes >= 1000 ? `${(stats.totalVotes / 1000).toFixed(1)}k` : String(stats.totalVotes)}
                    label='Total Votes'
                    sublabel='+12 this week'
                />
                <ArenaSummaryCard
                    variant='light'
                    icon={<Trophy className='h-8 w-8' />}
                    value={loadingData ? <div className='h-8.5 w-16 skeleton-premium-bar bg-black/10' /> : stats.rank}
                    label='Current Rank'
                    sublabel='Top 10% of creators'
                />
            </section>

            {/* Tabs & Uploads Section */}
            <section className='mt-10 max-w-7xl mx-auto px-8'>
                <div className='border-b border-black/[0.08] mb-6 flex items-center justify-between'>
                    <div className='flex gap-6'>
                        <button
                            type='button'
                            onClick={() => setActiveTab('published')}
                            className={`pb-3.5 text-xs font-extrabold uppercase tracking-widest transition-all relative ${activeTab === 'published'
                                ? 'text-black border-b-2 border-black -mb-[1px]'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Published
                        </button>
                        <button
                            type='button'
                            onClick={() => setActiveTab('under_review')}
                            className={`pb-3.5 text-xs font-extrabold uppercase tracking-widest transition-all relative ${activeTab === 'under_review'
                                ? 'text-black border-b-2 border-black -mb-[1px]'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Under Review
                        </button>

                    </div>

                    <Link
                        href='/upload'
                        className='inline-flex items-center gap-2 rounded-md bg-[#1A3C2E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#142e23]'>
                        <Plus className='h-4 w-4' />
                        Upload New Talent
                    </Link>
                </div>


                {loadingData ? (
                    <div className='space-y-4 max-w-4xl'>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className='flex items-center gap-5 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm'>
                                <div className='h-20 w-20 shrink-0 rounded-lg skeleton-premium' />
                                <div className='min-w-0 flex-1 space-y-3'>
                                    <div className='flex gap-2'>
                                        <div className='h-4.5 w-16 skeleton-premium-bar' />
                                        <div className='h-4.5 w-20 skeleton-premium-bar' />
                                    </div>
                                    <div className='h-5.5 w-1/2 skeleton-premium-bar' />
                                    <div className='h-3.5 w-1/4 skeleton-premium-bar' />
                                    <div className='space-y-1.5 mt-3'>
                                        <div className='h-3.5 w-full skeleton-premium-bar' />
                                        <div className='h-1.5 w-full skeleton-premium-bar' />
                                    </div>
                                </div>
                                <div className='flex shrink-0 flex-col gap-2'>
                                    <div className='h-8 w-16 skeleton-premium-bar' />
                                    <div className='h-8 w-16 skeleton-premium-bar' />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : currentTabUploads.length > 0 ? (
                    <div className='space-y-4 max-w-4xl'>
                        {currentTabUploads.map((upload) => (
                            <UploadHistoryCard key={upload.id} {...upload} isOwner={true} />
                        ))}
                    </div>
                ) : (
                    /* Reference Picture Style Empty State */
                    <div className='flex flex-col items-center justify-center text-center py-24 px-4 bg-white border border-[#E5E5E5] rounded-3xl max-w-4xl relative overflow-hidden'>
                        <div className='absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#F5F5F0]/60 blur-3xl pointer-events-none' />
                        <div className='relative z-10 flex flex-col items-center max-w-md'>
                            <div className='flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF4F0] border border-black/5 text-[#1A3C2E] mb-5 shadow-sm'>
                                {activeTab === 'published' ? <Pencil className='h-6 w-6' /> : <FileText className='h-6 w-6' />}
                            </div>

                            <h3 className='text-lg font-bold text-[#1A1A1A]'>
                                {activeTab === 'published' ? 'Publish submission' : 'No submissions under review'}
                            </h3>
                            <p className='mt-2 text-sm text-gray-500 leading-relaxed max-w-xs'>
                                {activeTab === 'published'
                                    ? 'Submissions appear here after they are approved by an admin and will be visible to your community.'
                                    : 'Your pending uploads will appear here while waiting for administrative moderation.'}
                            </p>

                            {activeTab === 'published' && (
                                <button
                                    onClick={() => router.push('/upload')}
                                    className='mt-6 rounded-full bg-[#1A3C2E] hover:bg-[#153325] px-6 py-2.5 text-xs font-bold text-white transition active:scale-95 inline-flex items-center gap-1.5'
                                >
                                    <Upload className='h-3.5 w-3.5' />
                                    Upload now
                                </button>
                            )}
                        </div>
                    </div>

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

                    <button
                        type='button'
                        onClick={handleShareProfile}
                        className='rounded-2xl border border-[#E5E5E5] bg-white p-5 text-left transition hover:border-[#1A3C2E] group hover:shadow-sm'
                    >
                        <Share2 className='mb-3.5 h-7 w-7 text-[#1A3C2E] transition-transform duration-200 group-hover:-translate-y-0.5' />
                        <div className='text-sm font-bold text-[#1A1A1A]'>Share Profile</div>
                        <p className='mt-1 text-xs text-gray-400 font-medium'>Invite friends to vote for your talent</p>
                    </button>
                </div>
            </section>

            <div
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#1A3C2E] px-4.5 py-3 text-sm text-white shadow-lg transition-all duration-300 ${copied ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
                    }`}
            >
                <CheckCircle className='h-4 w-4 text-[#D4A017]' />
                <span className='font-bold'>Link copied to clipboard!</span>
            </div>
        </main>
    );
}
