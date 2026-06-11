'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: ReactNode;
    actionText?: string;
    onAction?: () => void;
}

export default function Popup({
    isOpen,
    onClose,
    title,
    message,
    actionText,
    onAction
}: PopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div 
                ref={popupRef}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-[#1A1A1A]">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="text-gray-600 mb-8 leading-relaxed">
                        {message}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        {actionText && onAction && (
                            <button
                                onClick={onAction}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1A3C2E] hover:bg-[#142e23] transition-colors shadow-sm"
                            >
                                {actionText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
