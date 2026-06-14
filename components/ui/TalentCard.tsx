'use client';

import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';

export type TalentCardProps = {
    id?: string;
    category: string;
    title: string;
    description: string;
    votes: string | number;
    time: string;
    materials?: string | null;
    mediaUrl?: string | null;
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

function getFileType(url: string | null | undefined): 'image' | 'video' | 'other' {
    if (!url) return 'other';
    const cleanUrl = url.split('?')[0].toLowerCase();
    if (cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|svg|heic)$/)) {
        return 'image';
    }
    if (cleanUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv|3gp)$/)) {
        return 'video';
    }
    return 'other';
}

export default function TalentCard({ id, category, title, description, votes, time, materials, mediaUrl }: TalentCardProps) {
    const [voteCount, setVoteCount] = useState(() => parseVotes(votes));
    // Track exact vote state per device: 'up', 'down', or null (haven't voted yet)
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

    // Sync voting status from localStorage on mount
    useEffect(() => {
        if (!id) return;
        const savedVote = localStorage.getItem(`voted-talent-${id}`); // Values: 'up' or 'down'
        if (savedVote === 'up' || savedVote === 'down') {
            setUserVote(savedVote);
        }
    }, [id]);

    const handleUpvote = async () => {
        if (!id) return;

        if (userVote === 'up') {
            alert("You've already upvoted this talent performance!");
            return;
        }

        // Calculate adjustment based on previous state
        const originalVote = userVote;
        const change = originalVote === 'down' ? 2 : 1;

        // Optimistic UI update
        setVoteCount((current) => current + change);
        setUserVote('up');
        localStorage.setItem(`voted-talent-${id}`, 'up');

        try {
            // If they are switching from a downvote, remove old tracking if applicable
            const { error } = await supabase
                .from('votes')
                .insert({ submission_id: id }); // Tracks the vote action in database

            if (error) throw error;
        } catch (err: any) {
            console.error("Database upvote sync issue:", err.message);
            // Graceful fallback if database fails
            if (err.message?.includes("row-level security")) {
                alert("Vote registered locally! (Database admin needs to enable RLS public Insert policies).");
            }
        }
    };

    const handleDownvote = async () => {
        if (!id) return;

        if (userVote === 'down') {
            alert("You've already downvoted this talent performance!");
            return;
        }

        const originalVote = userVote;
        const change = originalVote === 'up' ? 2 : 1;

        // Optimistic UI update
        setVoteCount((current) => Math.max(0, current - change));
        setUserVote('down');
        localStorage.setItem(`voted-talent-${id}`, 'down');

        // NOTE: If your 'votes' table has a 'vote_type' column (+1 / -1), 
        // you can change the insert payload here to match your team's schema!
        try {
            const { error } = await supabase
                .from('votes')
                .insert({ submission_id: id }); 

            if (error) throw error;
        } catch (err: any) {
            console.error("Database downvote sync issue:", err.message);
        }
    };

    return (
        <article className='overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md'>
            <div className='relative aspect-[3/4] overflow-hidden bg-gray-900'>
                {mediaUrl ? (
                    getFileType(mediaUrl) === 'video' ? (
                        <video 
                            src={mediaUrl} 
                            className="h-full w-full object-cover" 
                            controls={false}
                            muted
                            loop
                            playsInline
                            onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                            onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                        />
                    ) : getFileType(mediaUrl) === 'image' ? (
                        <img src={mediaUrl} alt={title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-[#1A3C2E] text-white p-4">
                            <FileText className="h-10 w-10 mb-2 text-white/80" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-center">Document / File</span>
                            <span className="text-[10px] text-white/70 mt-1 truncate max-w-full text-center">{mediaUrl.split('/').pop()}</span>
                        </div>
                    )
                ) : (
                    <div className='absolute inset-0 bg-gray-400' />
                )}
                <div className='absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.3)_50%,transparent_100%)] pointer-events-none' />
                <div className='absolute left-3 top-3 rounded-full bg-[#8B7355] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white z-10'>{category}</div>
                <div className='absolute bottom-0 left-0 right-0 p-4 z-10 pointer-events-none'>
                    <h3 className='text-lg font-bold leading-tight text-white'>{title}</h3>
                    <p className='mt-1 line-clamp-2 text-xs text-white/80'>{description}</p>
                </div>
                {materials ? (
                    <div className='absolute bottom-24 left-4 right-4 w-fit rounded-md bg-black/50 px-3 py-2'>
                        <div className='text-[9px] uppercase tracking-widest text-white/60'>MATERIALS USED</div>
                        <div className='mt-0.5 text-xs italic text-white/90'>{materials}</div>
                    </div>
                ) : null}
            </div>
            <div className='flex items-center justify-between bg-white px-4 py-3'>
                <div className='flex items-center'>
                    <ChevronUp 
                        className={`h-4 w-4 cursor-pointer transition ${userVote === 'up' ? 'text-green-600 scale-120 font-bold' : 'text-gray-500 hover:text-[#1A3C2E]'}`} 
                        onClick={handleUpvote} 
                    />
                    <span className='mx-2 text-sm font-bold text-[#1A3C2E]'>{formatVotes(voteCount)}</span>
                    <ChevronDown
                        className={`h-4 w-4 cursor-pointer transition ${userVote === 'down' ? 'text-red-600 scale-120 font-bold' : 'text-gray-500 hover:text-[#1A3C2E]'}`}
                        onClick={handleDownvote}
                    />
                </div>
                <span className='text-xs text-gray-400'>{time}</span>
            </div>
        </article>
    );
}