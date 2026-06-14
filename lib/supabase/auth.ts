import type { SupabaseClient } from "@supabase/supabase-js";
import { signUp } from '@/lib/supabase/client';

export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string;
};

export async function signUpUser(supabase: SupabaseClient, email: string, password: string, name: string[], birthday: string) {
  try {
    const { data, error } = await signUp(supabase, email, password);

    if (error) {
      throw error;
    }

    const { profile, error: profileError } = await createProfile(supabase, data.user?.id, email, name, birthday);

    if (profileError) {
      throw profileError;
    }

    return { data, profile };
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

export async function createProfile(supabase: SupabaseClient, id: string, email: string, name: string[], birthday: string) {
  const profile: Profile = {
    id,
    email,
    first_name: name[0],
    last_name: name[1],
    birthday,
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(profile);

  if (error) {
    return { profile: null, error };
  }
  return { profile: data, error: null };
}
