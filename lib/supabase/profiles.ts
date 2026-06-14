import type { SupabaseClient } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string;
  created_at?: string;
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
