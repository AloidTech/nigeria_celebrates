'use client';

import Link from 'next/link';
import { Play, Loader2 } from 'lucide-react';
import { useState } from 'react';
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

    const handleSubmit = async () => {
        if (!file || !title || !selectedCategory || !description) {
            alert("Please fill in all fields and select a file.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Upload the file to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('celebration-uploads')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Get the public URL for the file
            const { data: publicUrlData } = supabase.storage
                .from('celebration-uploads')
                .getPublicUrl(fileName);

            // 3. Save everything to the database (defaults to is_approved: false)
            const { error: dbError } = await supabase
                .from('submissions')
                .insert({
                    title,
                    category: selectedCategory,
                    description,
                    media_url: publicUrlData.publicUrl,
                    is_approved: false // Admin approval gate!
                });

            if (dbError) throw dbError;

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
                    <div className='text-xs font-bold uppercase tracking-widest text-[#1A3C2E]'>STEP 1: UPLOAD YOUR MEDIA</div>
                    <div className='mt-3'>
                        {/* Make sure your UploadDropzone component accepts an onFileSelect prop! */}
                        <UploadDropzone 
                            key={selectedCategory ?? 'none'} 
                            selectedCategory={selectedCategory} 
                            onFileSelect={(selectedFile: File) => setFile(selectedFile)}
                        />
                    </div>

                    <div className='mt-6 grid grid-cols-2 gap-4'>
                        <div className='space-y-4'>
                            <FormField label='Submission Title'>
                                <input
                                    type='text'
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder='Give your talent a name...'
                                    className='w-full rounded-md border border-[#D0D0D0] px-4 py-2.5 text-sm focus:border-[#1A3C2E] focus:outline-none'
                                />
                            </FormField>

                            <FormField label='Category'>
                                <CategorySelect value={selectedCategory} onChange={setSelectedCategory} />
                            </FormField>
                        </div>

                        <FormField label='Short Description'>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder='Tell the judges about your creative process...'
                                className='min-h-[132px] w-full resize-none rounded-md border border-[#D0D0D0] px-4 py-3 text-sm focus:border-[#1A3C2E] focus:outline-none'
                            />
                        </FormField>
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
