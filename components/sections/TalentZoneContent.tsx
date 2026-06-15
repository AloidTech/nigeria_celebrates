'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Loader2 } from 'lucide-react';
import { supabase } from '@/supabase';

import CategoryTabs from '@/components/ui/CategoryTabs';
import LiveBadge from '@/components/ui/LiveBadge';
import type { TalentCardProps } from '@/components/ui/TalentCard';
import { getLiveSubmissionsWithVotes } from '@/lib/supabase/queries/uploads';

const mockCards: TalentCardProps[] = [
    {
        id: 'mock-music-1',
        category: 'MUSIC',
        title: 'Eko Beats Freestyle',
        description: 'Raw acoustic performance blending afrobeat rhythms with soulful lyrics...',
        votes: '1.2k',
        time: '2h ago'
    },
    {
        id: 'mock-art-2',
        category: 'ARTWORK',
        title: 'Ancestral Echoes',
        description: 'Hand-painted portrait exploring the intersection of modern youth and...',
        votes: '856',
        time: '5h ago',
        materials: 'Charcoal, Acrylic, Gold Leaf on Canvas'
    },
    {
        id: 'mock-freestyle-3',
        category: 'FREESTYLE',
        title: 'Abuja Streets Skillset',
        description: "Incredible gravity-defying tricks captured in the heart of Abuja's...",
        votes: '3.4k',
        time: 'Just now'
    },
    {
        id: 'mock-fashion-4',
        category: 'FASHION',
        title: 'Aso-Oke Reimagined',
        description: 'A stunning showcase of traditional Yorùbá fabric transformed into...',
        votes: '1.1k',
        time: '1h ago'
    }
];

export default function TalentZoneContent() {
    const [allCards, setAllCards] = useState<TalentCardProps[]>(mockCards);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLiveSubmissions = async () => {
            try {
                // 1. Fetch approved submissions with vote totals
                const data = await getLiveSubmissionsWithVotes(supabase);

                // Fetch current user's votes to set initial highlighted states
                const { data: { user } } = await supabase.auth.getUser();
                const userVotesMap: Record<string, 'up' | 'down'> = {};
                if (user) {
                    const { data: userVotes, error: userVotesError } = await supabase
                        .from('votes')
                        .select('submission_id, vote_type')
                        .eq('user_id', user.id);
                    
                    if (!userVotesError && userVotes) {
                        userVotes.forEach((v) => {
                            userVotesMap[v.submission_id] = v.vote_type === 1 ? 'up' : 'down';
                        });
                    }
                }

                const liveCards: TalentCardProps[] = data.map((item) => {
                    const totalVotes = Math.max(0, item.total_votes || 0);
                    return {
                        id: item.id,
                        category: item.category ? item.category.toUpperCase().replace(' (HANDMADE ONLY)', '') : 'GENERAL',
                        title: item.title,
                        description: item.description || '',
                        votes: totalVotes.toString(), 
                        time: 'Just now',
                        media_url: item.media_url, // Pass the media URL so the card displays the upload
                        currentUserVote: userVotesMap[item.id] || null
                    };
                });

                setAllCards([...liveCards, ...mockCards]);
            } catch (err) {
                console.error('Failed to load dynamic timeline feed:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLiveSubmissions();
    }, []);

    return (
        <>
            <section className='bg-[#F5F5F0] px-4 pb-4 pt-8 sm:px-8'>
                <LiveBadge />
                <div className='flex flex-col items-start justify-between gap-6 md:flex-row md:items-center'>
                    <div className='max-w-2xl'>
                        <h1 className='text-3xl font-bold text-[#1A3C2E] sm:text-5xl'>Naija Talent Zone</h1>
                        <p className='mt-2 text-sm text-gray-600 sm:max-w-lg'>
                            Discover, share, and support the raw creativity, culture, and innovation driving Nigeria forward. Show the world what you&apos;ve got.
                        </p>
                    </div>
                    <Link
                        href='/upload'
                        className='inline-flex items-center justify-center gap-2 rounded-md bg-[#1A3C2E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#142e23]'>
                        <Play className='h-4 w-4 fill-current' />
                        Upload Your Talent
                    </Link>
                </div>
            </section>

            {isLoading ? (
                <div className="flex w-full items-center justify-center py-20 text-gray-500 gap-2 text-sm">
                    Syncing live database updates... <Loader2 className="h-4 w-4 animate-spin text-[#1A3C2E]" />
                </div>
            ) : (
                <CategoryTabs cards={allCards} />
            )}
        </>
    );
}
