import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Gets the total number of submissions (uploads) for a participant.
 */
export async function getTotalUploads(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error in getTotalUploads:', error);
    throw error;
  }
  return count || 0;
}

/**
 * Gets the total number of votes accumulated across all submissions of a participant.
 */
export async function getTotalVotes(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('votes')
    .select('id, submissions!inner(user_id)', { count: 'exact', head: true })
    .eq('submissions.user_id', userId);

  if (error) {
    console.error('Error in getTotalVotes:', error);
    throw error;
  }
  return count || 0;
}
