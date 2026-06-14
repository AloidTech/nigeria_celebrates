'use client';

import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/supabase'; // Wire up your client directly

export type TalentCardProps = {
    id: string; // New: Unique database identifier for the submission
    category: string;
    title: string;
    description: string;
    votes: string;
    time: string;
    materials?: string | null;
    imageUrl?: string | null; // Optional: Link to display actual media or fallback
};

function parseVotes(votes: string) {
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

export default function TalentCard({ id, category, title, description, votes, time, materials, imageUrl }: TalentCardProps) {
    const [voteCount, setVoteCount] = useState(() => parseVotes(votes));
    const [userVoteState, setUserVoteState] = useState<'up' | 'down' | null>(null); // Track active user interaction state
    const [isUpdating, setIsUpdating] = useState(false);

    async function handleVote(direction: 'up' | 'down') {
        if (isUpdating) return;
        setIsUpdating(true);

        let voteDifference = 0;
        let newVoteState: 'up' | 'down' | null = direction;

        if (direction === 'up') {
            if (userVoteState === 'up') {
                voteDifference = -1; // Undo upvote
                newVoteState = null;
            } else if (userVoteState === 'down') {
                voteDifference = 2; // Flip from downvote to upvote
            } else {
                voteDifference = 1; // Brand new upvote
            }
        } else {
            if (userVoteState === 'down') {
                voteDifference = 1; // Undo downvote
                newVoteState = null;
            } else if (userVoteState === 'up') {
                voteDifference = -2; // Flip from upvote to downvote
            } else {
                voteDifference = -1; // Brand new downvote
            }
        }

        // Optimistically update the UI state instantly
        const targetVotes = Math.max(0, voteCount + voteDifference);
        setVoteCount(targetVotes);
        setUserVoteState(newVoteState);

        try {
            // Push changes down to your exact database row target
            // Assuming your submissions table has an 'id' and 'votes_count' integer field
            const { error } = await supabase.from('project_submissions').update({ votes_count: targetVotes }).eq('id', id);

            if (error) throw error;
        } catch (error) {
            toast.error('Could not sync the vote count right now.');
            // Revert changes back to original count if the network connection breaks
            setVoteCount(voteCount);
            setUserVoteState(userVoteState);
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <article className='overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md'>
            <div className='relative aspect-[3/4] overflow-hidden bg-gray-100'>
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className='h-full w-full object-cover' />
                ) : (
                    <div className='absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400' />
                )}
                <div className='absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.3)_50%,transparent_100%)]' />
                <div className='absolute left-3 top-3 rounded-full bg-[#8B7355] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white'>{category}</div>
                <div className='absolute bottom-0 left-0 right-0 p-4'>
                    <h3 className='text-lg font-bold leading-tight text-white'>{title}</h3>
                    <p className='mt-1 line-clamp-2 text-xs text-white/80'>{description}</p>
                </div>
                {materials ? (
                    <div className='absolute bottom-24 left-4 right-4 w-fit rounded-md bg-black/60 px-3 py-2 backdrop-blur-sm'>
                        <div className='text-[9px] uppercase tracking-widest text-white/60 font-bold'>MATERIALS USED</div>
                        <div className='mt-0.5 text-xs italic text-white/90'>{materials}</div>
                    </div>
                ) : null}
            </div>
            <div className='flex items-center justify-between bg-white px-4 py-3'>
                <div className='flex items-center bg-gray-50 rounded-full px-2 py-1 border border-gray-100'>
                    <button
                        type='button'
                        disabled={isUpdating}
                        onClick={() => handleVote('up')}
                        className={`p-1 rounded-full transition outline-none ${userVoteState === 'up' ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600'}`}>
                        <ChevronUp className='h-4 w-4 font-bold' strokeWidth={2.5} />
                    </button>
                    <span
                        className={`mx-2 text-sm font-bold transition-colors ${userVoteState === 'up' ? 'text-green-600' : userVoteState === 'down' ? 'text-red-500' : 'text-[#1A3C2E]'}`}>
                        {formatVotes(voteCount)}
                    </span>
                    <button
                        type='button'
                        disabled={isUpdating}
                        onClick={() => handleVote('down')}
                        className={`p-1 rounded-full transition outline-none ${userVoteState === 'down' ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'}`}>
                        <ChevronDown className='h-4 w-4 font-bold' strokeWidth={2.5} />
                    </button>
                </div>
                <span className='text-xs text-gray-400 font-medium'>{time}</span>
            </div>
        </article>
    );
}
