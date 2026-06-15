-- 1. Rename the existing enum type
ALTER TYPE challenge_category RENAME TO challenge_category_old;

-- 2. Create the new enum type with only the new categories
CREATE TYPE challenge_category AS ENUM (
    'Music / Songs',
    'Football Freestyle',
    'Basketball Freestyle',
    'Comedy Skits',
    'Artwork',
    'Hair Artistry',
    'Fashion Showcase',
    'My Nigeria Story (Short Film)',
    'Photography',
    'Tech Innovation',
    'Logo Design'
);

-- 3. Update the votes table to use the new type
-- We use a CASE statement to safely map any existing votes to a new category, or fallback to 'Artwork' if there's no direct match.
ALTER TABLE votes 
  ALTER COLUMN category TYPE challenge_category 
  USING (
    CASE category::text
      WHEN 'talent_tech' THEN 'Tech Innovation'
      WHEN 'talent_innovation' THEN 'Tech Innovation'
      WHEN 'talent_arts' THEN 'Artwork'
      WHEN 'talent_entertainment' THEN 'Music / Songs'
      WHEN 'talent_sports' THEN 'Football Freestyle'
      WHEN 'talent_leadership' THEN 'Tech Innovation'
      WHEN 'talent_entrepreneurship' THEN 'Tech Innovation'
      WHEN 'global_achiever' THEN 'Tech Innovation'
      WHEN 'corporate_economic' THEN 'Tech Innovation'
      WHEN 'talent_creativity' THEN 'Artwork'
      ELSE 'Artwork'
    END
  )::challenge_category;

-- 4. Drop the old enum type
DROP TYPE challenge_category_old;
