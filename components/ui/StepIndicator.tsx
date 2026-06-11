'use client';

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
                const isLast = index === steps.length - 1;

                return (
                    <div key={step.label} className={`flex ${isLast ? 'flex-none' : 'flex-1'} items-center`}>
                        <div className='flex items-center'>
                            <div
                                className={
                                    isActive
                                        ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A3C2E] text-sm font-bold text-white shadow-[0_0_0_4px_rgba(26,60,46,0.1)]'
                                        : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0E0E0] text-sm font-bold text-gray-400'
                                }>
                                {stepNumber}
                            </div>
                            <span className={`ml-2 hidden text-sm font-semibold sm:inline-block ${isActive ? 'text-[#1A3C2E]' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                        {!isLast ? <div className='mx-3 h-px flex-1 self-center bg-[#E0E0E0]' /> : null}
                    </div>
                );
            })}
        </div>
    );
}
