import Link from 'next/link';

type ArenaSectionHeaderProps = {
    title: string;
    subtitle: string;
    actionLabel?: string;
    actionHref?: string;
};

export default function ArenaSectionHeader({ title, subtitle, actionLabel, actionHref }: ArenaSectionHeaderProps) {
    return (
        <div className='mb-6 flex items-end justify-between gap-4'>
            <div>
                <h2 className='text-xl font-bold text-[#1A1A1A]'>{title}</h2>
                <p className='mt-0.5 text-sm text-gray-500'>{subtitle}</p>
            </div>
            {actionLabel && actionHref ? (
                <Link href={actionHref} className='text-sm font-medium text-[#1A3C2E] transition hover:underline'>
                    {actionLabel}
                </Link>
            ) : null}
        </div>
    );
}
