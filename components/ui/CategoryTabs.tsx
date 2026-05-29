'use client';

import { useMemo, useState } from 'react';

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

    return (
        <div>
            <div className='flex gap-6 overflow-x-auto px-8 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                {tabs.map((tab) => {
                    const isActive = tab === activeTab;

                    return (
                        <button
                            key={tab}
                            type='button'
                            onClick={() => setActiveTab(tab)}
                            className={
                                isActive
                                    ? 'rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#1A1A1A]'
                                    : 'cursor-pointer bg-transparent px-0 py-2 text-sm text-gray-500 transition hover:text-[#1A3C2E]'
                            }>
                            {tab === 'Artwork (Handmade Only)' ? '🤎 Artwork (Handmade Only)' : tab}
                        </button>
                    );
                })}
            </div>

            <div className='grid grid-cols-1 gap-5 px-8 py-6 lg:grid-cols-4'>
                {visibleCards.map((card) => (
                    <TalentCard key={card.title} {...card} />
                ))}
            </div>
        </div>
    );
}
