import Link from 'next/link';
import { Sparkles, Upload, UserRound, Users } from 'lucide-react';
export default function HeroSection() {
    return (
        <section id='top' className='relative min-h-[70vh] overflow-hidden bg-[#0a2818]'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_18%),radial-gradient(circle_at_55%_20%,rgba(255,255,255,0.08),transparent_14%),radial-gradient(circle_at_75%_30%,rgba(255,255,255,0.12),transparent_16%),linear-gradient(180deg,rgba(10,40,24,0.72),rgba(10,40,24,0.78))]' />
            <div className='absolute inset-0 bg-[linear-gradient(to_top,rgba(245,245,240,0.94)_0%,rgba(245,245,240,0.7)_17%,rgba(0,0,0,0.12)_55%,rgba(0,0,0,0.28)_100%)]' />
            <div className='absolute inset-0 opacity-50'>
                <div className='absolute left-[8%] top-[28%] h-48 w-32 rounded-[48%_52%_40%_60%/36%_40%_60%_64%] bg-black/35 blur-[1px]' />
                <div className='absolute left-[24%] bottom-[18%] h-56 w-36 rounded-[46%_54%_38%_62%/40%_46%_54%_60%] bg-black/28' />
                <div className='absolute left-[42%] top-[10%] h-80 w-44 rounded-[44%_56%_34%_66%/32%_34%_66%_68%] bg-black/45' />
                <div className='absolute right-[18%] bottom-[22%] h-52 w-34 rounded-[46%_54%_36%_64%/38%_42%_58%_62%] bg-black/28' />
                <div className='absolute right-[7%] bottom-[16%] h-40 w-28 rounded-[50%_50%_42%_58%/34%_40%_60%_66%] bg-black/30' />
            </div>
            <div className='relative mx-auto flex min-h-[70vh] max-w-7xl items-end px-4 py-10 sm:px-6 lg:px-8'>
                <div className='max-w-md pb-8 sm:pb-12 lg:pb-14'>
                    <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-[#d4a017] px-3 py-1 text-xs font-semibold text-[#1a1a1a] shadow-sm'>
                        <Sparkles className='h-3.5 w-3.5 fill-current' />
                        EDITOR&apos;S CHOICE
                    </div>
                    <h1 className='max-w-md text-4xl font-bold leading-tight text-white sm:text-5xl'>Celebrate the Rhythm of Our Nation</h1>
                    <p className='mt-3 max-w-xs text-sm leading-6 text-white/75'>
                        Join the largest digital stage showcasing Nigeria&apos;s undisputed talent. Upload, Vote, and Win big.
                    </p>
                    <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
                        <Link
                            href='/sign-in'
                            className='inline-flex items-center justify-center gap-2 rounded-md bg-[#1a3c2e] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/15 transition hover:bg-[#163326]'>
                            <Upload className='h-4 w-4' />
                            Upload Talent
                        </Link>
                        <Link
                            href='/votes'
                            className='inline-flex items-center justify-center gap-2 rounded-md bg-[#d4a017] px-5 py-3 text-sm font-semibold text-[#1a1a1a] shadow-lg shadow-black/15 transition hover:bg-[#c19113]'>
                            <UserRound className='h-4 w-4' />
                            Vote Now
                        </Link>
                        <Link
                            href='/quiz'
                            className='inline-flex items-center justify-center gap-2 rounded-md border border-white bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10'>
                            <Users className='h-4 w-4' />
                            Join Quiz
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
