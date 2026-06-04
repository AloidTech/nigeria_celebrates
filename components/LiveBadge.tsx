'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../supabase'; // Relative import path bypasses the alias issue

export type LiveBadgeProps = {
    label?: string;
};

export default function LiveBadge({ label = 'Live Submissions' }: LiveBadgeProps) {
    const [count, setCount] = useState<number>(0);
    const [isPulse, setIsPulse] = useState(false);

    useEffect(() => {
        // 1. Fetch the initial count of submissions when the badge mounts
        async function fetchInitialCount() {
            const { count: initialCount, error } = await supabase
                .from('talent_submissions')
                .select('*', { count: 'exact', head: true }); // head: true gets count without loading rows

            if (!error && initialCount !== null) {
                setCount(initialCount);
            }
        }

        fetchInitialCount();

        // 2. Set up a Realtime channel to listen for new rows hitting the database
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT', // Only care when a new submission is added
                    schema: 'public',
                    table: 'talent_submissions',
                },
                (payload) => {
                    console.log('New live submission detected!', payload);
                    setCount((prev) => prev + 1);
                    
                    // Trigger a brief visual pulse animation when a new submission arrives
                    setIsPulse(true);
                    setTimeout(() => setIsPulse(false), 1000);
                }
            )
            .subscribe();

        // 3. Clean up the realtime subscription channel when the component unmounts
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#E8F0EB] px-3 py-1 text-xs font-medium text-[#1A3C2E] transition-all duration-300 ${
            isPulse ? 'scale-115 bg-green-200 ring-4 ring-[#1A3C2E]/20' : ''
        }`}>
            {/* The indicator dot pulses infinitely */}
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A3C2E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A3C2E]"></span>
            </span>
            
            <span>
                {label} ({count})
            </span>
        </div>
    );
}