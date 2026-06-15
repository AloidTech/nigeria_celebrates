'use client';

import Link from 'next/link';
import { Play, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { supabase } from '@/supabase'; // Adjust this path if your supabase.ts is somewhere else

import CategorySelect from '@/components/ui/CategorySelect';
import FormField from '@/components/ui/FormField';
import StepIndicator from '@/components/ui/StepIndicator';
import UploadDropzone from '@/components/ui/UploadDropzone';

export default function UploadPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileSelect = useCallback((selectedFile: File) => {
        setFile(selectedFile);
    }, []);

    const handleClearFile = useCallback(() => {
        setFile(null);
    }, []);

    const handleSubmit = async () => {
        if (!file || !title || !selectedCategory || !description) {
            alert("Please fill in all fields and select a file.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("You must be logged in to submit.");
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('category', selectedCategory);
            formData.append('description', description);

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to upload file");
            }

            alert("Submission successful! It is now pending admin approval.");
            
            // Reset form
            setTitle('');
            setDescription('');
            setFile(null);
            setSelectedCategory(null);
            
        } catch (error: any) {
            console.error("Upload failed:", error);
            alert("Upload failed: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className='min-h-screen pb-10 bg-[#F5F5F0] text-[#1A1A1A]'>
            <div className='mx-auto w-full max-w-3xl'>
                <section className='px-8 pb-6 pt-10'>
                    <h1 className='text-4xl font-bold text-[#1A1A1A]'>Show the World Your Talent</h1>
                    <p className='mt-2 max-w-lg text-sm text-gray-600'>
                        Upload your entry for the{' '}
                        <Link href='/sign-in' className='text-[#1A3C2E] underline transition hover:opacity-80'>
                            Naija Talent Zone Submission.
                        </Link>{' '}
                        Your journey to the global arena starts here.
                    </p>
                </section>

                <StepIndicator currentStep={1} />

                <section className='mx-auto mt-4 max-w-2xl rounded-xl bg-white p-8 shadow-sm'>
                    <div className='mb-8'>
                        <FormField label='Select Category'>
                            <CategorySelect value={selectedCategory} onChange={setSelectedCategory} />
                        </FormField>
                    </div>

                    <div className='text-xs font-bold uppercase tracking-widest text-[#1A3C2E] mb-3'>UPLOAD YOUR MEDIA</div>
                    <div>
                        {/* Make sure your UploadDropzone component accepts an onFileSelect prop! */}
                        <UploadDropzone 
                            key={selectedCategory ?? 'none'} 
                            selectedCategory={selectedCategory} 
                            onFileSelect={handleFileSelect}
                            onClearFile={handleClearFile}
                        />
                    </div>

                    <div className='mt-8 flex flex-col sm:flex-row gap-6'>
                        <div className='flex-1 space-y-6'>
                            <FormField label='Submission Title'>
                                <input
                                    type='text'
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder='Give your talent a name...'
                                    className='w-full rounded-md border border-[#D0D0D0] px-4 py-2.5 text-sm focus:border-[#1A3C2E] focus:outline-none'
                                />
                            </FormField>
                            <FormField label='Short Description'>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder='Tell the judges about your creative process...'
                                    className='min-h-[120px] w-full resize-none rounded-md border border-[#D0D0D0] px-4 py-3 text-sm focus:border-[#1A3C2E] focus:outline-none'
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className='mt-8 flex items-center justify-end gap-4'>
                        <button type='button' className='cursor-pointer text-sm text-gray-500 transition hover:text-[#1A1A1A]'>
                            Cancel Submission
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            type='button'
                            className='inline-flex items-center gap-2 rounded-md bg-[#1A3C2E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#142e23] disabled:opacity-70'
                        >
                            {isSubmitting ? (
                                <>Uploading... <Loader2 className="h-4 w-4 animate-spin" /></>
                            ) : (
                                <>Submit to the Arena <Play className='h-4 w-4 fill-current' /></>
                            )}
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}
