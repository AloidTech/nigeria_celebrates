'use client';

import { useState } from 'react';
import { supabase } from '@/supabase';
import { Code, Palette, Video, Presentation, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import StepIndicator from '@/components/StepIndicator';
import TalentGridTile from '@/components/TalentGridTile';
import UploadDropzone from '@/components/UploadDropzone';

export default function SubmitProjectWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Master state holding all multi-step data before the database write
    const [formData, setFormData] = useState({
        category: 'coding',
        fileUrl: '',
        fileName: '',
        projectTitle: '',
        description: '',
        materials: ''
    });

    const updateField = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Step 1: Triggered when file successfully reaches your Supabase Storage Bucket
    const handleUploadComplete = (url: string, name: string) => {
        setFormData(prev => ({ ...prev, fileUrl: url, fileName: name }));
        setCurrentStep(2); // Automatically transition indicator to Step 2
    };

    // Step 2 -> Step 3: Pushes the consolidated payload to the Supabase Database Table
    const handleFinalDatabaseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.projectTitle.trim() || !formData.description.trim()) {
            setErrorMessage('Project Title and Description are required.');
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const { error } = await supabase
                .from('talent_submissions')
                .insert([
                    {
                        category: formData.category,
                        file_url: formData.fileUrl,
                        file_name: formData.fileName,
                        title: formData.projectTitle,
                        description: formData.description,
                        materials: formData.materials || null,
                        votes: "0",
                        time: "Just now"
                    }
                ]);

            if (error) throw error;

            setCurrentStep(3); // Transition indicator to Step 3 (Review / Success)
        } catch (err: any) {
            console.error('Database save failed:', err);
            setErrorMessage(err.message || 'Failed to save project details.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* The Live Step Indicator controlled by state */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
                <StepIndicator currentStep={currentStep} />
            </div>

            {errorMessage && (
                <div className="p-4 rounded-xl text-sm border bg-red-50 border-red-200 text-red-700">
                    {errorMessage}
                </div>
            )}

            {/* STEP 1: MEDIA UPLOAD & TRACK SELECTION */}
            {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Submission Category</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <TalentGridTile 
                                label="Coding" 
                                icon={Code} 
                                isSelected={formData.category === 'coding'} 
                                onClick={() => updateField('category', 'coding')} 
                            />
                            <TalentGridTile 
                                label="Design" 
                                icon={Palette} 
                                isSelected={formData.category === 'design'} 
                                onClick={() => updateField('category', 'design')} 
                            />
                            <TalentGridTile 
                                label="Video" 
                                icon={Video} 
                                isSelected={formData.category === 'video'} 
                                onClick={() => updateField('category', 'video')} 
                            />
                            <TalentGridTile 
                                label="Presentation" 
                                icon={Presentation} 
                                isSelected={formData.category === 'presentation'} 
                                onClick={() => updateField('category', 'presentation')} 
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Deliverables</h2>
                        <UploadDropzone 
                            selectedCategory={formData.category} 
                            onUploadComplete={handleUploadComplete}
                        />
                    </div>
                </div>
            )}

            {/* STEP 2: METADATA & INFORMATION MANIFEST */}
            {currentStep === 2 && (
                <form onSubmit={handleFinalDatabaseSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 animate-fadeIn">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Project Details</h3>
                        <p className="text-xs text-gray-400">Enrich your submission record with descriptive parameters.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Project Name / Title</label>
                            <input 
                                type="text"
                                required
                                value={formData.projectTitle}
                                onChange={(e) => updateField('projectTitle', e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1A3C2E] transition"
                                placeholder="Give your work a clear title"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Materials Used</label>
                            <input 
                                type="text"
                                value={formData.materials}
                                onChange={(e) => updateField('materials', e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1A3C2E] transition"
                                placeholder="e.g., Next.js, Supabase, Tailwind CSS"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Solution Summary / Description</label>
                            <textarea 
                                rows={4}
                                required
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1A3C2E] transition resize-none"
                                placeholder="Explain what problem this submission addresses..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button 
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to file
                        </button>
                        
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 text-sm font-bold bg-[#1A3C2E] text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>Saving Record... <Loader2 className="h-4 w-4 animate-spin" /></>
                            ) : (
                                <>Save & Review <ArrowRight className="h-4 w-4" /></>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 3: SUBMISSION COMPLETED REVIEW GATE */}
            {currentStep === 3 && (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center space-y-4 animate-fadeIn">
                    <div className="mx-auto h-12 w-12 text-green-600 flex items-center justify-center">
                        <CheckCircle2 className="h-12 w-12" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900">Project Entry Secured!</h2>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            The file system and layout configurations have been written to the <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono font-bold text-[#1A3C2E]">talent_submissions</code> database table.
                        </p>
                    </div>
                    <div className="pt-4">
                        <button 
                            type="button"
                            onClick={() => {
                                setFormData({ category: 'coding', fileUrl: '', fileName: '', projectTitle: '', description: '', materials: '' });
                                setCurrentStep(1);
                            }}
                            className="text-xs font-bold text-[#1A3C2E] underline hover:opacity-80"
                        >
                            Submit another project entry
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}