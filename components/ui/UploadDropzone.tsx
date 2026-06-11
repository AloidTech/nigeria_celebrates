'use client';

import { AlertCircle, Camera, Info, Video } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { categoryFileRules, defaultFileRules } from '@/lib/categoryFileRules';

const MAX_FILE_SIZE = 52_428_800;

export type UploadDropzoneProps = {
    selectedCategory: string | null;
    className?: string;
    onFileSelect?: (file: File) => void; // 👈 Hooked up the callback prop
};

function formatBytes(bytes: number) {
    const megabytes = bytes / (1024 * 1024);
    return `${megabytes.toFixed(megabytes % 1 === 0 ? 0 : 1)}MB`;
}

function getFileExtension(fileName: string) {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : '';
}

export default function UploadDropzone({ selectedCategory, className, onFileSelect }: UploadDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress] = useState(45);
    const [fileName, setFileName] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const rules = selectedCategory ? (categoryFileRules[selectedCategory] ?? defaultFileRules) : defaultFileRules;
    const fileInfo = useMemo(() => rules.hint, [rules.hint]);

    function validateFile(file: File) {
        if (!selectedCategory) {
            return 'Please select a category before uploading.';
        }

        const fileExtension = getFileExtension(file.name);
        const isValidType = rules.allowedTypes.includes(file.type);
        const isValidExtension = rules.allowedExtensions.includes(fileExtension);

        if (!isValidType && !isValidExtension) {
            return `This category only accepts ${rules.label.toLowerCase()}. "${file.name}" is not a supported format.`;
        }

        if (file.size > MAX_FILE_SIZE) {
            return 'File exceeds the 50MB maximum size limit.';
        }

        return null;
    }

    function handleFile(file: File | undefined) {
        if (!file) {
            return;
        }

        const validationError = validateFile(file);

        if (validationError) {
            setErrorMessage(validationError);
            setFileName(null);
            return;
        }

        setErrorMessage(null);
        setFileName(file.name);
        
        // 👈 Send the validated file up to the parent page!
        if (onFileSelect) {
            onFileSelect(file);
        }
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
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    handleFile(event.dataTransfer.files?.[0]);
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                className={containerClass}>
                <input ref={inputRef} type='file' className='hidden' accept={rules.allowedTypes.join(',')} onChange={(event) => handleFile(event.target.files?.[0])} />
                <div className='mb-2 text-xs font-semibold uppercase tracking-wide text-[#1A3C2E]'>{rules.label}</div>
                <div className='mb-4 flex items-center gap-3'>
                    <Video className='h-10 w-10 stroke-[1.5] text-[#1A3C2E]' />
                    <Camera className='h-10 w-10 stroke-[1.5] text-[#1A3C2E]' />
                </div>
                <p className='mt-2 text-lg font-semibold text-[#1A1A1A]'>Drag and drop your file here</p>
                <p className='mt-1 text-sm text-gray-500'>Or click to browse your local storage</p>
                <div className='mt-4 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs text-gray-500'>
                    <Info className='h-3 w-3 text-gray-400' />
                    <span>
                        {formatBytes(MAX_FILE_SIZE)} maximum upload size. {fileInfo}
                    </span>
                </div>
            </div>

            {fileName && (
                <>
                    <div className='mt-4 mb-1 flex items-center justify-between'>
                        <span className='text-sm font-semibold text-[#1A3C2E]'>File Ready...</span>
                        <span className='text-sm font-semibold text-[#1A3C2E]'>100% Ready</span>
                    </div>
                    <div className='h-1.5 w-full rounded-full bg-[#E0E0E0]'>
                        <div className='h-full w-full rounded-full bg-[#1A3C2E]' />
                    </div>
                    <p className='mt-3 text-sm text-[#1A3C2E]'>Selected file: {fileName}</p>
                </>
            )}

            {errorMessage ? (
                <p className='mt-2 flex items-center gap-1 text-sm text-red-500'>
                    <AlertCircle className='h-4 w-4' />
                    <span>{errorMessage}</span>
                </p>
            ) : null}
        </div>
    );
}
