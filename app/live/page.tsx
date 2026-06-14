'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    Radio, Users, MessageSquare, ExternalLink, Play, Mic, MicOff,
    Hand, Camera, CameraOff, Video, VideoOff, ArrowLeft, Wifi, MonitorPlay
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

const mockParticipants = [
    { name: 'Chidi Benson', role: 'Judge', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', status: 'On Stage' },
    { name: 'Amara Okafor', role: 'Co-Host', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', status: 'On Stage' },
    { name: 'Tunde Bakare', role: 'Presenter', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', status: 'On Stage' },
    { name: 'Fatima Yusuf', role: 'Viewer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', status: 'Audience' },
    { name: 'Nnamdi Azikiwe', role: 'Viewer', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', status: 'Audience' },
    { name: 'Yetunde Alao', role: 'Viewer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', status: 'Audience' },
    { name: 'Ibrahim Musa', role: 'Viewer', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100', status: 'Audience' },
    { name: 'Chioma Nkem', role: 'Viewer', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100', status: 'Audience' }
];

type Mode = 'viewer' | 'streamer';

// ─── Lobby: shown to logged-in users before choosing a role ─────────────────
function ModeLobby({ onSelect, userName }: { onSelect: (m: Mode) => void; userName: string }) {
    return (
        <main className='min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center px-4 py-16'>
            <div className='inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-red-700 mb-6 animate-pulse'>
                <Radio className='h-3 w-3' /> Live Now
            </div>

            <h1 className='text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-2 tracking-tight'>
                The Arena Main Stage
            </h1>
            <p className='text-sm text-gray-500 text-center mb-10 max-w-sm leading-relaxed'>
                Welcome back, <span className='font-semibold text-[#1A3C2E]'>{userName}</span>. How would you like to join today?
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl'>
                {/* Watch card */}
                <button
                    type='button'
                    onClick={() => onSelect('viewer')}
                    className='group text-left rounded-2xl bg-white border border-gray-200 p-7 shadow-sm hover:border-[#1A3C2E] hover:shadow-md transition-all duration-200 active:scale-[0.98]'
                >
                    <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4F0] text-[#1A3C2E] mb-5 group-hover:bg-[#1A3C2E] group-hover:text-white transition-colors duration-200'>
                        <MonitorPlay className='h-5 w-5' />
                    </div>
                    <h2 className='text-base font-bold text-[#1A1A1A] mb-1.5'>Watch Live</h2>
                    <p className='text-xs text-gray-500 leading-relaxed'>
                        Tune in and experience the show from the audience. Vote, react, and engage with performers.
                    </p>
                    <div className='mt-5 flex items-center gap-1.5 text-xs font-semibold text-[#1A3C2E]'>
                        <Users className='h-3.5 w-3.5' /> 4.2k watching now
                    </div>
                </button>

                {/* Stream card */}
                <button
                    type='button'
                    onClick={() => onSelect('streamer')}
                    className='group text-left rounded-2xl bg-[#1A3C2E] border border-[#1A3C2E] p-7 shadow-sm hover:bg-[#153325] transition-all duration-200 active:scale-[0.98]'
                >
                    <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white mb-5'>
                        <Radio className='h-5 w-5' />
                    </div>
                    <h2 className='text-base font-bold text-white mb-1.5'>Go Live</h2>
                    <p className='text-xs text-white/65 leading-relaxed'>
                        Step onto the stage and broadcast your talent live to thousands of viewers across Nigeria.
                    </p>
                    <div className='mt-5 flex items-center gap-1.5 text-xs font-semibold text-white/50'>
                        <Wifi className='h-3.5 w-3.5' /> Broadcast to live audience
                    </div>
                </button>
            </div>

            {/* Soft skip link for users who want neither */}
            <button
                type='button'
                onClick={() => onSelect('viewer')}
                className='mt-8 text-xs text-gray-400 hover:text-gray-600 transition underline underline-offset-2'
            >
                Just browse — enter as viewer
            </button>
        </main>
    );
}

// ─── Streamer view ───────────────────────────────────────────────────────────
function StreamerView({ onExit, userName }: { onExit: () => void; userName: string }) {
    const [isLive, setIsLive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [streamTitle, setStreamTitle] = useState('');
    const [category, setCategory] = useState('music');

    function handleGoLive() {
        if (!streamTitle.trim()) {
            toast.error('Add a stream title before going live.');
            return;
        }
        setIsLive(true);
        toast.success("You're live! The audience can see you now.");
    }

    function handleEndStream() {
        setIsLive(false);
        toast('Stream ended. Thanks for performing!', { icon: '🎤' });
        onExit();
    }

    return (
        <main className='min-h-screen bg-[#0D0D0D] text-white flex flex-col'>
            {/* Streamer header */}
            <header className='flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] shrink-0'>
                <button
                    type='button'
                    onClick={isLive ? handleEndStream : onExit}
                    className='flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition'
                >
                    <ArrowLeft className='h-4 w-4' />
                    {isLive ? 'End stream' : 'Back to viewer'}
                </button>

                {isLive ? (
                    <div className='inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest'>
                        <span className='h-1.5 w-1.5 rounded-full bg-white animate-pulse' />
                        Live
                    </div>
                ) : (
                    <span className='text-[10px] font-bold uppercase tracking-widest text-white/25'>Preview</span>
                )}

                <div className='text-xs text-white/30 font-medium'>{userName}</div>
            </header>

            {/* Main broadcast layout */}
            <div className='flex-1 mx-auto w-full max-w-4xl px-5 py-7'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
                    {/* Camera preview */}
                    <div className='lg:col-span-2 space-y-4'>
                        <div className='relative aspect-video rounded-xl bg-[#111] border border-white/[0.06] overflow-hidden flex items-center justify-center'>
                            {isCameraOff ? (
                                <div className='flex flex-col items-center gap-3 text-white/20'>
                                    <CameraOff className='h-12 w-12' />
                                    <span className='text-xs font-medium tracking-wide'>Camera off</span>
                                </div>
                            ) : (
                                <div className='flex flex-col items-center gap-2 text-white/15'>
                                    <Camera className='h-10 w-10' />
                                    <span className='text-[10px] font-medium tracking-widest uppercase'>Camera preview</span>
                                </div>
                            )}

                            {/* Live badge overlay */}
                            {isLive && (
                                <div className='absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide'>
                                    <span className='h-1.5 w-1.5 rounded-full bg-white animate-pulse' /> Live
                                </div>
                            )}

                            {/* Name chyron when live */}
                            {isLive && (
                                <div className='absolute bottom-3 left-3 rounded-md bg-black/70 backdrop-blur-sm px-2.5 py-1.5'>
                                    <div className='text-[10px] text-white/50 uppercase tracking-widest'>Performing</div>
                                    <div className='text-sm font-bold text-white'>{streamTitle || userName}</div>
                                </div>
                            )}
                        </div>

                        {/* Controls row */}
                        <div className='flex items-center justify-center gap-3'>
                            <button
                                type='button'
                                onClick={() => setIsMuted((m) => !m)}
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                                    isMuted ? 'bg-red-600 border-red-600' : 'border-white/15 hover:border-white/30 text-white/60 hover:text-white'
                                }`}
                            >
                                {isMuted ? <MicOff className='h-4 w-4' /> : <Mic className='h-4 w-4' />}
                            </button>

                            <button
                                type='button'
                                onClick={() => setIsCameraOff((c) => !c)}
                                aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                                    isCameraOff ? 'bg-red-600 border-red-600' : 'border-white/15 hover:border-white/30 text-white/60 hover:text-white'
                                }`}
                            >
                                {isCameraOff ? <VideoOff className='h-4 w-4' /> : <Video className='h-4 w-4' />}
                            </button>

                            {!isLive ? (
                                <button
                                    type='button'
                                    onClick={handleGoLive}
                                    className='ml-1 rounded-full bg-red-600 hover:bg-red-700 px-7 py-2.5 text-sm font-bold transition active:scale-95 flex items-center gap-2'
                                >
                                    <Radio className='h-4 w-4' /> Go Live
                                </button>
                            ) : (
                                <button
                                    type='button'
                                    onClick={handleEndStream}
                                    className='ml-1 rounded-full border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 px-7 py-2.5 text-sm font-semibold transition active:scale-95'
                                >
                                    End Stream
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Setup sidebar */}
                    <div className='space-y-4'>
                        <div className='rounded-xl bg-white/[0.04] border border-white/[0.08] p-5 space-y-4'>
                            <h3 className='text-[10px] font-bold uppercase tracking-widest text-white/35'>Stream Setup</h3>

                            <div>
                                <label className='block text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1.5'>
                                    Title
                                </label>
                                <input
                                    type='text'
                                    value={streamTitle}
                                    onChange={(e) => setStreamTitle(e.target.value)}
                                    placeholder='e.g. My Afrobeat Performance…'
                                    disabled={isLive}
                                    className='w-full rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 disabled:opacity-40 transition'
                                />
                            </div>

                            <div>
                                <label className='block text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1.5'>
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    disabled={isLive}
                                    className='w-full rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 disabled:opacity-40 transition'
                                >
                                    <option value='music'>Music</option>
                                    <option value='art'>Artwork</option>
                                    <option value='fashion'>Fashion</option>
                                    <option value='freestyle'>Freestyle</option>
                                    <option value='comedy'>Comedy</option>
                                </select>
                            </div>
                        </div>

                        {/* Live viewer count */}
                        <div className='rounded-xl bg-white/[0.04] border border-white/[0.08] p-5'>
                            <h3 className='text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3'>Audience Online</h3>
                            <p className='text-2xl font-bold text-white'>4,231</p>
                            <p className='text-xs text-white/30 mt-0.5'>viewers watching right now</p>
                        </div>

                        {/* Tips */}
                        {!isLive && (
                            <div className='rounded-xl bg-[#1A3C2E]/40 border border-[#1A3C2E]/40 p-4'>
                                <p className='text-[10px] text-white/40 leading-relaxed'>
                                    Fill in your title and category, then hit <span className='text-white/60 font-bold'>Go Live</span> to start broadcasting. You can mute audio or disable your camera at any time.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

// ─── Viewer layout (existing) ────────────────────────────────────────────────
function ViewerLayout({
    onSwitchToStream,
    isAuthenticated
}: {
    onSwitchToStream: () => void;
    isAuthenticated: boolean;
}) {
    const [videoId, setVideoId] = useState('hUym5FBCRvU');
    const [isEditingId, setIsEditingId] = useState(false);
    const [tempId, setTempId] = useState(videoId);
    const [activeSidebarTab, setActiveSidebarTab] = useState<'participants' | 'schedule'>('participants');
    const [wavedUsers, setWavedUsers] = useState<Record<string, boolean>>({});

    const handleUpdateStream = (e: React.FormEvent) => {
        e.preventDefault();
        setVideoId(tempId);
        setIsEditingId(false);
    };

    const handleWave = (name: string) => {
        setWavedUsers((prev) => ({ ...prev, [name]: true }));
        toast.success(`You waved to ${name}!`);
    };

    return (
        <main className='min-h-screen pb-10 bg-[#F5F5F0] text-[#1A1A1A]'>
            <div className='mx-auto w-full max-w-4xl'>
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

                    <div className='flex flex-col gap-2 items-end'>
                        {/* Go Live CTA for authenticated users */}
                        {isAuthenticated && (
                            <button
                                type='button'
                                onClick={onSwitchToStream}
                                className='inline-flex items-center gap-1.5 rounded-full bg-[#1A3C2E] hover:bg-[#153325] px-4 py-2 text-xs font-bold text-white transition active:scale-95'
                            >
                                <Radio className='h-3.5 w-3.5' /> Go Live
                            </button>
                        )}

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
                                    <button type='submit' className='bg-[#1A3C2E] text-white px-2 py-1 rounded font-semibold'>
                                        Save
                                    </button>
                                </form>
                            ) : (
                                <button onClick={() => setIsEditingId(true)} className='text-gray-500 hover:text-[#1A3C2E] font-medium flex items-center gap-1'>
                                    Configure Demo Stream ID
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section className='px-8 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {/* Video player */}
                    <div className='lg:col-span-2 space-y-4'>
                        <div className='overflow-hidden rounded-xl bg-black shadow-md border border-gray-200 aspect-video w-full relative'>
                            <iframe
                                width='100%'
                                height='100%'
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&si=LYFdxORK1G-5vGP8`}
                                title='YouTube video player'
                                frameBorder='0'
                                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                                referrerPolicy='strict-origin-when-cross-origin'
                                allowFullScreen
                                className='absolute top-0 left-0 w-full h-full'
                            />
                        </div>

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

                    {/* Sidebar */}
                    <div className='space-y-4 flex flex-col'>
                        <div className='rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-[400px]'>
                            <div className='flex border-b border-gray-150 bg-gray-50/50'>
                                <button
                                    onClick={() => setActiveSidebarTab('participants')}
                                    className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition ${
                                        activeSidebarTab === 'participants' ? 'border-[#1A3C2E] text-[#1A3C2E] bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    Participants
                                </button>
                                <button
                                    onClick={() => setActiveSidebarTab('schedule')}
                                    className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition ${
                                        activeSidebarTab === 'schedule' ? 'border-[#1A3C2E] text-[#1A3C2E] bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    Schedule
                                </button>
                            </div>

                            <div className='p-5 flex-1 overflow-y-auto max-h-[450px]'>
                                {activeSidebarTab === 'participants' ? (
                                    <div className='space-y-4'>
                                        <div>
                                            <h3 className='text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5'>On Stage</h3>
                                            <div className='space-y-2'>
                                                {mockParticipants
                                                    .filter((p) => p.status === 'On Stage')
                                                    .map((p) => (
                                                        <div
                                                            key={p.name}
                                                            className='flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100/50'
                                                        >
                                                            <div className='flex items-center gap-2.5'>
                                                                <div className='relative'>
                                                                    <img src={p.avatar} alt={p.name} className='h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500' />
                                                                    <span className='absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse' />
                                                                </div>
                                                                <div>
                                                                    <h4 className='text-xs font-bold text-gray-800'>{p.name}</h4>
                                                                    <span className='text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded'>
                                                                        {p.role}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Mic className='h-3.5 w-3.5 text-emerald-600' />
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                        <div className='pt-2'>
                                            <h3 className='text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5'>Audience</h3>
                                            <div className='space-y-2.5'>
                                                {mockParticipants
                                                    .filter((p) => p.status === 'Audience')
                                                    .map((p) => (
                                                        <div key={p.name} className='flex items-center justify-between'>
                                                            <div className='flex items-center gap-2.5'>
                                                                <img src={p.avatar} alt={p.name} className='h-7.5 w-7.5 rounded-full object-cover' />
                                                                <div>
                                                                    <h4 className='text-xs font-semibold text-gray-700'>{p.name}</h4>
                                                                    <span className='text-[9px] text-gray-450'>Tuned In</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type='button'
                                                                onClick={() => handleWave(p.name)}
                                                                disabled={wavedUsers[p.name]}
                                                                className={`p-1.5 rounded-full border transition duration-200 ${
                                                                    wavedUsers[p.name]
                                                                        ? 'bg-gray-155 border-gray-200 text-gray-400 cursor-not-allowed'
                                                                        : 'border-[#1A3C2E]/20 text-[#1A3C2E] hover:bg-[#1A3C2E]/10'
                                                                }`}
                                                                aria-label={`Wave at ${p.name}`}
                                                            >
                                                                <Hand className='h-3 w-3' />
                                                            </button>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='space-y-4'>
                                        <div className='text-xs font-bold uppercase tracking-widest text-[#1A3C2E] mb-2'>UP NEXT ON STAGE</div>
                                        <div className='border-l-2 border-[#1A3C2E] pl-3 space-y-1'>
                                            <h4 className='text-sm font-bold text-[#1A1A1A]'>Naija Tech Founders Panel</h4>
                                            <p className='text-xs text-gray-500'>11:30 AM — Technical Excellence Frameworks</p>
                                        </div>
                                        <div className='border-l-2 border-gray-200 pl-3 space-y-1 opacity-60'>
                                            <h4 className='text-sm font-semibold text-gray-700'>Grand Finale & Pitch Arena</h4>
                                            <p className='text-xs text-gray-500'>03:00 PM — Live Judging Panel Review</p>
                                        </div>
                                    </div>
                                )}
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

// ─── Page root ───────────────────────────────────────────────────────────────
export default function LivePage() {
    const { user } = useAuth();
    const [mode, setMode] = useState<Mode | null>(null);

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'Creator';
    const isAuthenticated = !!user;

    // Unauthenticated users skip the lobby and go straight to viewer
    if (!isAuthenticated && mode === null) {
        return (
            <ViewerLayout
                onSwitchToStream={() => {}}
                isAuthenticated={false}
            />
        );
    }

    // Authenticated users see the lobby until they pick a mode
    if (isAuthenticated && mode === null) {
        return <ModeLobby onSelect={setMode} userName={displayName} />;
    }

    if (mode === 'streamer') {
        return <StreamerView onExit={() => setMode(null)} userName={displayName} />;
    }

    return (
        <ViewerLayout
            onSwitchToStream={() => setMode('streamer')}
            isAuthenticated={isAuthenticated}
        />
    );
}
