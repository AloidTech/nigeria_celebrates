'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, ThumbsDown, ThumbsUp, Check, Upload } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/supabase';
import { getLiveSubmissionsWithVotes, castVote, removeVote } from '@/lib/supabase/queries/uploads';
import type { TalentCardProps } from './TalentCard';
import type { talent_category } from '@/lib/database_types/upload_types';

const mockCards: TalentCardProps[] = [
    {
        id: 'mock-music-1',
        category: 'MUSIC',
        title: 'Eko Beats Freestyle',
        description: 'Raw acoustic performance blending afrobeat rhythms with soulful lyrics...',
        votes: '1.2k',
        time: '2h ago',
        media_url: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    {
        id: 'mock-art-2',
        category: 'ARTWORK',
        title: 'Ancestral Echoes',
        description: 'Hand-painted portrait exploring the intersection of modern youth and...',
        votes: '856',
        time: '5h ago',
        materials: 'Charcoal, Acrylic, Gold Leaf on Canvas',
        media_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800'
    },
    {
        id: 'mock-freestyle-3',
        category: 'FREESTYLE',
        title: 'Abuja Streets Skillset',
        description: "Incredible gravity-defying tricks captured in the heart of Abuja's...",
        votes: '3.4k',
        time: 'Just now',
        media_url: 'https://www.w3schools.com/html/movie.mp4'
    },
    {
        id: 'mock-fashion-4',
        category: 'FASHION',
        title: 'Aso-Oke Reimagined',
        description: 'A stunning showcase of traditional Yorùbá fabric transformed into...',
        votes: '1.1k',
        time: '1h ago',
        media_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'
    }
];

function getFileType(url: string | null | undefined) {
    if (!url) return 'unknown';
    if (/\.(mp4|webm|ogg|mov)$/i.test(url)) return 'video';
    if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || url.includes('images.unsplash.com') || url.includes('image/upload')) return 'image';
    return 'document';
}

function parseVotes(votes: string | number) {
    if (typeof votes === 'number') return votes;
    const normalized = votes.trim().toLowerCase();
    if (normalized.endsWith('k')) return Number.parseFloat(normalized) * 1000;
    return Number.parseInt(normalized, 10) || 0;
}

function formatVotes(value: number) {
    if (value >= 1000) {
        const scaled = value / 1000;
        return `${Number.isInteger(scaled) ? scaled.toFixed(0) : scaled.toFixed(1)}k`;
    }
    return value.toString();
}



function FeedItem({ card, showToast }: { card: TalentCardProps, showToast: (msg: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [voteCount, setVoteCount] = useState(() => parseVotes(card.votes));
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(card.currentUserVote || null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (videoRef.current) {
                    if (entry.isIntersecting) {
                        videoRef.current.play().catch(() => {});
                    } else {
                        videoRef.current.pause();
                        videoRef.current.currentTime = 0;
                    }
                }
            },
            { threshold: 0.6 }
        );

        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    const handleUpvote = async () => {
        if (!card.id) return;
        if (userVote === 'up') {
            setVoteCount((c) => c - 1);
            setUserVote(null);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) await removeVote(supabase, card.id, user.id);
            } catch (err) {
                console.error(err);
            }
            return;
        }
        const change = userVote === 'down' ? 2 : 1;
        setVoteCount((c) => c + change);
        setUserVote('up');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { showToast("Please log in to vote!"); return; }
            await castVote(supabase, card.id, user.id, true, card.category as talent_category);
        } catch (err) {}
    };

    const handleDownvote = async () => {
        if (!card.id) return;
        if (userVote === 'down') {
            setVoteCount((c) => c + 1);
            setUserVote(null);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) await removeVote(supabase, card.id, user.id);
            } catch (err) {}
            return;
        }
        const change = userVote === 'up' ? 2 : 1;
        setVoteCount((c) => c - change);
        setUserVote('down');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { showToast("Please log in to vote!"); return; }
            await castVote(supabase, card.id, user.id, false, card.category as talent_category);
        } catch (err) {}
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: card.title,
                    text: card.description,
                    url: window.location.href,
                });
            } catch (err) {}
        } else {
            navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const isVideo = getFileType(card.media_url) === 'video';
    const isImage = getFileType(card.media_url) === 'image';

    return (
        <div className="h-[100dvh] w-full snap-start relative bg-[#121212] flex items-center justify-center py-4 sm:py-8 overflow-hidden">
            {/* Media Content */}
            <div className="relative h-full w-full max-w-[450px] flex items-center justify-center bg-black sm:rounded-[24px] overflow-hidden shadow-2xl">
                {isVideo && card.media_url && (
                    <video 
                        ref={videoRef}
                        src={card.media_url} 
                        className="w-full h-full object-contain" 
                        controls={false}
                        loop
                        playsInline
                        muted
                    />
                )}
                {isImage && card.media_url && (
                    <img 
                        src={card.media_url} 
                        alt={card.title} 
                        className="w-full h-full object-contain" 
                    />
                )}
                {!isVideo && !isImage && (
                    <div className="text-white/50">Unsupported media format</div>
                )}
                {/* Gradient Overlay for Text */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Bottom Left Info */}
                <div className="absolute bottom-8 left-6 right-6 z-10 text-white">
                    <span className="inline-block bg-[#8B7355] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2">
                        {card.category}
                    </span>
                    <h2 className="text-lg font-bold drop-shadow-md line-clamp-1">{card.title}</h2>
                    <p className="text-sm mt-1 text-white/90 drop-shadow-md line-clamp-3">{card.description}</p>
                    {card.materials && (
                        <p className="text-[10px] uppercase tracking-wider text-white/60 mt-2 font-semibold">
                            Materials: {card.materials}
                        </p>
                    )}
                </div>
            </div>

            {/* Right Side Action Buttons */}
            <div className="absolute bottom-20 right-4 sm:static sm:ml-6 flex flex-col items-center gap-6 z-10">
                <button onClick={handleUpvote} className="flex flex-col items-center group">
                    <div className="h-12 w-12 rounded-full bg-black/40 sm:bg-white/10 backdrop-blur-md flex items-center justify-center transition group-hover:bg-black/60 sm:group-hover:bg-white/20">
                        <ThumbsUp className={`h-6 w-6 transition-colors ${userVote === 'up' ? 'text-green-400 fill-green-400' : 'text-white'}`} />
                    </div>
                    <span className="text-xs text-white mt-1 font-semibold drop-shadow-md">{formatVotes(Math.max(0, voteCount))}</span>
                </button>
                
                <button onClick={handleDownvote} className="flex flex-col items-center group">
                    <div className="h-12 w-12 rounded-full bg-black/40 sm:bg-white/10 backdrop-blur-md flex items-center justify-center transition group-hover:bg-black/60 sm:group-hover:bg-white/20">
                        <ThumbsDown className={`h-6 w-6 transition-colors ${userVote === 'down' ? 'text-red-400 fill-red-400' : 'text-white'}`} />
                    </div>
                    <span className="text-xs text-white mt-1 font-semibold drop-shadow-md">Dislike</span>
                </button>

                <Link href="/upload" className="flex flex-col items-center group">
                    <div className="h-12 w-12 rounded-full bg-black/40 sm:bg-white/10 backdrop-blur-md flex items-center justify-center transition group-hover:bg-black/60 sm:group-hover:bg-white/20">
                        <Upload className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs text-white mt-1 font-semibold drop-shadow-md">Upload</span>
                </Link>

                <button onClick={handleShare} className="flex flex-col items-center group">
                    <div className="h-12 w-12 rounded-full bg-black/40 sm:bg-white/10 backdrop-blur-md flex items-center justify-center transition group-hover:bg-black/60 sm:group-hover:bg-white/20">
                        {isCopied ? <Check className="h-6 w-6 text-green-400" /> : <Share2 className="h-6 w-6 text-white" />}
                    </div>
                    <span className="text-xs text-white mt-1 font-semibold drop-shadow-md">{isCopied ? 'Copied' : 'Share'}</span>
                </button>
            </div>
        </div>
    );
}

