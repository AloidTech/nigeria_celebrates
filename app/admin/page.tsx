'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { Check, Loader2, Shield, Eye, AlertCircle } from 'lucide-react';

export default function AdminPage() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const fetchPending = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('submissions')
            .select('*')
            .eq('is_approved', false)
            .order('created_at', { ascending: false });
        if (data) setSubmissions(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id: string) => {
        setApprovingId(id);
        try {
            const { error } = await supabase
                .from('submissions')
                .update({ is_approved: true })
                .eq('id', id);

            if (error) throw error;
            
            // Remove from local list instantly for an ultra-smooth transition
            setSubmissions(prev => prev.filter(sub => sub.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to approve submission.');
        } finally {
            setApprovingId(null);
        }
    };

    return (
        <main className='min-h-screen pb-10 bg-[#F5F5F0] text-[#1A1A1A]'>
            <div className='mx-auto w-full max-w-3xl'>
                
                {/* Header Section matching Upload layout */}
                <section className='px-8 pb-6 pt-10'>
                    <div className='flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A3C2E] mb-2'>
                        <Shield className='h-4 w-4' /> Admin Control Panel
                    </div>
                    <h1 className='text-4xl font-bold text-[#1A1A1A]'>Arena Submissions</h1>
                    <p className='mt-2 max-w-lg text-sm text-gray-600'>
                        Review and moderate incoming talent entries. Once approved, files will be pushed live directly onto the public showcase feed.
                    </p>
                </section>

                {/* Submissions Content Stream */}
                <section className='px-8 mt-4'>
                    {loading ? (
                        <div className='flex flex-col items-center justify-center p-12 rounded-xl bg-white shadow-sm min-h-40 border border-gray-100'>
                            <Loader2 className='h-8 w-8 animate-spin text-[#1A3C2E]' />
                            <p className='mt-3 text-sm font-medium text-gray-500'>Fetching pending arena entries...</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className='flex flex-col items-center justify-center p-12 text-center rounded-xl bg-white shadow-sm min-h-40 border border-dashed border-[#D0D0D0]'>
                            <div className='rounded-full bg-[#EEF4F0] p-3 text-[#1A3C2E] mb-3'>
                                <Check className='h-6 w-6' />
                            </div>
                            <p className='text-lg font-semibold text-[#1A1A1A]'>The queue is clear!</p>
                            <p className='text-sm text-gray-500 mt-1 max-w-xs'>All uploaded talents have been reviewed and safely moderated.</p>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {submissions.map((sub) => (
                                <div key={sub.id} className='rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center transition hover:shadow-md'>
                                    <div className='space-y-2 flex-1 w-full'>
                                        <div className='inline-block rounded bg-[#EEF4F0] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#1A3C2E]'>
                                            {sub.category || 'General'}
                                        </div>
                                        <h3 className='text-xl font-bold text-[#1A1A1A] tracking-tight'>{sub.title}</h3>
                                        <p className='text-sm text-gray-600 line-clamp-3 leading-relaxed'>{sub.description}</p>
                                        
                                        {sub.media_url && (
                                            <div className='pt-2'>
                                                <a 
                                                    href={sub.media_url} 
                                                    target='_blank' 
                                                    rel='noreferrer' 
                                                    className='inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A3C2E] underline transition hover:opacity-80'
                                                >
                                                    <Eye className='h-3.5 w-3.5' /> View Uploaded File Asset
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className='w-full md:w-auto pt-2 md:pt-0 border-t border-gray-100 md:border-none'>
                                        <button
                                            onClick={() => handleApprove(sub.id)}
                                            disabled={approvingId === sub.id}
                                            className='w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#1A3C2E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#142e23] disabled:opacity-70 whitespace-nowrap shadow-sm cursor-pointer'
                                        >
                                            {approvingId === sub.id ? (
                                                <>Pushing Live... <Loader2 className='h-4 w-4 animate-spin' /></>
                                            ) : (
                                                <>Approve to Feed <Check className='h-4 w-4' /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}