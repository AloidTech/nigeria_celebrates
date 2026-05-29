export default function Navbar() {
    return (
        <header className='sticky top-0 z-30 border-b border-black/5 bg-white/95 backdrop-blur'>
            <div className='mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8'>
                <a href='#top' className='text-xl font-bold uppercase tracking-[0.18em] text-[#1a3c2e]'>
                    Naija Vibe
                </a>
                <nav className='flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-[#4d4d4d] lg:flex-1'>
                    <a href='#champions' className='border-b-2 border-[#1a3c2e] pb-1 text-[#1a3c2e]'>
                        Talent Zone
                    </a>
                    <a href='#champions' className='transition hover:text-[#1a3c2e]'>
                        Naija Votes
                    </a>
                    <a href='#champions' className='transition hover:text-[#1a3c2e]'>
                        Quiz
                    </a>
                    <a href='#champions' className='transition hover:text-[#1a3c2e]'>
                        Live Streams
                    </a>
                    <a href='#champions' className='transition hover:text-[#1a3c2e]'>
                        Global Icons
                    </a>
                    <a href='#champions' className='transition hover:text-[#1a3c2e]'>
                        My Arena
                    </a>
                </nav>
                <a href='#talents' className='inline-flex items-center justify-center rounded-full bg-[#1a3c2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153325]'>
                    Join Now
                </a>
            </div>
        </header>
    );
}