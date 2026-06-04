This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase Setup

1. Install dependencies (already installed in this workspace):

```bash
npm install @supabase/supabase-js @supabase/ssr
```

2. Add environment variables in `.env.local` (copy from `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Use the helper clients:

- Browser/client components: `lib/supabase/client.ts`
- Server components/route handlers: `lib/supabase/server.ts`

## Query Basics

### Server-side query (recommended for secure reads/writes)

```ts
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCategoryChampions } from "@/lib/supabase/queries";

export async function loadChampions() {
	const supabase = getSupabaseServerClient();
	return getCategoryChampions(supabase);
}
```

### Client-side query (for user-facing live data)

```ts
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function loadLiveLeaderboard() {
	const supabase = getSupabaseBrowserClient();

	const { data, error } = await supabase
		.from("leaderboard_entries")
		.select("quiz_id,user_id,score,rank")
		.order("score", { ascending: false })
		.limit(20);

	if (error) throw error;
	return data;
}
```

### SQL aggregation by category using `quiz_id`

Because `leaderboard_entries` stores `quiz_id`, category can be derived by joining to `quizzes`:

```sql
with per_user_category as (
	select
		q.category,
		le.user_id,
		max(le.score) as top_score
	from leaderboard_entries le
	join quizzes q on q.id = le.quiz_id
	group by q.category, le.user_id
), ranked as (
	select
		category,
		user_id,
		top_score,
		row_number() over (
			partition by category
			order by top_score desc
		) as rn
	from per_user_category
)
select category, user_id, top_score
from ranked
where rn = 1;
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
