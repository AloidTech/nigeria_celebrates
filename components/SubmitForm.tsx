'use client';

import { useState } from 'react';
import { Code, Palette, Video, Presentation } from 'lucide-react';
import TalentGridTile from '@/components/TalentGridTile';
import UploadDropzone from '@/components/UploadDropzone';
import { supabase } from '@/supabase'; // Import your configured Supabase client

export default function SubmitProjectPage() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // This handles saving the upload metadata to your database table
    const handleDbInsertion = async (url: string, name: string) => {
        if (!activeCategory) {
            setStatusMessage({ type: 'error', text: 'Please select a category before uploading.' });
            return;
        }

        setIsSaving(true);
        setStatusMessage(null);

        try {
            const { error } = await supabase
                .from('talent_submissions') // Your database table name
                .insert([
                    {
                        category: activeCategory,
                        file_url: url,
                        file_name: name,
                        votes: "0", // Initial local vote string matching your TalentCard setup
                        time: "Just now"
                    }
                ]);

            if (error) throw error;

            setStatusMessage({ type: 'success', text: 'Submission successfully recorded in the database!' });
        } catch (err: any) {
            console.error('Database insertion failed:', err);
            setStatusMessage({ type: 'error', text: err.message || 'Failed to save submission records.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {statusMessage && (
                <div className={`p-4 rounded-xl text-sm border ${
                    statusMessage.type === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {statusMessage.text}
                </div>
            )}

            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Select Submission Category</h2>
                {/* 1. The Category Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <TalentGridTile 
                        label="Coding" 
                        icon={Code} 
                        isSelected={activeCategory === 'coding'} 
                        onClick={() => setActiveCategory('coding')} 
                    />
                    <TalentGridTile 
                        label="Design" 
                        icon={Palette} 
                        isSelected={activeCategory === 'design'} 
                        onClick={() => setActiveCategory('design')} 
                    />
                    <TalentGridTile 
                        label="Video" 
                        icon={Video} 
                        isSelected={activeCategory === 'video'} 
                        onClick={() => setActiveCategory('video')} 
                    />
                    <TalentGridTile 
                        label="Presentation" 
                        icon={Presentation} 
                        isSelected={activeCategory === 'presentation'} 
                        onClick={() => setActiveCategory('presentation')} 
                    />
                </div>
            </div>

            {/* 2. The Dynamic Dropzone */}
            <div className={isSaving ? 'opacity-60 pointer-events-none transition-opacity' : ''}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Deliverables</h2>
                <UploadDropzone 
                    selectedCategory={activeCategory} 
                    onUploadComplete={(url, name) => {
                        console.log("Uploaded successfully!", url, name);
                        handleDbInsertion(url, name); // Fire database write immediately
                    }}
                />
                {isSaving && <p className="text-xs text-gray-500 mt-2 animate-pulse">Syncing record registry with Supabase database...</p>}
            </div>
        </div>
    );
}