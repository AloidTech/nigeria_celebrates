type EmailInputProps = {
    value: string;
    onChange: (value: string) => void;
};

export default function EmailInput({ value, onChange }: EmailInputProps) {
    return (
        <label className='block'>
            <span className='mb-1 block text-sm font-semibold text-[#1A1A1A]'>Email Address</span>
            <input
                type='email'
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder='e.g. adesuwa@naija.com'
                className='w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-[#1A3C2E] focus:ring-2 focus:ring-[#1A3C2E]/20'
            />
        </label>
    );
}
