export default function AuthCard({ children }: { children: React.ReactNode }) {
    return (
        <div className='w-full'>
            <div className='mb-8 text-center'>
                <h1 className='text-2xl font-bold text-[#1A3C2E]'>Nigeria Celebrates</h1>
                <p className='mt-1 text-sm text-gray-500'>One Nation. One Voice. One Celebration.</p>
            </div>
            {children}
        </div>
    );
}
