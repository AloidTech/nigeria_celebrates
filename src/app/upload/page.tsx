'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { useState } from 'react';

import CategorySelect from '@/components/ui/CategorySelect';
import FormField from '@/components/ui/FormField';
import StepIndicator from '@/components/ui/StepIndicator';
import UploadDropzone from '@/components/ui/UploadDropzone';

export default function UploadPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    return (
        <main className='min-h-screen pb-10 bg-[#F5F5F0] text-[#1A1A1A]'>
            <div className='mx-auto w-full max-w-3xl'>
                <section className='px-8 pb-6 pt-10'>
                    <h1 className='text-4xl font-bold text-[#1A1A1A]'>Show the World Your Talent</h1>
                    <p className='mt-2 max-w-lg text-sm text-gray-600'>
                        Upload your entry for the{' '}
                        <Link href='/arena' className='text-[#1A3C2E] underline transition hover:opacity-80'>
                            Naija Talent Zone Submission.
                        </Link>{' '}
                        Your journey to the global arena starts here.
                    </p>
                </section>

                <StepIndicator currentStep={1} />

                <section className='mx-auto mt-4 max-w-2xl rounded-xl bg-white p-8 shadow-sm'>
                    <div className='text-xs font-bold uppercase tracking-widest text-[#1A3C2E]'>STEP 1: UPLOAD YOUR MEDIA</div>
                    <div className='mt-3'>
                        <UploadDropzone key={selectedCategory ?? 'none'} selectedCategory={selectedCategory} />
                    </div>

                    <div className='mt-6 grid grid-cols-2 gap-4'>
                        <div className='space-y-4'>
                            <FormField label='Submission Title'>
                                <input
                                    type='text'
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
                                placeholder='Tell the judges about your creative process and why this represents Nigerian excellence...'
                                className='min-h-35 w-full resize-none rounded-md border border-[#D0D0D0] px-4 py-3 text-sm focus:border-[#1A3C2E] focus:outline-none'
                            />
                        </FormField>
                    </div>

                    <div className='mt-8 flex items-center justify-end gap-4'>
                        <button type='button' className='cursor-pointer text-sm text-gray-500 transition hover:text-[#1A1A1A]'>
                            Cancel Submission
                        </button>
                        <button
                            type='button'
                            className='inline-flex items-center gap-2 rounded-md bg-[#1A3C2E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#142e23]'>
                            Submit to the Arena
                            <Play className='h-4 w-4 fill-current' />
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}
