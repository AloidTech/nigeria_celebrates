import { Suspense } from 'react';
import VerticalMediaFeed from '@/components/ui/VerticalMediaFeed';

export default function TalentViewerPage({ params }: { params: { id: string } }) {
    return (
        <div className="h-[100dvh] w-full bg-black overflow-hidden">
            <Suspense fallback={<div className="flex h-full items-center justify-center text-white">Loading feed...</div>}>
                <VerticalMediaFeed initialId={params.id} />
            </Suspense>
        </div>
    );
}
