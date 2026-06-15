import type { LucideIcon } from 'lucide-react';

export type ChampionCardProps = {
    name: string;
    tagline: string;
    rank: string;
    tone: string;
    accent: string;
    icon: LucideIcon;
    avatarUrl?: string | null;
};

export default function ChampionCard({ name, tagline, rank, tone, accent, icon: Icon, avatarUrl }: ChampionCardProps) {
    return (
        <article className='min-w-41.25 max-w-41.25 overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:min-w-47.5 sm:max-w-47.5 border border-black/5 transition-transform hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]'>
            <div className={`relative aspect-3/4 overflow-hidden bg-linear-to-br ${tone}`}>
                {avatarUrl && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-40 blur-md scale-110 mix-blend-overlay"
                        style={{ backgroundImage: `url(${avatarUrl})` }}
                    />
                )}
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.65),transparent_28%),radial-gradient(circle_at_65%_35%,rgba(255,255,255,0.18),transparent_22%),linear-gradient(to_bottom,rgba(0,0,0,0.06),rgba(0,0,0,0.38))]' />
                <div className='absolute left-3 top-3 rounded-full bg-[#d4a017] px-2.5 py-1 text-[10px] font-black tracking-wider uppercase text-[#1a1a1a] shadow-sm flex items-center gap-1.5'>
                    ⭐ <span>#1 Champion</span>
                </div>
                <div className='absolute inset-x-0 bottom-0 flex items-end justify-center pb-6'>
                    {avatarUrl ? (
                        <div className={`relative flex h-20 w-20 items-center justify-center rounded-full border-[3px] shadow-xl border-white bg-white overflow-hidden`}>
                            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                            <div className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full ${accent} text-white border-2 border-white shadow-sm`}>
                                <Icon className='h-3.5 w-3.5' strokeWidth={2.5} />
                            </div>
                        </div>
                    ) : (
                        <div className={`mb-2 flex h-20 w-20 items-center justify-center rounded-full border-[3px] shadow-lg border-white/40 bg-white/10 backdrop-blur-md`}>
                            <Icon className='h-10 w-10 text-white' strokeWidth={1.5} />
                        </div>
                    )}
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${accent}`} />
            </div>
            <div className='flex flex-col items-center justify-center gap-0.5 px-3 py-4 text-center bg-white'>
                <h3 className='truncate w-full text-base font-black text-[#1a1a1a] tracking-tight'>{name}</h3>
                <p className='truncate w-full text-[10px] font-bold uppercase tracking-widest text-[#888888]'>{tagline}</p>
            </div>
        </article>
    );
}
