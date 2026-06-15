'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { Loader2, ArrowLeft, Check, X, ShieldAlert } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function SubmissionDetails() {
    const router = useRouter();
    const params = useParams();
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);

    useEffect(() => {
        const fetchSubmission = async () => {
            if (!params.id) return;
            setLoading(true);
            const { data } = await supabase
                .from('submissions')
                .select('*')
                .eq('id', params.id)
                .single();
            
            if (data) setSubmission(data);
            setLoading(false);
        };
        fetchSubmission();
    }, [params.id]);

    const handleApprove = async () => {
        setActionLoading('approve');
        try {
            const { error } = await supabase
                .from('submissions')
                .update({ is_approved: true })
                .eq('id', submission.id);

            if (error) throw error;
            router.push('/admin');
        } catch (err) {
            console.error(err);
            alert('Failed to approve submission.');
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this submission?");
        if (!confirmDelete) return;

        setActionLoading('reject');
        try {
            // In a real app, you might also want to delete the file from Storage.
            const { error } = await supabase
                .from('submissions')
                .delete()
                .eq('id', submission.id);

            if (error) throw error;
            router.push('/admin');
        } catch (err) {
            console.error(err);
            alert('Failed to reject submission.');
            setActionLoading(null);
        }
    };

    const isImage = (url: string) => {
        return url?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;
    };

    if (loading) {
        return (
            <main className='min-h-screen p-6 md:p-10 bg-[#FAFAFA] flex items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
            </main>
        );
    }

    if (!submission) {
        return (
            <main className='min-h-screen p-6 md:p-10 bg-[#FAFAFA] flex flex-col items-center justify-center'>
                <ShieldAlert className='h-12 w-12 text-red-500 mb-4' />
                <h1 className='text-2xl font-bold text-[#1A1A1A]'>Submission Not Found</h1>
                <Link href="/admin" className='mt-4 text-blue-600 underline'>Return to Dashboard</Link>
            </main>
        );
    }

    return (
        <main className='min-h-screen p-6 md:p-10 bg-[#FAFAFA] text-[#1A1A1A]'>
            <div className='max-w-4xl mx-auto'>
                
                {/* Header */}
                <section className='mb-8 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <button onClick={() => router.back()} className='p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition'>
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className='text-2xl font-bold text-[#1A1A1A]'>Submission Details</h1>
                            <p className='text-sm text-gray-500 mt-1'>Review carefully before approving.</p>
                        </div>
                    </div>
                </section>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                    
                    {/* Media Viewer */}
                    <div className='md:col-span-2 bg-black rounded-3xl overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center min-h-[400px]'>
                        {submission.media_url ? (
                            isImage(submission.media_url) ? (
                                <img src={submission.media_url} alt="Submission" className='max-w-full max-h-[600px] object-contain' />
                            ) : (
                                <video src={submission.media_url} controls className='w-full max-h-[600px]' />
                            )
                        ) : (
                            <p className='text-gray-500'>No media attached.</p>
                        )}
                    </div>

                    {/* Meta & Actions Sidebar */}
                    <div className='space-y-6'>
                        <div className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm'>
                            <div className='inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-4'>
                                {submission.category || 'General'}
                            </div>
                            
                            <h2 className='text-xl font-bold text-[#1A1A1A] mb-2'>{submission.title}</h2>
                            <p className='text-sm text-gray-600 leading-relaxed mb-6'>{submission.description}</p>
                            
                            <div className='pt-6 border-t border-gray-100'>
                                <div className='text-xs text-gray-500 mb-1'>Submitted On</div>
                                <div className='text-sm font-medium text-gray-900'>
                                    {new Date(submission.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                            <div className='mt-4'>
                                <div className='text-xs text-gray-500 mb-1'>Status</div>
                                <div className='text-sm font-medium'>
                                    {submission.is_approved ? (
                                        <span className='text-green-600 font-bold'>Approved & Live</span>
                                    ) : (
                                        <span className='text-amber-600 font-bold'>Pending Review</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!submission.is_approved && (
                            <div className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-3'>
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading !== null}
                                    className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A3C2E] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#142e23] disabled:opacity-50'
                                >
                                    {actionLoading === 'approve' ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Check className="h-5 w-5" /> Approve Submission</>}
                                </button>
                                
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading !== null}
                                    className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 border border-red-100 px-5 py-3.5 text-sm font-semibold transition hover:bg-red-100 disabled:opacity-50'
                                >
                                    {actionLoading === 'reject' ? <Loader2 className="h-5 w-5 animate-spin" /> : <><X className="h-5 w-5" /> Reject & Delete</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}
