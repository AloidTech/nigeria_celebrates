'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';

export type VoteCardProps = {
    id?: string; // 👈 The '?' makes this OPTIONAL. It will never break your teammates' components!
    category: string;
    name: string;
    description: string;
    votes: string | number;
    progress: string;
};

export default function VoteCard({ id, category, name, description, votes, progress }: VoteCardProps) {
    const [hasVoted, setHasVoted] = useState(false);
    const [voteCount, setVoteCount] = useState(typeof votes === 'number' ? votes : parseInt(votes) || 0);
    const [isVoting, setIsVoting] = useState(false);

    // Only run localStorage logic if an ID exists
    useEffect(() => {
        if (!id) return;
        const structuralVotedCheck = localStorage.getItem(`voted-${id}`);
        if (structuralVotedCheck === 'true') {
            setHasVoted(true);
        }
    }, [id]);

    const handleVote = async () => {
        if (!id) {
            alert("Voting is currently unavailable for this item (Missing ID).");
            return;
        }
        if (hasVoted || isVoting) return;

        setIsVoting(true);

        try {
            const { error } = await supabase
                .from('votes')
                .insert({ submission_id: id });

            if (error) throw error;

            localStorage.setItem(`voted-${id}`, 'true');
            setHasVoted(true);
            setVoteCount(prev => prev + 1);

        } catch (error: any) {
            console.error("Voting tracking error:", error);
            alert("Could not register vote: " + error.message);
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <article className='flex overflow-hidden rounded-xl bg-white shadow-md'>
            {/* The exact Tailwind layouts your team built stays completely untouched */}
            <div className='w-1/2 shrink-0 bg-gray-300'>
                <div className='h-full min-h-87.5 w-full bg-[linear-gradient(180deg,rgba(26,60,46,0.18),rgba(0,0,0,0.1)),radial-gradient(circle_at_30%_20%,rgba(212,160,23,0.35),transparent_28%),radial-gradient(circle_at_70%_30%,rgba(26,60,46,0.3),transparent_24%)]' />
            </div>
            <div className='flex min-w-0 flex-1 flex-col justify-between p-6'>
                <div>
                    <div className='mb-3 w-fit rounded-full bg-[#F0F0EC] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500'>{category}</div>
                    <h3 className='text-2xl font-bold leading-tight text-[#1A1A1A]'>{name}</h3>
                    <p className='mt-2 line-clamp-3 text-sm text-gray-500'>{description}</p>
                </div>
                <div className='mt-4'>
                    <div className='text-sm text-gray-500'>{voteCount} Votes</div>
                    <div className='mt-2 h-1 w-full max-w-20 rounded-full bg-[#E9E4D0]'>
                        <div className='h-full rounded-full bg-[#D4A017]' style={{ width: progress }} />
                    </div>
                    
                    <button 
                        onClick={handleVote}
                        disabled={hasVoted || isVoting}
                        type='button' 
                        className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-bold text-white transition duration-200 
                            ${hasVoted 
                                ? 'bg-[#1A3C2E]/20 text-[#1A3C2E] cursor-not-allowed border border-[#1A3C2E]/30' 
                                : 'bg-[#1A3C2E] hover:bg-[#142e23]'
                            }`}
                    >
                        {isVoting ? (
                            <>Voting... <Loader2 className="h-4 w-4 animate-spin" /></>
                        ) : hasVoted ? (
                            <>Voted <CheckCircle2 className="h-4 w-4 text-[#1A3C2E]" /></>
                        ) : (
                            'Vote Now'
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
}