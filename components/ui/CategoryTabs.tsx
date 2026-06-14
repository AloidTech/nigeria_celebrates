'use client';

import { useMemo, useState } from 'react';
import { Video, Image, FileText, Paintbrush } from 'lucide-react';
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
                            {videos.map((card) => (
                                <TalentCard key={card.id || card.title} {...card} />
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
        </div>
    );
}
