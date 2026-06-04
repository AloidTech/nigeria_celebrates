'use client';

import { useState } from 'react';
import { Code, Palette, Video, Presentation } from 'lucide-react';
import TalentGridTile from '@/components/TalentGridTile';
import UploadDropzone from '@/components/UploadDropzone';

export default function Home() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-[#f7f9f6] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Hackathon Project Submission</h1>
                    <p className="text-sm text-gray-500 mb-6">Select your track and upload your corresponding project file assets below.</p>
                    
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">1. Select Track Category</h2>
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

                <hr className="border-gray-100" />

                <div>
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">2. Upload Deliverables</h2>
                    <UploadDropzone 
                        selectedCategory={activeCategory} 
                        onUploadComplete={(url, name) => {
                            console.log("Successfully uploaded to Supabase!", url, name);
                        }}
                    />
                </div>
                
            </div>
        </main>
    );
}