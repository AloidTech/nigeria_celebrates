import type { LucideIcon } from 'lucide-react';

export type TalentGridTileProps = {
    label: string;
    icon: LucideIcon;
};

export default function TalentGridTile({ label, icon: Icon }: TalentGridTileProps) {
    return (
        <div className='flex h-25 flex-col items-center justify-center gap-2 rounded-xl border border-[#ece8dd] bg-white px-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'>
            <Icon className='h-6 w-6 text-[#1a3c2e]' strokeWidth={1.8} />
            <span className='text-sm leading-tight text-gray-700'>{label}</span>
        </div>
    );
}
