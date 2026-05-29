export type VoteCardProps = {
    category: string;
    name: string;
    description: string;
    votes: string;
    progress: string;
};

export default function VoteCard({ category, name, description, votes, progress }: VoteCardProps) {
    return (
        <article className='flex overflow-hidden rounded-xl bg-white shadow-md'>
            <div className='w-1/2 shrink-0 bg-gray-300'>
                {/* Media section */}
                <div className='h-full min-h-87.5 w-full bg-[linear-gradient(180deg,rgba(26,60,46,0.18),rgba(0,0,0,0.1)),radial-gradient(circle_at_30%_20%,rgba(212,160,23,0.35),transparent_28%),radial-gradient(circle_at_70%_30%,rgba(26,60,46,0.3),transparent_24%)]' />
            </div>
            <div className='flex min-w-0 flex-1 flex-col justify-between p-6'>
                <div>
                    <div className='mb-3 w-fit rounded-full bg-[#F0F0EC] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500'>{category}</div>
                    <h3 className='text-2xl font-bold leading-tight text-[#1A1A1A]'>{name}</h3>
                    <p className='mt-2 line-clamp-3 text-sm text-gray-500'>{description}</p>
                </div>
                <div className='mt-4'>
                    <div className='text-sm text-gray-500'>{votes} Votes</div>
                    <div className='mt-2 h-1 w-full max-w-20 rounded-full bg-[#E9E4D0]'>
                        <div className='h-full rounded-full bg-[#D4A017]' style={{ width: progress }} />
                    </div>
                    <button type='button' className='mt-3 w-full rounded-md bg-[#1A3C2E] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#142e23]'>
                        Vote Now
                    </button>
                </div>
            </div>
        </article>
    );
}
