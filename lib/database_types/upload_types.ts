export type talent_category = 
  | 'talent_tech'
  | 'talent_arts'
  | 'talent_entertainment'
  | 'talent_innovation'
  | 'talent_sports'
  | 'talent_leadership'
  | 'talent_entrepreneurship'
  | 'talent_creativity'
  | 'global_achiever'
  | 'corporate_economic';

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

export type LiveSubmissionWithVotes = Submission & {
  total_votes: number;
};
