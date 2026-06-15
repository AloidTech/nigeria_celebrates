'use client';

import { useMemo, useState } from 'react';
import { Music, Video, Image as ImageIcon } from 'lucide-react';
import TalentCard, { type TalentCardProps } from '@/components/ui/TalentCard';

export type CategoryTabsProps = {
    cards: TalentCardProps[];
};

const tabs = [
    'All Talents',
    'Music / Songs',
    'Football Freestyle',
    'Basketball Freestyle',
    'Comedy Skits',
    'Artwork',
    'Hair Artistry',
    'Fashion Showcase',
    'My Nigeria Story (Short Film)',
    'Photography',
    'Tech Innovation',
    'Logo Design'
] as const;

const tabToCategory: Record<(typeof tabs)[number], string | null> = {
    'All Talents': null,
    'Music / Songs': 'Music / Songs',
    'Football Freestyle': 'Football Freestyle',
    'Basketball Freestyle': 'Basketball Freestyle',
    'Comedy Skits': 'Comedy Skits',
    'Artwork': 'Artwork',
    'Hair Artistry': 'Hair Artistry',
    'Fashion Showcase': 'Fashion Showcase',
    'My Nigeria Story (Short Film)': 'My Nigeria Story (Short Film)',
    'Photography': 'Photography',
    'Tech Innovation': 'Tech Innovation',
    'Logo Design': 'Logo Design'
};

function getMediaType(url: string | null | undefined, category: string) {
    if (category === 'Music / Songs') return 'music'; // Force music category into music shelf
    if (!url) return 'unknown';
    if (/\.(mp4|webm|ogg|mov)$/i.test(url)) return 'video';
    if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || url.includes('images.unsplash.com') || url.includes('image/upload')) return 'image';
    return 'unknown';
}

export default function CategoryTabs({ cards }: CategoryTabsProps) {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('All Talents');

    const visibleCards = useMemo(() => {
        const targetCategory = tabToCategory[activeTab];

        if (!targetCategory) {
            return cards;
        }

        return cards.filter((card) => card.category === targetCategory);
    }, [activeTab, cards]);

    const { musicCards, videoCards, pictureCards } = useMemo(() => {
        const musicCards: TalentCardProps[] = [];
        const videoCards: TalentCardProps[] = [];
        const pictureCards: TalentCardProps[] = [];
        
        visibleCards.forEach(card => {
            const type = getMediaType(card.media_url, card.category);
            if (type === 'music') musicCards.push(card);
            else if (type === 'video') videoCards.push(card);
            else if (type === 'image') pictureCards.push(card);
            else videoCards.push(card); // fallback unknowns to video shelf
        });
        
        return { musicCards, videoCards, pictureCards };
    }, [visibleCards]);

    const renderCarousel = (title: string, items: TalentCardProps[], icon: React.ReactNode) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-10 w-full max-w-full overflow-hidden">
                <h2 className="flex items-center gap-2 text-xl font-bold text-[#1A3C2E] mb-4 px-4 sm:px-8">
                    {icon} {title}
                </h2>
                <div className="flex gap-4 overflow-x-auto px-4 sm:px-8 pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {items.map((card) => (
                        <div key={card.id || card.title} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
                            <TalentCard {...card} />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Improved Tab UI */}
            <div className='flex gap-3 overflow-x-auto px-4 py-4 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                {tabs.map((tab) => {
                    const isActive = tab === activeTab;

                    return (
                        <button
                            key={tab}
                            type='button'
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
                                isActive
                                    ? 'bg-[#1A1A1A] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}>
                            {tab.includes('Artwork') ? '🤎 ' + tab : tab}
                        </button>
                    );
                })}
            </div>

            {/* Horizontal Carousels */}
            <div className='py-6'>
                {visibleCards.length === 0 ? (
                    <div className="px-4 sm:px-8 text-center text-gray-500 py-10">No talents found for this category yet.</div>
                ) : (
                    <>
                        {renderCarousel('Music', musicCards, <Music className="w-5 h-5" />)}
                        {renderCarousel('Videos', videoCards, <Video className="w-5 h-5" />)}
                        {renderCarousel('Pictures', pictureCards, <ImageIcon className="w-5 h-5" />)}
                    </>
                )}
            </div>
        </div>
    );
}
