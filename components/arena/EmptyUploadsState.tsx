import Link from 'next/link';
import { UploadCloud } from 'lucide-react';

export default function EmptyUploadsState() {
    return (
        <div className='flex flex-col items-center gap-4 py-16 text-center'>
            <UploadCloud className='h-16 w-16 text-gray-300' />
            <div>
                <p className='text-lg font-semibold text-gray-400'>No uploads yet</p>
                <p className='mt-1 text-sm text-gray-400'>Start sharing your talent with Nigeria and the world.</p>
            </div>
            <Link href='/upload' className='mt-2 rounded-md bg-[#1A3C2E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#142e23]'>
                Upload Your First Talent
            </Link>
        </div>
    );
}
