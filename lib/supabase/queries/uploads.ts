import type { SupabaseClient } from '@supabase/supabase-js';
import { Submission, LiveSubmissionWithVotes, talent_category } from '@/lib/database_types/upload_types';

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

/**
 * Retrieves all live (approved) submissions with their vote totals from the database view.
 */
export async function getLiveSubmissionsWithVotes(supabase: SupabaseClient): Promise<LiveSubmissionWithVotes[]> {
  const { data, error } = await supabase
    .from('live_submissions_with_votes')
    .select('*');

  if (error) {
    console.error('Error in getLiveSubmissionsWithVotes:', error);
    throw error;
  }
  return (data || []) as LiveSubmissionWithVotes[];
}

/**
 * Casts a vote on a specific submission. Follows Option B logic by first deleting any existing
 * vote by this user on this submission, then inserting the new vote.
 */
export async function castVote(
  supabase: SupabaseClient,
  submissionId: string,
  userId: string,
  voteType: boolean,
  category: talent_category
): Promise<void> {
  // Translate boolean to integer logic (true = upvote, false = downvote)
  const voteValue = voteType ? 1 : -1;

  const queryPayload = {
    submission_id: submissionId,
    user_id: userId,
    vote_type: voteValue,
    category,
    created_at: new Date().toISOString() // Updates the timestamp
  };

  // Log the query object per user request
  console.log("Voting Query Payload (Upsert):", queryPayload);

  // Use upsert to handle inserts and updates atomically based on user_id + submission_id constraint
  const { error } = await supabase
    .from('votes')
    .upsert(queryPayload, { onConflict: 'submission_id,user_id' });

  if (error) {
    console.error('Error casting vote (upsert):', error);
    throw error;
  }
}

/**
 * Removes any existing vote by this user on this submission.
 */
export async function removeVote(
  supabase: SupabaseClient,
  submissionId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('votes')
    .delete()
    .match({ submission_id: submissionId, user_id: userId });

  if (error) {
    console.error('Error removing vote:', error);
    throw error;
  }
}
