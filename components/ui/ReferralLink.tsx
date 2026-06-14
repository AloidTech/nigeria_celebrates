'use client';

import { useState } from 'react';

type Props = {
    url: string;
};

export default function ReferralLink({ url }: Props) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div className='mt-2 rounded-xl border border-[#ece9df] bg-[#f7f7f3] p-2.5'>
            <div className='text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f8050]'>Referral Link</div>
            <div className='mt-1.5 flex flex-col gap-2 sm:flex-row'>
                <input
                    readOnly
                    aria-label='Referral link'
                    value={url}
                    className='w-full rounded-lg border border-[#e1dccf] bg-white px-3 py-1.5 text-xs text-[#1A1A1A] outline-none'
                />
                <button
                    type='button'
                    onClick={handleCopy}
                    className='w-full whitespace-nowrap rounded-lg bg-[#1A3C2E] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#142e23] sm:w-auto'>
                    {copied ? 'Copied' : 'Copy Link'}
                </button>
            </div>
        </div>
    );
}
