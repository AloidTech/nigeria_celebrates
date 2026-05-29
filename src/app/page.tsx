import ChampionsRow from '@/components/sections/ChampionsRow';
import HeroSection from '@/components/sections/HeroSection';
import TalentGrid from '@/components/sections/TalentGrid';

export default function Home() {
    return (
        <main className='min-h-screen bg-[#f5f5f0] text-[#1a1a1a]'>
            <HeroSection />
            <ChampionsRow />
            <TalentGrid />
        </main>
    );
}
