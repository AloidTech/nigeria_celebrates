'use client';

import { useState } from 'react';
import { Radio, Users, MessageSquare, ExternalLink, Play } from 'lucide-react';

export default function LivePage() {
    // 👈 Plugged in your exact YouTube video ID as the default
    const [videoId, setVideoId] = useState('hUym5FBCRvU'); 
    const [isEditingId, setIsEditingId] = useState(false);
    const [tempId, setTempId] = useState(videoId);

    const handleUpdateStream = (e: React.FormEvent) => {
        e.preventDefault();
        setVideoId(tempId);
        setIsEditingId(false);
    };

    return (
        <main className='min-h-screen pb-10 bg-[#F5F5F0] text-[#1A1A1A]'>
            <div className='mx-auto w-full max-w-4xl'>
                
                {/* Header matching site UI */}
                <section className='px-8 pb-6 pt-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4'>
                    <div>
                        <div className='inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-red-700 mb-2 animate-pulse'>
                            <Radio className='h-3 w-3' /> Live Broadcast
                        </div>
                        <h1 className='text-4xl font-bold text-[#1A1A1A] tracking-tight'>The Arena Main Stage</h1>
                        <p className='mt-2 max-w-lg text-sm text-gray-600'>
                            Watch the raw creative execution happening live across Nigeria. Tune into global streams and presentations.
                        </p>
                    </div>

                    {/* Demo Mode switcher for Hackathon Pitch */}
                    <div className='bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-xs w-full md:w-auto'>
                        {isEditingId ? (
                            <form onSubmit={handleUpdateStream} className='flex gap-2'>
                                <input 
                                    type='text' 
                                    value={tempId} 
                                    onChange={(e) => setTempId(e.target.value)}
                                    placeholder='Paste YouTube Video ID'
                                    className='border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1A3C2E]'
                                />
                                <button type='submit' className='bg-[#1A3C2E] text-white px-2 py-1 rounded font-semibold'>Save</button>
                            </form>
                        ) : (
                            <button 
                                onClick={() => setIsEditingId(true)} 
                                className='text-gray-500 hover:text-[#1A3C2E] font-medium flex items-center gap-1'
                            >
                                ⚙️ Configure Demo Stream ID
                            </button>
                        )}
                    </div>
                </section>

                {/* Main Content Layout Grid */}
                <section className='px-8 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    
                    {/* Video Player Column */}
                    <div className='lg:col-span-2 space-y-4'>
                        {/* Custom aspect-video container maintains theme while forcing responsive scaling */}
                        <div className='overflow-hidden rounded-xl bg-black shadow-md border border-gray-200 aspect-video w-full relative'>
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&si=LYFdxORK1G-5vGP8`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                                className='absolute top-0 left-0 w-full h-full'
                            />
                        </div>

                        {/* Stream Stats Bar matching theme */}
                        <div className='rounded-xl bg-white p-4 shadow-sm border border-gray-100 flex justify-between items-center text-sm text-gray-600'>
                            <div className='flex items-center gap-4'>
                                <span className='flex items-center gap-1.5 font-medium text-[#1A1A1A]'>
                                    <Users className='h-4 w-4 text-[#1A3C2E]' /> 4.2k watching
                                </span>
                                <span className='h-4 w-px bg-gray-200' />
                                <span className='flex items-center gap-1.5'>
                                    <MessageSquare className='h-4 w-4 text-gray-400' /> Active Chat Enabled
                                </span>
                            </div>
                            <a 
                                href={`https://www.youtube.com/watch?v=${videoId}`} 
                                target='_blank' 
                                rel='noreferrer' 
                                className='inline-flex items-center gap-1 text-xs font-semibold text-[#1A3C2E] hover:underline'
                            >
                                Open on YouTube <ExternalLink className='h-3 w-3' />
                            </a>
                        </div>
                    </div>

                    {/* Side Sidebar Panel - Stream Meta Data */}
                    <div className='space-y-4'>
                        <div className='rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4'>
                            <div className='text-xs font-bold uppercase tracking-widest text-[#1A3C2E]'>UP NEXT ON STAGE</div>
                            
                            <div className='border-l-2 border-[#1A3C2E] pl-3 space-y-1'>
                                <h4 className='text-sm font-bold text-[#1A1A1A]'>Naija Tech Founders Panel</h4>
                                <p className='text-xs text-gray-500'>11:30 AM — Technical Excellence Frameworks</p>
                            </div>

                            <div className='border-l-2 border-gray-200 pl-3 space-y-1 opacity-60'>
                                <h4 className='text-sm font-semibold text-gray-700'>Grand Finale & Pitch Arena</h4>
                                <p className='text-xs text-gray-500'>03:00 PM — Live Judging Panel Review</p>
                            </div>
                        </div>

                        <div className='rounded-xl bg-[#EEF4F0] p-6 border border-[#1A3C2E]/10 space-y-2'>
                            <h3 className='font-bold text-[#1A3C2E] flex items-center gap-2 text-sm uppercase tracking-wide'>
                                <Play className='h-4 w-4 fill-current' /> Instant Interactive Sync
                            </h3>
                            <p className='text-xs text-gray-600 leading-relaxed'>
                                This live frame links dynamically to your backend. When admins hit approve on incoming uploads, they push natively right under the current stream environment!
                            </p>
                        </div>
                    </div>

                </section>
            </div>
        </main>
    );
}