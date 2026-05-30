import type { ReactNode } from 'react';

type IconButtonProps = {
    children: ReactNode;
    className?: string;
};

export default function IconButton({ children, className }: IconButtonProps) {
    return (
        <button
            type='button'
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d7d2c4] bg-white text-[#1a3c2e] transition hover:-translate-y-0.5 hover:shadow-sm ${className ?? ''}`}>
            {children}
        </button>
    );
}
