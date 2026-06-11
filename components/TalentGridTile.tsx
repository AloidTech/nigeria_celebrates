import type { LucideIcon } from 'lucide-react';

export type TalentGridTileProps = {
    label: string;
    icon: LucideIcon;
    isSelected?: boolean; // New: Let the tile know if it's the active one
    onClick?: () => void; // New: Pass a click handler down from the parent grid
};

export default function TalentGridTile({ label, icon: Icon, isSelected = false, onClick }: TalentGridTileProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex h-25 w-full flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center shadow-sm transition outline-none
                ${isSelected 
                    ? 'border-[#1a3c2e] bg-[#e4efe8] ring-2 ring-[#1a3c2e]/20 -translate-y-0.5 shadow-md' 
                    : 'border-[#ece8dd] bg-white hover:-translate-y-0.5 hover:shadow-md hover:bg-gray-50'
                }`}
        >
            <Icon 
                className={`h-6 w-6 transition-colors duration-200 ${isSelected ? 'text-[#1a3c2e]' : 'text-[#4a5568]'}`} 
                strokeWidth={1.8} 
            />
            <span className={`text-sm leading-tight font-medium transition-colors duration-200 ${isSelected ? 'text-[#1a3c2e]' : 'text-gray-700'}`}>
                {label}
            </span>
        </button>
    );
}