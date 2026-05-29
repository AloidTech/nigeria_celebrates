export default function AuthDivider() {
    return (
        <div className='my-6 flex items-center gap-3'>
            <span className='h-px flex-1 bg-gray-200' />
            <span className='whitespace-nowrap text-xs font-medium tracking-widest text-gray-400'>OR CONTINUE WITH</span>
            <span className='h-px flex-1 bg-gray-200' />
        </div>
    );
}
