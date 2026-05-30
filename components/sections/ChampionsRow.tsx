import { Camera, Cpu, Shirt, Trophy } from 'lucide-react';
import Link from 'next/link';

import ChampionCard from '@/components/ui/ChampionCard';

const champions = [
    {
        name: 'Amara Okafor',
        tagline: 'Photography Winner',
        rank: '#1',
        tone: 'from-emerald-100 via-stone-100 to-zinc-300',
        accent: 'bg-[#8b5e34]',
        icon: Camera
    },
    {
        name: 'Tunde Baller',
        tagline: 'Freestyle King',
        rank: '#2',
        tone: 'from-amber-200 via-green-900 to-black',
        accent: 'bg-[#d4a017]',
        icon: Trophy
    },
    {
        name: 'Zainab Fashion',
        tagline: 'Style Icon',
        rank: '#3',
        tone: 'from-emerald-700 via-emerald-900 to-stone-950',
        accent: 'bg-[#c97f52]',
        icon: Shirt
    },
    {
        name: 'Eze Dev',
        tagline: 'Tech Visionary',
        rank: '#4',
        tone: 'from-zinc-100 via-emerald-200 to-zinc-300',
        accent: 'bg-[#1a3c2e]',
        icon: Cpu
    }
] as const;

export default function ChampionsRow() {
    return (
        <section id='champions' className='px-6 py-12 sm:px-8'>
            <div className='mx-auto max-w-7xl'>
                <div className='flex items-end justify-between gap-4'>
                    <div>
                        <h2 className='text-2xl font-bold text-[#1a3c2e]'>Naija Champions</h2>
                        <p className='mt-1 text-sm text-[#666666]'>Celebrating this week&apos;s most-voted stars.</p>
                    </div>
                    <Link href='/votes' className='text-sm font-medium text-[#1a3c2e] transition hover:underline'>
                        View All →
                    </Link>
                </div>

                <div className='mt-6 overflow-x-auto pb-2'>
                    <div className='flex gap-4 pr-12 sm:pr-20 lg:pr-40'>
                        {champions.map((champion) => (
                            <ChampionCard key={champion.name} {...champion} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
