import { LayoutGrid, SlidersHorizontal } from 'lucide-react';

import FilterButton from '@/components/ui/FilterButton';
import VoteCard from '@/components/ui/VoteCard';

const voteCards = [
    {
        category: 'MUSICAL PRODIGY',
        name: 'Emeka Voice',
        description: 'Blending traditional Igbo folklore with contemporary Afro-...',
        votes: '4.2k',
        progress: '60%'
    },
    {
        category: 'CONTEMPORARY DANCE',
        name: 'The Lagos Duo',
        description: 'Redefining movement through the lens of urban Lagos life. Their...',
        votes: '3.8k',
        progress: '50%'
    },
    {
        category: 'TECH INNOVATION',
        name: 'Sola Devs',
        description: "Building the future of agritech in Africa. Sola's platform helps rural...",
        votes: '5.1k',
        progress: '75%'
    },
    {
        category: 'VISUAL ARTS',
        name: 'Zainab K.',
        description: 'Creating digital murals that explore the intersection of ancient...',
        votes: '2.9k',
        progress: '40%'
    }
] as const;

export default function VotesPage() {
    return (
        <main className='min-h-screen bg-[#F5F5F0] text-[#1A1A1A]'>
            <section className='px-8 pb-6 pt-10'>
                <div className='flex items-start justify-between gap-6'>
                    <div>
                        <h1 className='text-4xl font-bold text-[#1A3C2E]'>Rising Stars</h1>
                        <p className='mt-2 max-w-lg text-sm text-gray-600'>
                            Discover the next generation of Nigerian excellence. From Afrobeats prodigies to tech innovators, vote for your favorite creators.
                        </p>
                    </div>
                    <div className='flex items-center gap-3 pt-8'>
                        <FilterButton label='Trending' icon={SlidersHorizontal} />
                        <FilterButton label='All Categories' icon={LayoutGrid} />
                    </div>
                </div>
            </section>

            <section className='px-8 py-6'>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    {voteCards.map((card) => (
                        <VoteCard key={card.name} {...card} />
                    ))}
                </div>
            </section>
        </main>
    );
}
