'use client';

type Props = {
    url: string;
    text?: string;
};

export default function ShareButtons({ url, text = 'Vote for the next Naija star' }: Props) {
    function openShare(href: string) {
        window.open(href, '_blank', 'noopener,noreferrer');
    }

    const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    return (
        <div className='mt-4 flex flex-col gap-3 sm:flex-row'>
            <button
                type='button'
                onClick={() => openShare(whatsappHref)}
                className='w-full flex-1 rounded-md bg-[#1A3C2E] px-2 py-2 text-xs font-semibold whitespace-nowrap text-white transition hover:bg-[#142e23]'>
                Share on WhatsApp
            </button>
            <button
                type='button'
                onClick={() => openShare(twitterHref)}
                className='w-full flex-1 rounded-md bg-[#475569] px-2 py-2 text-xs font-semibold whitespace-nowrap text-white transition hover:bg-[#334155]'>
                Share on Twitter
            </button>
        </div>
    );
}
