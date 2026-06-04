'use client';

import { Check } from 'lucide-react';

export type StepIndicatorProps = {
    currentStep: number;
};

const steps = [{ label: 'Media Upload' }, { label: 'Details & Info' }, { label: 'Review' }] as const;

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className='mx-auto flex w-full max-w-2xl items-center px-4 py-4 sm:px-8'>
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;
                const isLast = index === steps.length - 1;

                return (
                    <div 
                        key={step.label} 
                        className={`flex items-center ${!isLast ? 'flex-1' : ''}`}
                    >
                        {/* Step Circle & Label Wrapper */}
                        <div className='flex items-center shrink-0'>
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300
                                    ${isActive 
                                        ? 'bg-[#1A3C2E] text-white ring-4 ring-[#1A3C2E]/10' 
                                        : isCompleted 
                                            ? 'bg-[#1A3C2E] text-white' 
                                            : 'bg-gray-200 text-gray-400'
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check className="h-4 w-4 stroke-[3]" />
                                ) : (
                                    stepNumber
                                )}
                            </div>
                            
                            <span 
                                className={`ml-2 text-sm font-medium transition-colors duration-300 hidden sm:inline-block
                                    ${isActive ? 'text-[#1A3C2E] font-semibold' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connecting Line */}
                        {!isLast && (
                            <div 
                                className={`mx-4 h-0.5 flex-1 transition-colors duration-500
                                    ${isCompleted ? 'bg-[#1A3C2E]' : 'bg-gray-200'}`} 
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}