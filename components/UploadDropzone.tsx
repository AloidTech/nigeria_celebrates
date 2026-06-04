'use client';

import { AlertCircle, Camera, Info, Video, Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { categoryFileRules, defaultFileRules } from '@/lib/categoryFileRules';
import { supabase } from '@/supabase'; // Importing your fixed supabase client

const MAX_FILE_SIZE = 52_428_800;

export type UploadDropzoneProps = {
    selectedCategory: string | null;
    className?: string;
    onUploadComplete?: (publicUrl: string, fileName: string) => void;
};

function formatBytes(bytes: number) {
    const megabytes = bytes / (1024 * 1024);
    return `${megabytes.toFixed(megabytes % 1 === 0 ? 0 : 1)}MB`;
}

function getFileExtension(fileName: string) {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : '';
}

export default function UploadDropzone({ selectedCategory, className, onUploadComplete }: UploadDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileName, setFileName] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const rules = selectedCategory ? (categoryFileRules[selectedCategory] ?? defaultFileRules) : defaultFileRules;
    const fileInfo = useMemo(() => rules.hint, [rules.hint]);

    function validateFile(file: File) {
        if (!selectedCategory) {
            return 'Please select an event category before uploading your file.';
        }

        // Safely pull the rule configuration or fall back to default constraints
        const rules = categoryFileRules[selectedCategory] ?? defaultFileRules;
        
        const fileExtension = getFileExtension(file.name); // e.g., ".mp4"
        const fileMimeType = file.type.toLowerCase();       // e.g., "video/mp4"

        // 1. Evaluate MIME Types (supporting exact string matches or wildcard patterns like 'image/*')
        // Explicitly typed allowedType as string below:
        const isValidType = rules.allowedTypes.some((allowedType: string) => {
            if (allowedType.includes('/*')) {
                const baseType = allowedType.split('/')[0]; // extracts 'image', 'video', etc.
                return fileMimeType.startsWith(`${baseType}/`);
            }
            return fileMimeType === allowedType;
        });

        // 2. Evaluate physical extension structure as a safety layer
        const isValidExtension = rules.allowedExtensions.includes(fileExtension);

        // CRITICAL REJECTION: Fail the run if neither matches the explicit category layout
        if (!isValidType && !isValidExtension) {
            return `The "${selectedCategory}" category strictly rejects this format. Please upload valid formats: ${rules.allowedExtensions.join(', ')}.`;
        }

        // 3. Evaluate maximum file footprint
        if (file.size > MAX_FILE_SIZE) {
            return 'File exceeds the 50MB maximum payload footprint threshold.';
        }

        return null; // File passes all gatekeepers safely
    }

    async function uploadFileToSupabase(file: File) {
        setIsUploading(true);
        setUploadProgress(0);
        setErrorMessage(null);

        try {
            // 1. Generate a completely unique file path to prevent overwriting assets
            const fileExt = getFileExtension(file.name);
            const cleanCategory = selectedCategory?.toLowerCase().replace(/\s+/g, '-') || 'general';
            const uniqueId = Math.random().toString(36).substring(2, 15);
            const filePath = `${cleanCategory}/${Date.now()}-${uniqueId}${fileExt}`;

            // 2. Perform the upload via standard storage configuration
            const { error: uploadError } = await supabase.storage
                .from('hackathon-uploads')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            setUploadProgress(100);

            // 3. Get the public asset link
            const { data: { publicUrl } } = supabase.storage
                .from('hackathon-uploads')
                .getPublicUrl(filePath);

            // 4. Fire callback to save reference to your DB table
            if (onUploadComplete) {
                onUploadComplete(publicUrl, file.name);
            }

            setFileName(file.name);
        } catch (error: any) {
            setErrorMessage(error.message || 'An unexpected error occurred during your upload.');
            setFileName(null);
        } finally {
            setIsUploading(false);
        }
    }

    function handleFile(file: File | undefined) {
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setErrorMessage(validationError);
            setFileName(null);
            return;
        }

        uploadFileToSupabase(file);
    }

    const borderClass = errorMessage ? 'border-red-400' : 'border-[#1A3C2E]';
    const containerClass = isDragging
        ? `flex min-h-55 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed ${borderClass} bg-[#E4EFE8] p-12 text-center transition`
        : `flex min-h-55 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed ${borderClass} bg-[#EEF4F0] p-12 text-center transition hover:bg-[#E4EFE8]`;

    return (
        <div className={className}>
            <div
                role='button'
                tabIndex={0}
                onClick={() => !isUploading && inputRef.current?.click()}
                onDragOver={(event) => {
                    event.preventDefault();
                    if (!isUploading) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    if (!isUploading) handleFile(event.dataTransfer.files?.[0]);
                }}
                onKeyDown={(event) => {
                    if ((event.key === 'Enter' || event.key === ' ') && !isUploading) {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                className={`${containerClass} ${isUploading ? 'cursor-not-allowed opacity-60' : ''}`}>
                <input 
                    ref={inputRef} 
                    type='file' 
                    className='hidden' 
                    accept={rules.allowedTypes.join(',')} 
                    onChange={(event) => handleFile(event.target.files?.[0])}
                    disabled={isUploading}
                />
                <div className='mb-2 text-xs font-semibold uppercase tracking-wide text-[#1A3C2E]'>{rules.label}</div>
                <div className='mb-4 flex items-center gap-3'>
                    {isUploading ? (
                        <Loader2 className='h-10 w-10 animate-spin text-[#1A3C2E]' />
                    ) : (
                        <>
                            <Video className='h-10 w-10 stroke-[1.5] text-[#1A3C2E]' />
                            <Camera className='h-10 w-10 stroke-[1.5] text-[#1A3C2E]' />
                        </>
                    )}
                </div>
                <p className='mt-2 text-lg font-semibold text-[#1A1A1A]'>
                    {isUploading ? 'Uploading file to server...' : 'Drag and drop your file here'}
                </p>
                <p className='mt-1 text-sm text-gray-500'>
                    {isUploading ? 'Please do not close this window.' : 'Or click to browse your local storage'}
                </p>
                <div className='mt-4 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs text-gray-500'>
                    <Info className='h-3 w-3 text-gray-400' />
                    <span>
                        {formatBytes(MAX_FILE_SIZE)} maximum upload size. {fileInfo}
                    </span>
                </div>
            </div>

            {/* Uploading Progress Block */}
            {isUploading && (
                <div className='mt-4 animate-fade-in'>
                    <div className='mb-1 flex items-center justify-between'>
                        <span className='text-sm font-semibold text-[#1A3C2E]'>Uploading asset...</span>
                        <span className='text-sm font-semibold text-[#1A3C2E]'>{uploadProgress}%</span>
                    </div>
                    <div className='h-1.5 w-full rounded-full bg-[#E0E0E0]'>
                        <div 
                            className='h-full rounded-full bg-[#1A3C2E] transition-all duration-300' 
                            style={{ width: `${uploadProgress || 10}%` }} 
                        />
                    </div>
                </div>
            )}

            {fileName && !isUploading ? (
                <p className='mt-3 text-sm font-medium text-[#1A3C2E] flex items-center gap-1'>
                    ✅ Successfully uploaded: <span className='underline'>{fileName}</span>
                </p>
            ) : null}
            
            {errorMessage ? (
                <p className='mt-2 flex items-center gap-1 text-sm text-red-500'>
                    <AlertCircle className='h-4 w-4 flex-shrink-0' />
                    <span>{errorMessage}</span>
                </p>
            ) : null}
        </div>
    );
}