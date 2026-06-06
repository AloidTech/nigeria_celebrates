'use client';

import { useState } from 'react';

import ReferralLink from './ReferralLink';
import ShareButtons from './ShareButtons';

export type VoteCardProps = {
    category: string;
    name: string;
    description: string;
    votes: string;
    progress: string;
};

export default function VoteCard({ category, name, description, votes, progress }: VoteCardProps) {
    const [voted, setVoted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [referralUrl, setReferralUrl] = useState<string | null>(null);
    const [extraVotes, setExtraVotes] = useState(0);

    async function handleVote() {
        if (loading || voted) return;

        setLoading(true);

        try {
            const response = await fetch('/api/referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            const data = await response.json();

            if (data?.url) {
                setReferralUrl(data.url);
            }

            setExtraVotes((current) => current + 1);
            setVoted(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <article className='flex flex-col overflow-hidden rounded-xl bg-white shadow-md lg:flex-row'>
            <div className='w-full shrink-0 bg-gray-300 lg:w-1/2'>
                {/* Media section */}
                <div className='h-56 w-full bg-[linear-gradient(180deg,rgba(26,60,46,0.18),rgba(0,0,0,0.1)),radial-gradient(circle_at_30%_20%,rgba(212,160,23,0.35),transparent_28%),radial-gradient(circle_at_70%_30%,rgba(26,60,46,0.3),transparent_24%)] lg:h-full lg:min-h-87.5' />
            </div>
            <div className='flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6'>
                <div>
                    <div className='mb-3 w-fit rounded-full bg-[#F0F0EC] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500'>{category}</div>
                    <h3 className='text-xl font-bold leading-tight text-[#1A1A1A] sm:text-2xl'>{name}</h3>
                    <p className='mt-2 line-clamp-3 text-sm text-gray-500'>{description}</p>
                </div>
                <div className='mt-5'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
                        <div>
                            <div className='text-sm text-gray-500'>
                                {votes} {extraVotes ? `(+${extraVotes})` : ''} Votes
                            </div>
                            <div className='mt-2 h-1 w-full max-w-full rounded-full bg-[#E9E4D0] sm:max-w-20'>
                                <div className='h-full rounded-full bg-[#D4A017]' style={{ width: progress }} />
                            </div>
                        </div>
                        <div className='hidden rounded-full bg-[#F0F0EC] px-3 py-1 text-xs font-medium text-gray-500 sm:block'>Live support</div>
                    </div>
                    <button
                        type='button'
                        onClick={handleVote}
                        disabled={loading || voted}
                        className='mt-4 w-full rounded-md bg-[#1A3C2E] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#142e23] disabled:cursor-not-allowed disabled:opacity-60'>
                        {loading ? 'Voting…' : voted ? 'Voted' : 'Vote Now'}
                    </button>

                    {voted && referralUrl && (
                        <div className='mt-4 rounded-2xl border border-[#ece9df] bg-[#fafaf7] p-4'>
                            <div className='text-sm font-semibold text-[#1A1A1A]'>Thanks for voting.</div>
                            <p className='mt-1 text-sm leading-6 text-gray-600'>Copy your referral link or share it directly to bring in more support.</p>
                            <ReferralLink url={referralUrl} />
                            <ShareButtons url={referralUrl} text={`I just voted for ${name} on Naija Votes`} />
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
