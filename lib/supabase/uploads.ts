import type { SupabaseClient } from '@supabase/supabase-js';

export type Submission = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  media_url: string;
  is_approved: boolean;
  created_at: string;
};

/**
 * Retrieves all uploads for a specific user ID.
 */
export async function getUploadsById(supabase: SupabaseClient, userId: string): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error in getUploadsById:', error);
    throw error;
  }
  return (data || []) as Submission[];
}

/**
 * Retrieves a single upload/submission by its unique ID.
 */
export async function getUpload(supabase: SupabaseClient, uploadId: string): Promise<Submission | null> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', uploadId)
    .maybeSingle();

  if (error) {
    console.error('Error in getUpload:', error);
    throw error;
  }
  return data as Submission | null;
}
