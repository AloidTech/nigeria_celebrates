'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export type TalentCardProps = {
    category: string;
    title: string;
    description: string;
    votes: string;
    time: string;
    materials?: string | null;
};

function parseVotes(votes: string) {
    const normalized = votes.trim().toLowerCase();

    if (normalized.endsWith('k')) {
        return Number.parseFloat(normalized) * 1000;
    }

    return Number.parseInt(normalized, 10);
}

function formatVotes(value: number) {
    if (value >= 1000) {
        const scaled = value / 1000;
        return `${Number.isInteger(scaled) ? scaled.toFixed(0) : scaled.toFixed(1)}k`;
    }

    return value.toString();
}

export default function TalentCard({ category, title, description, votes, time, materials }: TalentCardProps) {
    const [voteCount, setVoteCount] = useState(() => parseVotes(votes));

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
                    <ChevronUp className='h-4 w-4 cursor-pointer text-gray-500 transition hover:text-[#1A3C2E]' onClick={() => setVoteCount((current) => current + 1)} />
                    <span className='mx-2 text-sm font-bold text-[#1A3C2E]'>{formatVotes(voteCount)}</span>
                    <ChevronDown
                        className='h-4 w-4 cursor-pointer text-gray-500 transition hover:text-[#1A3C2E]'
                        onClick={() => setVoteCount((current) => Math.max(0, current - 1))}
                    />
                </div>
                <span className='text-xs text-gray-400'>{time}</span>
            </div>
        </article>
    );
}
