import { NextResponse } from 'next/server';

function createReferralCode(name: string) {
    const clean =
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '')
            .slice(0, 8) || 'vote';
    const random = Math.random().toString(36).slice(2, 7);
    return `${clean}-${random}`;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const name = (body?.name ?? 'naija-votes').toString();
        const code = createReferralCode(name);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        const path = `/votes?ref=${encodeURIComponent(code)}`;

        return NextResponse.json({
            code,
            url: baseUrl ? `${baseUrl}${path}` : path
        });
    } catch {
        return NextResponse.json({ error: 'failed to generate referral' }, { status: 500 });
    }
}
