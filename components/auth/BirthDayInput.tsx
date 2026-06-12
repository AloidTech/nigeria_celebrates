type BirthdayInputProps = {
    value: string;
    onChange: (value: string) => void;
};

export default function BirthdayInput({ value, onChange }: BirthdayInputProps) {
    return (
        <label className='block'>
            <span className='mb-1 block text-sm font-semibold text-[#1A1A1A]'>
                Birthday
            </span>
            <input
                type='date'
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className='w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#1A3C2E] focus:ring-2 focus:ring-[#1A3C2E]/20'
            />
        </label>
    );
}