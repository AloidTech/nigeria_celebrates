import IconButton from '@/components/ui/IconButton';
import { Globe as GlobeIcon, Mail, Share2 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className='border-t border-gray-200 bg-[#f5f5f0] px-8 pb-6 pt-12'>
            <div className='mx-auto max-w-7xl'>
                <div className='grid gap-10 md:grid-cols-3'>
                    <div className='max-w-sm'>
                        <div className='text-xl font-bold uppercase tracking-[0.18em] text-[#1a3c2e]'>Naija Vibe</div>
                        <p className='mt-4 text-sm leading-6 text-[#666666]'>
                            Celebrating the spirit of Nigeria by showcasing the next generation of talent, from Afrobeats prodigies to tech innovators.
                        </p>
                        <div className='mt-5 flex items-center gap-3'>
                            <IconButton>
                                <GlobeIcon className='h-4 w-4' />
                            </IconButton>
                            <IconButton>
                                <Share2 className='h-4 w-4' />
                            </IconButton>
                            <IconButton>
                                <Mail className='h-4 w-4' />
                            </IconButton>
                        </div>
                    </div>

                    <div>
                        <h3 className='mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1a1a]'>Platform</h3>
                        <ul className='space-y-3 text-sm text-[#666666]'>
                            <li>
                                <a className='transition hover:text-[#1a3c2e]' href='#champions'>
                                    Talent Zone
                                </a>
                            </li>
                            <li>
                                <a className='transition hover:text-[#1a3c2e]' href='#champions'>
                                    Naija Votes
                                </a>
                            </li>
                            <li>
                                <a className='transition hover:text-[#1a3c2e]' href='#champions'>
                                    Live Quiz
                                </a>
                            </li>
                            <li>
                                <a className='transition hover:text-[#1a3c2e]' href='#champions'>
                                    Global Icons
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className='mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1a1a]'>Company</h3>
                        <ul className='space-y-3 text-sm text-[#666666]'>
                            <li>
                                <a className='transition hover:text-[#1a3c2e]' href='#top'>
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a className='transition hover:text-[#1a3c2e]' href='#top'>
                                    Contact Support
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className='mt-8 border-t border-gray-200 pt-4'>
                    <div className='flex flex-col gap-4 text-xs text-[#666666] md:flex-row md:items-center md:justify-between'>
                        <p>© 2024 NAIJA VIBE. All rights reserved.</p>
                        <div className='flex flex-wrap gap-x-5 gap-y-2'>
                            <a className='transition hover:text-[#1a3c2e]' href='#top'>
                                Cultural Heritage
                            </a>
                            <a className='transition hover:text-[#1a3c2e]' href='#top'>
                                Talent Submission
                            </a>
                            <a className='transition hover:text-[#1a3c2e]' href='#top'>
                                Privacy Policy
                            </a>
                            <a className='transition hover:text-[#1a3c2e]' href='#top'>
                                Terms of Service
                            </a>
                            <a className='transition hover:text-[#1a3c2e]' href='#top'>
                                Platform Credits
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
