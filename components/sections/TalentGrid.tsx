import { BookOpen, Camera, CircleDot, Cpu, Drama, Gamepad2, Music2, Palette, Scissors, Shirt, UserRound } from 'lucide-react';

import TalentCard from '@/components/ui/TalentCard';

const talentsRowOne = [
    { label: 'Music', icon: Music2 },
    { label: 'Football Freestyle', icon: Gamepad2 },
    { label: 'Basketball Freestyle', icon: CircleDot },
    { label: 'Comedy Skits', icon: Drama },
    { label: 'Handmade Artwork', icon: Palette },
    { label: 'Hair Artistry', icon: Scissors }
] as const;

const talentsRowTwo = [
    { label: 'Fashion Showcase', icon: Shirt },
    { label: 'My Nigeria Story', icon: BookOpen },
    { label: 'Photography', icon: Camera },
    { label: 'Tech Innovation', icon: Cpu },
    { label: 'Logo Design', icon: UserRound }
] as const;

export default function TalentGrid() {
    return (
        <section id='talents' className='bg-[#f5f5f0] py-16 px-6 text-center sm:px-8'>
            <div className='mx-auto max-w-4xl'>
                <h2 className='text-3xl font-bold text-[#1a3c2e]'>Explore Our Talents</h2>
                <p className='mt-2 mb-10 text-sm text-[#666666]'>Discover the diverse excellence of Nigeria across eleven distinct domains.</p>

                <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
                    {talentsRowOne.map((item) => (
                        <TalentCard key={item.label} {...item} />
                    ))}
                </div>

                <div className='mt-8 grid grid-cols-2 gap-4 md:grid-cols-5 lg:max-w-none lg:grid-cols-5'>
                    {talentsRowTwo.map((item) => (
                        <TalentCard key={item.label} {...item} />
                    ))}
                </div>
            </div>
        </section>
    );
}