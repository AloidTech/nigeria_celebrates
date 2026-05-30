import { Image as ImageIcon, Music2, Pencil, Trash2, Video } from 'lucide-react';

type UploadHistoryCardProps = {
    id: string;
    title: string;
    category: string;
    votes: number;
    maxVotes: number;
    timestamp: string;
    status: 'live' | 'under_review' | 'rejected';
};

function getCategoryIcon(category: string) {
    const normalizedCategory = category.toLowerCase();

    if (normalizedCategory.includes('music') || normalizedCategory.includes('freestyle')) {
        return <Music2 className='h-8 w-8 text-[#1A3C2E]' />;
    }

    if (normalizedCategory.includes('video') || normalizedCategory.includes('film')) {
        return <Video className='h-8 w-8 text-[#1A3C2E]' />;
    }

    return <ImageIcon className='h-8 w-8 text-[#1A3C2E]' />;
}

function getStatusClasses(status: UploadHistoryCardProps['status']) {
    switch (status) {
        case 'live':
            return 'bg-green-100 text-green-700';
        case 'under_review':
            return 'bg-yellow-100 text-yellow-700';
        case 'rejected':
            return 'bg-red-100 text-red-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

function getStatusLabel(status: UploadHistoryCardProps['status']) {
    switch (status) {
        case 'under_review':
            return 'Under Review';
        case 'rejected':
            return 'Rejected';
        case 'live':
        default:
            return 'Live';
    }
}

export default function UploadHistoryCard({ id, title, category, votes, maxVotes, timestamp, status }: UploadHistoryCardProps) {
    const progressPercent = Math.min(100, Math.round((votes / maxVotes) * 100));

    return (
        <article data-upload-id={id} className='flex items-center gap-5 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm'>
            <div className='flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-[#EEF4F0]'>{getCategoryIcon(category)}</div>

            <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-2'>
                    <span className='rounded-full bg-[#EEF4F0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1A3C2E]'>{category}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusClasses(status)}`}>{getStatusLabel(status)}</span>
                </div>

                <h3 className='mt-1.5 truncate text-sm font-semibold text-[#1A1A1A]'>{title}</h3>
                <p className='mt-0.5 text-xs text-gray-400'>{timestamp}</p>

                <div className='mt-3'>
                    <div className='mb-1 flex items-center justify-between gap-3'>
                        <p className='text-xs text-gray-500'>{votes} votes</p>
                        <p className='text-xs text-gray-400'>{progressPercent}% of top</p>
                    </div>
                    <div className='h-1.5 w-full rounded-full bg-[#E5E5E5]'>
                        <div className='h-full rounded-full bg-[#D4A017]' style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>
            </div>

            <div className='flex shrink-0 flex-col gap-2'>
                <button
                    type='button'
                    className='inline-flex items-center justify-center gap-1.5 rounded-md border border-[#E5E5E5] px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#1A3C2E] hover:text-[#1A3C2E]'>
                    <Pencil className='h-3 w-3' />
                    Edit
                </button>
                <button
                    type='button'
                    className='inline-flex items-center justify-center gap-1.5 rounded-md border border-[#E5E5E5] px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:border-red-300 hover:text-red-500'>
                    <Trash2 className='h-3 w-3' />
                    Delete
                </button>
            </div>
        </article>
    );
}
