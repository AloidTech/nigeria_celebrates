'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { Video, Image, FileText, Paintbrush, X } from 'lucide-react';
import TalentCard, { type TalentCardProps } from '@/components/ui/TalentCard';

export type CategoryTabsProps = {
    cards: TalentCardProps[];
};

const tabs = ['All Talents', 'Music / Songs', 'Football Freestyle', 'Basketball Freestyle', 'Comedy Skits', 'Artwork (Handmade Only)'] as const;

const tabToCategory: Record<(typeof tabs)[number], string | null> = {
    'All Talents': null,
    'Music / Songs': 'MUSIC',
    'Football Freestyle': 'FREESTYLE',
    'Basketball Freestyle': 'FREESTYLE',
    'Comedy Skits': 'COMEDY',
    'Artwork (Handmade Only)': 'ARTWORK'
};

export default function CategoryTabs({ cards }: CategoryTabsProps) {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('All Talents');
    const [activeVideoIndex, setActiveVideoIndex] = useState<number>(-1);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const visibleCards = useMemo(() => {
        const targetCategory = tabToCategory[activeTab];

        if (!targetCategory) {
            return cards;
        }

        return cards.filter((card) => card.category === targetCategory);
    }, [activeTab, cards]);

    const groupedCards = useMemo(() => {
        const videos: TalentCardProps[] = [];
        const images: TalentCardProps[] = [];
        const others: TalentCardProps[] = [];

        visibleCards.forEach((card) => {
            const url = card.mediaUrl;
            if (!url) {
                // Classify based on category as a fallback if no URL exists
                if (card.category === 'MUSIC' || card.category === 'FREESTYLE' || card.category === 'COMEDY') {
                    videos.push(card);
                } else if (card.category === 'ARTWORK' || card.category === 'FASHION') {
                    images.push(card);
                } else {
                    others.push(card);
                }
                return;
            }

            const cleanUrl = url.split('?')[0].toLowerCase();
            if (cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|svg|heic)$/)) {
                images.push(card);
            } else if (cleanUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv|3gp)$/)) {
                videos.push(card);
            } else {
                others.push(card);
            }
        });

        return { videos, images, others };
    }, [visibleCards]);

    const { videos, images, others } = groupedCards;

    useEffect(() => {
        if (activeVideoIndex !== -1 && scrollContainerRef.current) {
            const children = scrollContainerRef.current.children;
            // The first child is the Close button, so index idx is at child idx + 1
            const targetElement = children[activeVideoIndex + 1] as HTMLElement;
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'auto' });
            }
        }
    }, [activeVideoIndex]);

    useEffect(() => {
        if (activeVideoIndex !== -1) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [activeVideoIndex]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const index = Math.round(container.scrollTop / window.innerHeight);
        if (index >= 0 && index < videos.length && index !== activeVideoIndex) {
            setActiveVideoIndex(index);
        }
    };

    return (
        <div>
            <div className='flex gap-6 overflow-x-auto px-4 py-4 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                {tabs.map((tab) => {
                    const isActive = tab === activeTab;

                    return (
                        <button
                            key={tab}
                            type='button'
                            onClick={() => setActiveTab(tab)}
                            className={
                                isActive
                                    ? 'rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5'
                                    : 'cursor-pointer bg-transparent px-0 py-2 text-sm text-gray-500 transition hover:text-[#1A3C2E] flex items-center gap-1.5'
                            }>
                            {tab === 'Artwork (Handmade Only)' && <Paintbrush className="h-4 w-4 text-[#8B7355]" />}
                            <span>{tab}</span>
                        </button>
                    );
                })}
            </div>

            <div className="space-y-10 pb-12">
                {videos.length > 0 && (
                    <div>
                        <div className="px-4 sm:px-8 border-b border-black/5 pb-2 mb-6">
                            <h2 className='text-xl font-bold text-[#1A3C2E] flex items-center gap-2'>
                                <Video className="h-5 w-5" /> Videos
                                <span className="text-xs bg-emerald-100 text-[#1A3C2E] px-2 py-0.5 rounded-full font-semibold">
                                    {videos.length}
                                </span>
                            </h2>
                        </div>
                        <div className='grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 xl:grid-cols-4'>
                            {videos.map((card, idx) => (
                                <TalentCard 
                                    key={card.id || card.title} 
                                    {...card} 
                                    onVideoClick={() => setActiveVideoIndex(idx)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {images.length > 0 && (
                    <div>
                        <div className="px-4 sm:px-8 border-b border-black/5 pb-2 mb-6">
                            <h2 className='text-xl font-bold text-[#1A3C2E] flex items-center gap-2'>
                                <Image className="h-5 w-5" /> Images & Graphics
                                <span className="text-xs bg-emerald-100 text-[#1A3C2E] px-2 py-0.5 rounded-full font-semibold">
                                    {images.length}
                                </span>
                            </h2>
                        </div>
                        <div className='grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 xl:grid-cols-4'>
                            {images.map((card) => (
                                <TalentCard key={card.id || card.title} {...card} />
                            ))}
                        </div>
                    </div>
                )}

                {others.length > 0 && (
                    <div>
                        <div className="px-4 sm:px-8 border-b border-black/5 pb-2 mb-6">
                            <h2 className='text-xl font-bold text-[#1A3C2E] flex items-center gap-2'>
                                <FileText className="h-5 w-5" /> Other File Types
                                <span className="text-xs bg-emerald-100 text-[#1A3C2E] px-2 py-0.5 rounded-full font-semibold">
                                    {others.length}
                                </span>
                            </h2>
                        </div>
                        <div className='grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 xl:grid-cols-4'>
                            {others.map((card) => (
                                <TalentCard key={card.id || card.title} {...card} />
                            ))}
                        </div>
                    </div>
                )}

                {videos.length === 0 && images.length === 0 && others.length === 0 && (
                    <div className="text-center py-12 text-gray-500 text-sm">
                        No submissions found in this category.
                    </div>
                )}
            </div>

            {/* Full-Screen YouTube Shorts Style Video Slide Viewer */}
            {activeVideoIndex !== -1 && (
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="fixed inset-0 z-50 bg-black overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
                >
                    {/* Floating Close Button */}
                    <button 
                        onClick={() => setActiveVideoIndex(-1)}
                        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-sm"
                        aria-label="Close video feed"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {videos.map((video, idx) => (
                        <div 
                            key={`slide-${video.id || video.title}`}
                            className="w-screen h-screen snap-start flex flex-col items-center justify-center relative bg-black"
                        >
                            {/* Header */}
                            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-20 bg-gradient-to-b from-black/80 to-transparent">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B7355] bg-white px-2 py-0.5 rounded-full">{video.category}</span>
                                    <h4 className="text-base sm:text-lg font-bold mt-1.5 truncate max-w-md sm:max-w-xl">{video.title}</h4>
                                </div>
                            </div>

                            {/* Media Body */}
                            <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
                                {video.mediaUrl ? (
                                    <video 
                                        key={`shorts-video-${video.id || video.title}-${idx === activeVideoIndex}`}
                                        src={video.mediaUrl} 
                                        className="max-w-full max-h-[75vh] aspect-[9/16] object-cover rounded-lg shadow-2xl bg-black" 
                                        controls
                                        autoPlay={idx === activeVideoIndex}
                                        loop
                                        playsInline
                                    />
                                ) : (
                                    <div className="w-full aspect-[9/16] max-w-[340px] rounded-lg bg-gray-800 flex items-center justify-center text-white/50 text-sm">
                                        Video unavailable
                                    </div>
                                )}
                            </div>

                            {/* Footer Info details */}
                            {video.description && (
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/85 to-transparent text-white text-center max-w-2xl mx-auto pointer-events-none z-20">
                                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">{video.description}</p>
                                    {video.materials && (
                                        <div className="mt-2 text-[10px] sm:text-xs italic text-white/50 font-semibold uppercase tracking-wider">
                                            Materials used: {video.materials}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
