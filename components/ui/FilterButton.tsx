import type { LucideIcon } from 'lucide-react';

export type FilterButtonProps = {
    label: string;
    icon: LucideIcon;
};

export default function FilterButton({ label, icon: Icon }: FilterButtonProps) {
    return (
        <button
            type='button'
            className='inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#1a1a1a] transition hover:bg-[#fafaf8]'>
            <Icon className='h-4 w-4 text-[#1a1a1a]' strokeWidth={2} />
            <span>{label}</span>
        </button>
    );
}
