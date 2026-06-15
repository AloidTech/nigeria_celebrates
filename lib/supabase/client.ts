import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

export const getUser = async (supabase: SupabaseClient) => {
  let loading = true;
  let user = null;
  let error = null;

  try {
    const { data, error: fetchError } = await supabase.auth.getUser();
    if (fetchError) {
      error = fetchError;
    } else {
      user = data.user;
    }
  } catch (err) {
    error = err as Error;
  } finally {
    loading = false;
  }

  return { user, error, loading };
}

export const getSession = async (supabase: SupabaseClient) => {
  let loading = true;
  let session = null;
  let error = null;

  try {
    const { data, error: fetchError } = await supabase.auth.getSession();
    if (fetchError) {
      error = fetchError;
    } else {
      session = data.session;
    }
  } catch (err) {
    error = err as Error;
  } finally {
    loading = false;
  }

  return { session, error, loading };
}

export async function signUp(supabase: any, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error);
    return { success: false, error };
  }

  console.log(data);
  return { success: true, data };
}

export async function signIn(supabase: any, email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error.message);
    return { success: false, error };
  }

  console.log(data);
  return { success: true, data };
}
