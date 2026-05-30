'use client';

import { ChevronDown } from 'lucide-react';

export type CategorySelectProps = {
    value: string | null;
    onChange: (value: string) => void;
};

const categories = [
    'Music / Songs',
    'Football Freestyle',
    'Basketball Freestyle',
    'Comedy Skits',
    'Artwork (Handmade Only)',
    'Fashion Showcase',
    'My Nigeria Story',
    'Photography',
    'Tech Innovation',
    'Logo Design'
] as const;

export default function CategorySelect({ value, onChange }: CategorySelectProps) {
    return (
        <div className='relative'>
            <select
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value)}
                className='w-full appearance-none rounded-md border border-[#D0D0D0] bg-white px-4 py-2.5 pr-10 text-sm focus:border-[#1A3C2E] focus:outline-none'>
                <option value='' disabled>
                    Select a category
                </option>
                {categories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>
            <ChevronDown className='pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
        </div>
    );
}
