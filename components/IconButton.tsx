'use client';

import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react'; // For async loading feedback

type IconButtonProps = {
    children: ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    disabled?: boolean;
    isLoading?: boolean; // New: Stops multi-click spam during backend requests
    title?: string;      // New: Good for hover tooltips
};

export default function IconButton({ 
    children, 
    className, 
    onClick, 
    disabled, 
    isLoading, 
    title 
}: IconButtonProps) {
    return (
        <button
            type='button'
            title={title}
            disabled={disabled || isLoading}
            onClick={onClick}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d7d2c4] bg-white text-[#1a3c2e] transition outline-none
                ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-sm'} 
                ${className ?? ''}`}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                children
            )}
        </button>
    );
}