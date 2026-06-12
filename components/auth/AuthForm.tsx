type AuthInputProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type: string;

};

type AuthMultiInputProps = {
    label: string;
    value: [string, string];
    onChange: (value: [string, string]) => void;
    placeholder: string | [string, string];
    type: string;

};

export default function AuthForm({ value, onChange, type, placeholder, label }: AuthInputProps) {
    return (
        <label className='block'>
            <span className='mb-1 block text-sm font-semibold text-[#1A1A1A]'>{label}</span>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className='w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-[#1A3C2E] focus:ring-2 focus:ring-[#1A3C2E]/20'
            />
        </label>
    );
}

export function AuthMultiForm({ value, onChange, type, placeholder, label }: AuthMultiInputProps) {
    return (
        <div className='space-y-1'>
            <label className='block text-sm font-medium text-black font-'>{label}</label>
            <div className='flex gap-3'>
                <input
                    className='w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-[#1A3C2E] focus:ring-2 focus:ring-[#1A3C2E]/20'
                    placeholder={Array.isArray(placeholder) ? placeholder[0] : placeholder}
                    type={type}
                    value={value[0]}
                    onChange={(e) => onChange([e.target.value, value[1]])}
                />
                <input
                    className='w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-[#1A3C2E] focus:ring-2 focus:ring-[#1A3C2E]/20'
                    placeholder={Array.isArray(placeholder) ? placeholder[1] : placeholder}
                    type={type}
                    value={value[1]}
                    onChange={(e) => onChange([value[0], e.target.value])}
                />
            </div>

        </div >
    )
}
