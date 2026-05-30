export type LiveBadgeProps = {
    label?: string;
};

export default function LiveBadge({ label = 'Live Submissions' }: LiveBadgeProps) {
    return (
        <div className='mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#E8F0EB] px-3 py-1 text-xs font-medium text-[#1A3C2E]'>
            <span className='h-2 w-2 rounded-full bg-[#1A3C2E]' />
            <span>{label}</span>
        </div>
    );
}
