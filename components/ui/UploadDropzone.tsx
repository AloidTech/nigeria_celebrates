'use client';

import { AlertCircle, Camera, Info, Video } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, memo } from 'react';

import { categoryFileRules, defaultFileRules } from '@/lib/categoryFileRules';

const MAX_FILE_SIZE = 52_428_800;

export type UploadDropzoneProps = {
    selectedCategory: string | null;
    className?: string;
    onFileSelect?: (file: File) => void;
    onClearFile?: () => void;
};

function formatBytes(bytes: number) {
    const megabytes = bytes / (1024 * 1024);
    return `${megabytes.toFixed(megabytes % 1 === 0 ? 0 : 1)}MB`;
}

function getFileExtension(fileName: string) {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : '';
}

function UploadDropzone({ selectedCategory, className, onFileSelect, onClearFile }: UploadDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [selectedFile]);

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
            setSelectedFile(null);
            return;
        }

        setErrorMessage(null);
        setSelectedFile(file);
        
        if (onFileSelect) {
            onFileSelect(file);
        }
    }

    function clearFile(e: React.MouseEvent) {
        e.stopPropagation();
        setSelectedFile(null);
        setErrorMessage(null);
        if (onClearFile) {
            onClearFile();
        }
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

    const borderClass = errorMessage ? 'border-red-400' : 'border-[#1A3C2E]';
    const containerClass = isDragging
        ? `flex min-h-55 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed ${borderClass} bg-[#E4EFE8] p-6 sm:p-12 text-center transition`
        : `flex min-h-55 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed ${borderClass} bg-[#EEF4F0] p-6 sm:p-12 text-center transition hover:bg-[#E4EFE8]`;

    return (
        <div className={className}>
            {selectedFile ? (
                <div className='relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2'>
                    <button 
                        type="button" 
                        onClick={clearFile}
                        className='absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 focus:outline-none'
                        aria-label="Remove file"
                    >
                        <span className="sr-only">Remove file</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                    
                    {previewUrl && (
                        <div className='relative flex w-full flex-col items-center justify-center rounded-lg bg-black/5'>
                            {selectedFile.type.startsWith('image/') ? (
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className='max-h-64 rounded-lg object-contain'
                                />
                            ) : selectedFile.type.startsWith('video/') ? (
                                <video 
                                    src={previewUrl} 
                                    controls 
                                    className='max-h-64 rounded-lg'
                                />
                            ) : (
                                <div className='flex h-32 w-full items-center justify-center text-sm font-medium text-gray-500'>
                                    {selectedFile.name} (Preview not available)
                                </div>
                            )}
                        </div>
                    )}
                    <div className='mt-3 flex flex-col items-center text-center'>
                        <span className='truncate max-w-[250px] sm:max-w-xs text-sm font-semibold text-[#1A3C2E]'>{selectedFile.name}</span>
                        <span className='text-xs text-gray-500'>{formatBytes(selectedFile.size)}</span>
                    </div>
                </div>
            ) : (
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

export default memo(UploadDropzone);
