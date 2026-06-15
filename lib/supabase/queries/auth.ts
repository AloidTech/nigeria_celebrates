import type { SupabaseClient } from "@supabase/supabase-js";
import { signUp } from '@/lib/supabase/client';

export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string;
  handle: string;
  arena_id: string;
  avatar_url: string | null;
  description: string | null;
};

export async function signUpUser(supabase: SupabaseClient, email: string, password: string, name: string[], birthday: string, username: string, avatarFile: File | null, description: string | null) {
  try {
    const { data, error } = await signUp(supabase, email, password);

    if (error) {
      throw error;
    }

    const userId = data.user?.id;
    if (!userId) throw new Error("No user ID returned from signup");

    // Format handle and generate arena_id
    const handle = username.startsWith('@') ? username : '@' + username;
    const shortUuid = crypto.randomUUID().substring(0, 8);
    const arena_id = `${userId}_${shortUuid}`;

    // Handle optional avatar upload
    let avatar_url = null;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${userId}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        console.error("Failed to upload avatar:", uploadError);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        avatar_url = publicUrlData.publicUrl;
      }
    }

    const { profile, error: profileError } = await createProfile(supabase, userId, email, name, birthday, handle, arena_id, avatar_url, description);

    if (profileError) {
      throw profileError;
    }

    return { data, profile };
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

export async function createProfile(supabase: SupabaseClient, id: string, email: string, name: string[], birthday: string, handle: string, arena_id: string, avatar_url: string | null, description: string | null) {
  const profile: Profile = {
    id,
    email,
    first_name: name[0],
    last_name: name[1],
    birthday,
    handle,
    arena_id,
    avatar_url,
    description,
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(profile);

  if (error) {
    return { profile: null, error };
  }
  return { profile: data, error: null };
}
