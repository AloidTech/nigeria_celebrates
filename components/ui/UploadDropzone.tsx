'use client';

import { Camera, CircleIcon, Video } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

const MAX_FILE_SIZE = 52_428_800;
const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png'] as const;

export type UploadDropzoneProps = {
    className?: string;
};

function formatBytes(bytes: number) {
    const megabytes = bytes / (1024 * 1024);
    return `${megabytes.toFixed(megabytes % 1 === 0 ? 0 : 1)}MB`;
}

export default function UploadDropzone({ className }: UploadDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress] = useState(45);
    const [fileName, setFileName] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fileInfo = useMemo(() => `Max Duration: 1m 30s | Maximum File Size: ${formatBytes(MAX_FILE_SIZE)}. Supported formats: MP4, MOV, JPEG, PNG.`, []);

    function validateFile(file: File) {
        if (!allowedMimeTypes.includes(file.type as (typeof allowedMimeTypes)[number])) {
            return 'Invalid file type. Please upload an MP4, MOV, JPEG, or PNG file.';
        }

        if (file.size > MAX_FILE_SIZE) {
            return 'File is too large. Maximum size is 50MB.';
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
    }

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
                className={
                    isDragging
                        ? 'flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#1A3C2E] bg-[#E4EFE8] p-12 text-center transition'
                        : 'flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#1A3C2E] bg-[#EEF4F0] p-12 text-center transition hover:bg-[#E4EFE8]'
                }>
                <input
                    ref={inputRef}
                    type='file'
                    className='hidden'
                    accept='video/mp4,video/quicktime,image/jpeg,image/png'
                    onChange={(event) => handleFile(event.target.files?.[0])}
                />
                <div className='mb-4 flex items-center gap-3'>
                    <Video className='h-10 w-10 stroke-[1.5] text-[#1A3C2E]' />
                    <Camera className='h-10 w-10 stroke-[1.5] text-[#1A3C2E]' />
                </div>
                <p className='mt-2 text-lg font-semibold text-[#1A1A1A]'>Drag and drop your file here</p>
                <p className='mt-1 text-sm text-gray-500'>Or click to browse your local storage</p>
                <div className='mt-4 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs text-gray-500'>
                    <span>{fileInfo}</span>
                </div>
            </div>

            <div className='mt-4 mb-1 flex items-center justify-between'>
                <span className='text-sm font-semibold text-[#1A3C2E]'>Uploading...</span>
                <span className='text-sm font-semibold text-[#1A3C2E]'>{uploadProgress}%</span>
            </div>
            <div className='h-1.5 w-full rounded-full bg-[#E0E0E0]'>
                <div className='h-full w-[45%] rounded-full bg-[#1A3C2E]' />
            </div>

            {fileName ? <p className='mt-3 text-sm text-[#1A3C2E]'>Selected file: {fileName}</p> : null}
            {errorMessage ? <p className='mt-3 text-sm text-red-600'>{errorMessage}</p> : null}
        </div>
    );
}
