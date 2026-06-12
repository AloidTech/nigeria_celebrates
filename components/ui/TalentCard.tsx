'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
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

export default function TalentCard({ id, category, title, description, votes, time, materials }: TalentCardProps) {
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
            alert("You've already upvoted this talent performance! 🌟");
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
            alert("You've already downvoted this talent performance! ⬇️");
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
        <article className='overflow-hidden rounded-xl bg-white shadow-sm'>
            <div className='relative aspect-[3/4] overflow-hidden'>
                <div className='absolute inset-0 bg-gray-400' />
                <div className='absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.3)_50%,transparent_100%)]' />
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_18%),radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.14),transparent_18%)]' />
                <div className='absolute left-3 top-3 rounded-full bg-[#8B7355] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white'>{category}</div>
                <div className='absolute bottom-0 left-0 right-0 p-4'>
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