export type talent_category = 
  | 'Music / Songs'
  | 'Football Freestyle'
  | 'Basketball Freestyle'
  | 'Comedy Skits'
  | 'Artwork'
  | 'Hair Artistry'
  | 'Fashion Showcase'
  | 'My Nigeria Story (Short Film)'
  | 'Photography'
  | 'Tech Innovation'
  | 'Logo Design';

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
