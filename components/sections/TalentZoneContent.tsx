import Link from 'next/link';
import { Play } from 'lucide-react';

import CategoryTabs from '@/components/ui/CategoryTabs';
import LiveBadge from '@/components/ui/LiveBadge';
import type { TalentCardProps } from '@/components/ui/TalentCard';

const cards: TalentCardProps[] = [
    {
        category: 'MUSIC',
        title: 'Eko Beats Freestyle',
        description: 'Raw acoustic performance blending afrobeat rhythms with soulful lyrics...',
        votes: '1.2k',
        time: '2h ago'
    },
    {
        category: 'ARTWORK',
        title: 'Ancestral Echoes',
        description: 'Hand-painted portrait exploring the intersection of modern youth and...',
        votes: '856',
        time: '5h ago',
        materials: 'Charcoal, Acrylic, Gold Leaf on Canvas'
    },
    {
        category: 'FREESTYLE',
        title: 'Abuja Streets Skillset',
        description: "Incredible gravity-defying tricks captured in the heart of Abuja's...",
        votes: '3.4k',
        time: 'Just now'
    },
    {
        category: 'FASHION',
        title: 'Aso-Oke Reimagined',
        description: 'A stunning showcase of traditional Yorùbá fabric transformed into...',
        votes: '1.1k',
        time: '1h ago'
    }
];

export default function TalentZoneContent() {
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
                        href='/sign-in'
                        className='inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1A3C2E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#142e23] sm:w-auto'>
                        <Play className='h-4 w-4 fill-current' />
                        Upload Your Talent
                    </Link>
                </div>
            </section>

            <CategoryTabs cards={cards} />
        </>
    );
}