export default function VerticalMediaFeed({ initialId }: { initialId: string }) {
    const router = useRouter();
    const [cards, setCards] = useState<TalentCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    useEffect(() => {
        const fetchLiveSubmissions = async () => {
            try {
                const data = await getLiveSubmissionsWithVotes(supabase);
                const { data: { user } } = await supabase.auth.getUser();
                const userVotesMap: Record<string, 'up' | 'down'> = {};
                if (user) {
                    const { data: userVotes } = await supabase.from('votes').select('submission_id, vote_type').eq('user_id', user.id);
                    if (userVotes) {
                        userVotes.forEach((v) => { userVotesMap[v.submission_id] = v.vote_type === 1 ? 'up' : 'down'; });
                    }
                }

                const liveCards: TalentCardProps[] = data.map((item) => {
                    const totalVotes = Math.max(0, item.total_votes || 0);
                    return {
                        id: item.id,
                        category: item.category ? item.category.toUpperCase().replace(' (HANDMADE ONLY)', '') : 'GENERAL',
                        title: item.title,
                        description: item.description || '',
                        votes: totalVotes.toString(),
                        time: 'Just now',
                        media_url: item.media_url,
                        currentUserVote: userVotesMap[item.id] || null
                    };
                });

                const all = [...liveCards, ...mockCards];
                
                // Reorder so initialId is first
                const initialIndex = all.findIndex(c => c.id === initialId);
                if (initialIndex > 0) {
                    const selected = all.splice(initialIndex, 1)[0];
                    all.unshift(selected);
                }
                
                setCards(all);
            } catch (err) {
                console.error('Failed to load feed:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLiveSubmissions();
    }, [initialId]);

    if (isLoading) {
        return (
            <div className="h-[100dvh] w-full bg-black flex items-center justify-center text-white/50">
                <div className="animate-pulse">Loading Feed...</div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center text-white p-8">
                <p className="mb-4">No content found.</p>
                <button onClick={() => router.push('/talent')} className="px-6 py-2 bg-white text-black rounded-full font-semibold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="relative h-[100dvh] w-full bg-black">
            {toastMsg && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-6 py-3 rounded-full backdrop-blur-md animate-in fade-in slide-in-from-top-5 pointer-events-none font-semibold text-sm whitespace-nowrap shadow-xl">
                    {toastMsg}
                </div>
            )}
            {/* Top Bar Navigation */}
            <div className="absolute top-0 left-0 right-0 p-4 z-50 flex items-center bg-gradient-to-b from-black/80 to-transparent">
                <button 
                    onClick={() => router.push('/talent')}
                    className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Swipable Feed */}
            <div className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {cards.map(card => (
                    <FeedItem key={card.id || card.title} card={card} showToast={showToast} />
                ))}
            </div>
        </div>
    );
}
