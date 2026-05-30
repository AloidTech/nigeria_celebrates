import type { LucideIcon } from 'lucide-react';

export type ChampionCardProps = {
    name: string;
    tagline: string;
    rank: string;
    tone: string;
    accent: string;
    icon: LucideIcon;
};

export default function ChampionCard({ name, tagline, rank, tone, accent, icon: Icon }: ChampionCardProps) {
    return (
        <article className='min-w-41.25 max-w-41.25 overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:min-w-47.5 sm:max-w-47.5'>
            <div className={`relative aspect-3/4 overflow-hidden bg-linear-to-br ${tone}`}>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.65),transparent_28%),radial-gradient(circle_at_65%_35%,rgba(255,255,255,0.18),transparent_22%),linear-gradient(to_bottom,rgba(0,0,0,0.06),rgba(0,0,0,0.38))]' />
                <div className='absolute left-4 top-4 rounded-full bg-[#d4a017] px-2 py-1 text-[11px] font-medium text-[#1a1a1a] shadow-sm'>⭐ Gold Badge</div>
                <div className='absolute inset-x-0 bottom-0 flex items-end justify-center'>
                    <div className='mb-5 flex h-28 w-28 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm'>
                        <Icon className='h-14 w-14 text-white/90' strokeWidth={1.7} />
                    </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${accent}`} />
            </div>
            <div className='flex items-end justify-between gap-3 px-3 py-3.5'>
                <div className='min-w-0'>
                    <h3 className='truncate text-base font-bold text-[#1a1a1a]'>{name}</h3>
                    <p className='truncate text-xs text-[#666666]'>{tagline}</p>
                </div>
                <span className='shrink-0 rounded-full bg-[#f0f4ef] px-2.5 py-1 text-xs font-semibold text-[#1a3c2e]'>{rank}</span>
            </div>
        </article>
    );
}
