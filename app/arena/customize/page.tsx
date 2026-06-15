'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/supabase/queries/profiles';

export default function CustomizeProfilePage() {
    return (
        <ProtectedRoute>
            <CustomizeProfileContent />
        </ProtectedRoute>
    );
}

function CustomizeProfileContent() {
    const router = useRouter();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [handle, setHandle] = useState('');
    const [description, setDescription] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Handle check states
    const [handleChecking, setHandleChecking] = useState(false);
    const [handleStatus, setHandleStatus] = useState<'available' | 'taken' | 'invalid' | null>(null);

    const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        async function loadProfile() {
            if (!user) return;
            setLoading(true);
            try {
                const supabase = getSupabaseBrowserClient();
                const profile = await getUserProfile(supabase, user.id);
                if (profile) {
                    setOriginalProfile(profile);
                    setFirstName(profile.first_name || '');
                    setLastName(profile.last_name || '');
                    // Strip @ prefix for the input display, we will handle it cleanly
                    let cleanHandle = profile.handle || '';
                    if (cleanHandle.startsWith('@')) {
                        cleanHandle = cleanHandle.substring(1);
                    }
                    setHandle(cleanHandle);
                    setDescription(profile.description || '');
                    setAvatarUrl(profile.avatar_url || null);
                    setAvatarPreview(profile.avatar_url || null);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [user?.id]);

    // Handle check effect
    useEffect(() => {
        if (!handle || !user?.id) {
            setHandleStatus(null);
            return;
        }

        const normalized = handle.trim().toLowerCase();
        
        // Validation: length between 3 and 30, only alphanumeric, underscores, or hyphens
        const isValid = /^[a-zA-Z0-9_-]{3,30}$/.test(normalized);
        if (!isValid) {
            setHandleStatus('invalid');
            return;
        }

        // If it matches original handle, it's available
        let originalClean = originalProfile?.handle || '';
        if (originalClean.startsWith('@')) {
            originalClean = originalClean.substring(1);
        }
        if (normalized === originalClean.toLowerCase()) {
            setHandleStatus('available');
            return;
        }

        const checkTimer = setTimeout(async () => {
            setHandleChecking(true);
            try {
                const supabase = getSupabaseBrowserClient();
                const { data, error: checkErr } = await supabase
                    .from('profiles')
                    .select('id')
                    .or(`handle.eq."${normalized}",handle.eq."@${normalized}"`)
                    .neq('id', user.id)
                    .maybeSingle();

                if (checkErr) throw checkErr;

                if (data) {
                    setHandleStatus('taken');
                } else {
                    setHandleStatus('available');
                }
            } catch (err) {
                console.error('Error checking handle availability:', err);
            } finally {
                setHandleChecking(false);
            }
        }, 500);

        return () => clearTimeout(checkTimer);
    }, [handle, originalProfile, user?.id]);

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    }

    function handleRemoveAvatar() {
        setAvatarFile(null);
        setAvatarUrl(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    async function handlePublish() {
        if (!user) return;

        if (!firstName.trim()) {
            setError('First name cannot be empty.');
            return;
        }

        if (handleStatus === 'taken') {
            setError('The selected handle is already taken.');
            return;
        }

        if (handleStatus === 'invalid') {
            setError('Handle must be between 3 and 30 characters and only contain letters, numbers, underscores, or hyphens.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const supabase = getSupabaseBrowserClient();
            let finalAvatarUrl = avatarUrl;

            // 1. Upload new avatar if selected
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const filePath = `${user.id}/profile_${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                finalAvatarUrl = publicUrlData.publicUrl;
            }

            // 2. Update profile in database
            const formattedHandle = handle.trim() ? (handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`) : null;

            await updateUserProfile(supabase, user.id, {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                handle: formattedHandle,
                description: description.trim() || null,
                avatar_url: finalAvatarUrl
            });

            // Redirect back to user's profile arena
            router.push('/arena');
            router.refresh();
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'An error occurred while saving your changes.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#1A3C2E]" />
            </div>
        );
    }

    const displayName = `${firstName} ${lastName}`.trim() || 'Creator';
    const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <main className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] pb-24">
            {/* Top Edit Sticky Bar (YouTube Studio style) */}
            <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition text-gray-600"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#1A1A1A]">Profile customisation</h1>
                            <p className="text-xs text-gray-500 font-medium">Customise your public channel and presence</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => router.back()}
                            className="rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2 text-xs font-bold text-[#1A1A1A] transition active:scale-95 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={saving || handleStatus === 'taken' || handleStatus === 'invalid'}
                            onClick={handlePublish}
                            className="rounded-full bg-[#1A3C2E] hover:bg-[#153325] px-5 py-2 text-xs font-bold text-white transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                'Publish'
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 mt-8">
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2.5">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 shadow-sm space-y-8">
                    {/* Picture Section */}
                    <div>
                        <h2 className="text-md font-bold text-[#1A1A1A]">Profile picture</h2>
                        <p className="text-xs text-gray-500 mt-1">Your profile picture will appear where your channel is presented on Nigeria Celebrates.</p>
                        
                        <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
                            {/* Circular Preview */}
                            <div className="relative group h-28 w-28 rounded-full bg-gradient-to-tr from-[#1A3C2E] to-[#2E6B52] border-2 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white tracking-wider">
                                        {initials || 'C'}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                                >
                                    <Camera className="h-6 w-6 text-white" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="rounded-full bg-black/[0.06] hover:bg-black/[0.1] px-4 py-2 text-xs font-bold text-[#1A1A1A] transition active:scale-95"
                                    >
                                        Change
                                    </button>
                                    {avatarPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            className="rounded-full border border-gray-300 hover:bg-gray-50 px-4 py-2 text-xs font-bold text-red-600 transition active:scale-95"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                                    Recommended: JPG, PNG or WEBP. Max 2MB.
                                </p>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <h2 className="text-md font-bold text-[#1A1A1A]">Basic info</h2>

                        {/* First and Last Name Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter your first name"
                                    className="w-full rounded-xl border border-gray-200 bg-[#FAFAF8] px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:border-[#1A3C2E] focus:bg-white focus:outline-none transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter your last name"
                                    className="w-full rounded-xl border border-gray-200 bg-[#FAFAF8] px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:border-[#1A3C2E] focus:bg-white focus:outline-none transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Handle Input */}
                        <div>
                            <label htmlFor="handle" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                Handle
                            </label>
                            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                                Choose your unique handle. You can change your handle back within 14 days. Handles can contain letters, numbers, underscores, and hyphens.
                            </p>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-sm font-bold text-gray-400">@</span>
                                <input
                                    type="text"
                                    id="handle"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                                    placeholder="handle"
                                    className="w-full rounded-xl border border-gray-200 bg-[#FAFAF8] pl-8 pr-12 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:border-[#1A3C2E] focus:bg-white focus:outline-none transition-all duration-200"
                                />
                                <div className="absolute right-4 flex items-center">
                                    {handleChecking && (
                                        <Loader2 className="h-4 w-4 animate-spin text-[#1A3C2E]" />
                                    )}
                                    {!handleChecking && handleStatus === 'available' && (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                    {!handleChecking && (handleStatus === 'taken' || handleStatus === 'invalid') && (
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                    )}
                                </div>
                            </div>

                            {/* Handle Status Message */}
                            {handleStatus && (
                                <p className={`mt-2 text-xs font-semibold ${
                                    handleStatus === 'available' ? 'text-green-700' : 'text-red-600'
                                }`}>
                                    {handleStatus === 'available' && 'Handle is available'}
                                    {handleStatus === 'taken' && 'This handle is already taken'}
                                    {handleStatus === 'invalid' && 'Handle must be 3-30 characters (letters, numbers, _, -)'}
                                </p>
                            )}
                        </div>

                        {/* Description Textarea */}
                        <div>
                            <label htmlFor="description" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                Description
                            </label>
                            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                                Tell viewers about your talent, your page, and what kind of submissions they can expect.
                            </p>
                            <textarea
                                id="description"
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell us about yourself..."
                                className="w-full rounded-xl border border-gray-200 bg-[#FAFAF8] px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:border-[#1A3C2E] focus:bg-white focus:outline-none transition-all duration-200 resize-y"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
