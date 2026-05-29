import type { ReactNode } from 'react';

type ArenaSummaryCardProps = {
    label: string;
    value: string | number;
    sublabel: string;
    icon: ReactNode;
    variant?: 'dark' | 'light';
};

export default function ArenaSummaryCard({ label, value, sublabel, icon, variant = 'light' }: ArenaSummaryCardProps) {
    const isDark = variant === 'dark';

    return (
        <div className={isDark ? 'rounded-xl bg-[#1A3C2E] p-6 text-white' : 'rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm'}>
            <div className={isDark ? 'mb-4 text-white/80 [&_svg]:h-8 [&_svg]:w-8' : 'mb-4 text-[#1A3C2E] [&_svg]:h-8 [&_svg]:w-8'}>{icon}</div>
            <div className={isDark ? 'text-4xl font-bold text-white' : 'text-4xl font-bold text-[#1A1A1A]'}>{value}</div>
            <div className={isDark ? 'mt-1 text-sm text-white/70' : 'mt-1 text-sm text-gray-500'}>{label}</div>
            <div className={isDark ? 'mt-2 text-xs text-white/50' : 'mt-2 text-xs text-gray-400'}>{sublabel}</div>
        </div>
    );
}
