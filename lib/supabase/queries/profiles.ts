import type { SupabaseClient } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string;
  created_at?: string;
  handle?: string | null;
  arena_id?: string | null;
  avatar_url?: string | null;
  description?: string | null;
};

export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as UserProfile | null;
}

export async function getUserProfileByHandleOrId(supabase: SupabaseClient, identifier: string) {
  let cleanIdentifier = decodeURIComponent(identifier).trim();
  if (cleanIdentifier.startsWith('@')) {
    cleanIdentifier = cleanIdentifier.substring(1);
  }
  
  // Quick UUID format check
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanIdentifier);
  
  let query = supabase.from('profiles').select('*');
  if (isUuid) {
    query = query.eq('id', cleanIdentifier);
  } else {
    query = query.or(`handle.eq."${cleanIdentifier}",handle.eq."@${cleanIdentifier}"`);
  }
  
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data as UserProfile | null;
}

export async function updateUserProfile(supabase: SupabaseClient, userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

