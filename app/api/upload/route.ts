import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { categoryFileRules, defaultFileRules } from '@/lib/categoryFileRules';

const MAX_FILE_SIZE = 52_428_800; // 50MB

function getFileExtension(fileName: string) {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : '';
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Create a Supabase client that uses the user's auth token
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
            auth: { persistSession: false }
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string | null;
        const category = formData.get('category') as string | null;
        const description = formData.get('description') as string | null;

        if (!file || !title || !category || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // --- SERVER-SIDE VALIDATION ---
        const rules = categoryFileRules[category] ?? defaultFileRules;
        const fileExtension = getFileExtension(file.name);
        
        const isValidType = rules.allowedTypes.includes(file.type);
        const isValidExtension = rules.allowedExtensions.includes(fileExtension);

        if (!isValidType && !isValidExtension) {
            return NextResponse.json({ error: `Invalid file format for category '${category}'.` }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File exceeds the 50MB maximum size limit.' }, { status: 400 });
        }

        // --- UPLOAD TO STORAGE ---
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
        
        // Convert File to ArrayBuffer for Supabase Storage
        const fileBuffer = await file.arrayBuffer();

        const { error: uploadError } = await supabase.storage
            .from('hackathon-uploads')
            .upload(fileName, fileBuffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error('Storage error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload file to storage.' }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage
            .from('hackathon-uploads')
            .getPublicUrl(fileName);

        // --- DATABASE INSERT ---
        const { error: dbError } = await supabase
            .from('submissions')
            .insert({
                user_id: user.id, // Explicitly linking the user
                title,
                category,
                description,
                media_url: publicUrlData.publicUrl,
                is_approved: false
            });

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            // Ideally we would delete the uploaded file here to clean up, but for simplicity we return the error
            return NextResponse.json({ error: 'Failed to save submission to database.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, url: publicUrlData.publicUrl });

    } catch (error: any) {
        console.error('Server error during upload:', error);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
