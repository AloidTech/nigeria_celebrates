'use client';

import type { ReactNode } from 'react';

export type FormFieldProps = {
    label: string;
    children: ReactNode;
};

export default function FormField({ label, children }: FormFieldProps) {
    return (
        <label className='block'>
            <span className='mb-1 block text-sm font-medium text-[#1A1A1A]'>{label}</span>
            {children}
        </label>
    );
}
