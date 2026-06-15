'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { Loader2, Video, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmissionsQueue() {
    const router = useRouter();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const fetchPending = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('submissions')
            .select('id, title, category, created_at, media_url')
            .eq('is_approved', false)
            .order('created_at', { ascending: false });
        if (data) setSubmissions(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent row click
        setApprovingId(id);
        try {
            const { error } = await supabase
                .from('submissions')
                .update({ is_approved: true })
                .eq('id', id);

            if (error) throw error;
            
            // Remove from local list instantly
            setSubmissions(prev => prev.filter(sub => sub.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to approve submission.');
        } finally {
            setApprovingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' });
    };

    const getIconForCategory = (category: string) => {
        if (category?.includes('Artwork') || category?.includes('Photography') || category?.includes('Logo')) {
            return <ImageIcon className="h-5 w-5 text-blue-500" />;
        }
        return <Video className="h-5 w-5 text-blue-600" />;
    };

    return (
        <main className='min-h-screen p-6 md:p-10 bg-[#FAFAFA] text-[#1A1A1A]'>
            <div className='max-w-6xl mx-auto'>
                
                <section className='mb-8 flex items-center gap-4'>
                    <Link href="/admin" className='p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition'>
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className='text-2xl font-bold text-[#1A1A1A]'>Full Submissions Queue</h1>
                        <p className='text-sm text-gray-500 mt-1'>Review all pending entries across all categories.</p>
                    </div>
                </section>

                <section className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden'>
                    {loading ? (
                        <div className='p-20 flex flex-col items-center justify-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
                            <p className='mt-4 text-sm font-medium text-gray-500'>Fetching full queue...</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className='p-20 text-center'>
                            <p className='text-lg font-semibold text-gray-800'>The queue is clear!</p>
                            <p className='text-sm text-gray-500 mt-2'>All uploaded talents have been reviewed and safely moderated.</p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left border-collapse'>
                                <thead>
                                    <tr className='text-xs font-semibold text-gray-500 border-b border-gray-100 bg-gray-50/50'>
                                        <th className='px-6 py-4 font-medium'>Name</th>
                                        <th className='px-6 py-4 font-medium'>Category</th>
                                        <th className='px-6 py-4 font-medium'>Submitted</th>
                                        <th className='px-6 py-4 font-medium text-right'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((sub) => (
                                        <tr 
                                            key={sub.id} 
                                            onClick={() => router.push(`/admin/submissions/${sub.id}`)}
                                            className='group border-b border-gray-50 hover:bg-gray-50/80 transition cursor-pointer'
                                        >
                                            <td className='px-6 py-4'>
                                                <div className='flex items-center gap-3'>
                                                    {getIconForCategory(sub.category)}
                                                    <span className='font-medium text-sm text-gray-900'>{sub.title}</span>
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-600'>
                                                <span className='inline-block px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700'>
                                                    {sub.category || 'General'}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-500'>
                                                {formatDate(sub.created_at)}
                                            </td>
                                            <td className='px-6 py-4 text-right'>
                                                <button
                                                    onClick={(e) => handleApprove(e, sub.id)}
                                                    disabled={approvingId === sub.id}
                                                    className='inline-flex items-center justify-center rounded-lg bg-[#EEF4F0] px-4 py-2 text-xs font-bold text-[#1A3C2E] transition hover:bg-[#1A3C2E] hover:text-white disabled:opacity-50 border border-[#1A3C2E]/20'
                                                >
                                                    {approvingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
