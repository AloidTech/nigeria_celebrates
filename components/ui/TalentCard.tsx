'use client';

import { ChevronUp, ChevronDown, X, FileText, PlayCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase';
import { castVote, removeVote } from '@/lib/supabase/queries/uploads';
import type { talent_category } from '@/lib/database_types/upload_types';

export type TalentCardProps = {
    id?: string;
    category: string;
    title: string;
    description: string;
    votes: string | number;
    time: string;
    materials?: string | null;
    media_url?: string | null;
    currentUserVote?: 'up' | 'down' | null;
};



function parseVotes(votes: string | number) {
    if (typeof votes === 'number') return votes;
    const normalized = votes.trim().toLowerCase();

    if (normalized.endsWith('k')) {
        return Number.parseFloat(normalized) * 1000;
    }

    return Number.parseInt(normalized, 10) || 0;
}

function formatVotes(value: number) {
    if (value >= 1000) {
        const scaled = value / 1000;
        return `${Number.isInteger(scaled) ? scaled.toFixed(0) : scaled.toFixed(1)}k`;
    }

    return value.toString();
}

function getFileType(url: string | null | undefined) {
    if (!url) return 'unknown';
    if (/\.(mp4|webm|ogg|mov)$/i.test(url)) return 'video';
    if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || url.includes('images.unsplash.com') || url.includes('image/upload')) return 'image';
    return 'document';
}

export default function TalentCard({ id, category, title, description, votes, time, materials, media_url, currentUserVote }: TalentCardProps) {
    const router = useRouter();
    const [voteCount, setVoteCount] = useState(() => parseVotes(votes));
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(currentUserVote || null);

    const isVideo = useMemo(() => {
        return getFileType(media_url) === 'video';
    }, [media_url]);

    // Sync voting status from props on change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setUserVote(currentUserVote || null);
    }, [currentUserVote]);

    const handleUpvote = async () => {
        if (!id) return;

        if (userVote === 'up') {
            setVoteCount((current) => current - 1);
            setUserVote(null);

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await removeVote(supabase, id, user.id);
                }
            } catch (err) {
                console.error("Database vote sync issue:", err);
            }
            return;
        }

        const originalVote = userVote;
        const change = originalVote === 'down' ? 2 : 1;

        setVoteCount((current) => current + change);
        setUserVote('up');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please log in to vote!");
                return;
            }

            await castVote(supabase, id, user.id, true, category as talent_category);
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Database upvote sync issue:", error.message);
            if (error.message?.includes("row-level security")) {
                alert("Vote registered locally! (Database admin needs to enable RLS public Insert policies).");
            }
        }
    };

    const handleDownvote = async () => {
        if (!id) return;

        if (userVote === 'down') {
            setVoteCount((current) => current + 1);
            setUserVote(null);

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await removeVote(supabase, id, user.id);
                }
            } catch (err) {
                console.error("Database vote sync issue:", err);
            }
            return;
        }

        const originalVote = userVote;
        const change = originalVote === 'up' ? 2 : 1;

        setVoteCount((current) => current - change);
        setUserVote('down');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please log in to vote!");
                return;
            }

            await castVote(supabase, id, user.id, false, category as talent_category);
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Database downvote sync issue:", error.message);
        }
    };

    return (
        <article className='overflow-hidden rounded-xl bg-white shadow-sm flex flex-col h-full'>
            <div 
                className='relative aspect-[3/4] overflow-hidden group cursor-pointer' 
                onClick={() => {
                    if (id) {
                        router.push(`/talent/${id}`);
                    }
                }}
            >
                {media_url ? (
                    isVideo ? (
                        <>
                            <video src={media_url} className='absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition duration-500' muted playsInline />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition z-20">
                                <PlayCircle className="h-12 w-12 text-white/80 group-hover:text-white group-hover:scale-110 transition duration-300 drop-shadow-md" />
                            </div>
                        </>
                    ) : (
                        <img src={media_url} alt={title} className='absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition duration-500' />
                    )
                ) : (
                    <div className='absolute inset-0 bg-gray-400' />
                )}

                <div className='absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.3)_50%,transparent_100%)] pointer-events-none z-10' />

                <div className='absolute left-3 top-3 rounded-full bg-[#8B7355] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white z-20'>{category}</div>
                <div className='absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none'>
                    <h3 className='text-lg font-bold leading-tight text-white'>{title}</h3>
                    <p className='mt-1 line-clamp-2 text-xs text-white/80'>{description}</p>
                </div>
                {materials ? (
                    <div className='absolute bottom-24 left-4 right-4 w-fit rounded-md bg-black/50 px-3 py-2 z-20 pointer-events-none'>
                        <div className='text-[9px] uppercase tracking-widest text-white/60'>MATERIALS USED</div>
                        <div className='mt-0.5 text-xs italic text-white/90'>{materials}</div>
                    </div>
                ) : null}
            </div>
            
            <div className='flex items-center justify-between bg-white px-4 py-3'>
                <div className='flex items-center'>
                    <ChevronUp
                        className={`h-5 w-5 cursor-pointer transition ${userVote === 'up' ? 'text-green-600 scale-120 font-bold' : 'text-gray-500 hover:text-[#1A3C2E]'}`}
                        onClick={handleUpvote}
                    />
                    <span className='mx-2 text-sm font-bold text-[#1A3C2E]'>{formatVotes(Math.max(0, voteCount))}</span>
                    <ChevronDown
                        className={`h-5 w-5 cursor-pointer transition ${userVote === 'down' ? 'text-red-600 scale-120 font-bold' : 'text-gray-500 hover:text-[#1A3C2E]'}`}
                        onClick={handleDownvote}
                    />
                </div>
                <span className='text-xs text-gray-400'>{time}</span>
            </div>

        </article>
    );
}
