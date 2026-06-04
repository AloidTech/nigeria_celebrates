'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function FeedPage() {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUploadedFiles() {
            // This lists out the files sitting inside your 'hackathon-uploads' bucket
            const { data, error } = await supabase.storage.from('hackathon-uploads').list('', {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' },
            });

            if (!error && data) {
                setFiles(data);
            }
            setLoading(false);
        }

        fetchUploadedFiles();
    }, []);

    return (
        <main className="min-h-screen bg-[#f7f9f6] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#1a3c2e] hover:underline mb-6">
                    <ArrowLeft className="h-4 w-4" /> Back to Submission Form
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Live Upload Feed</h1>
                <p className="text-sm text-gray-500 mb-6">Direct look into your Supabase Storage Bucket.</p>

                {loading ? (
                    <p className="text-sm text-gray-500">Scanning storage streams...</p>
                ) : files.length === 0 ? (
                    <p className="text-sm text-gray-500 bg-gray-50 p-6 rounded-xl border border-dashed text-center">
                        No assets found in storage yet. Go back and upload a test file!
                    </p>
                ) : (
                    <div className="space-y-3">
                        {files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-[#1a3c2e]" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                                        <p className="text-xs text-gray-400">Created: {new Date(file.created_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}