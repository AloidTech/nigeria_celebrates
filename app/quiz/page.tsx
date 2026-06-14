"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clapperboard,
  Crown,
  Globe2,
  Music2,
  Palette,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getShortQuizByCategory } from "@/lib/supabase/quizzes";
import type { QuizCategory } from "@/lib/supabase/quizzes";
import type { QuestionWithOptions } from "@/lib/database_types/quiz_types";

import ChampionCard from "@/components/ui/ChampionCard";
import RankCard from "@/components/ui/RankCard";
import CountdownFlipCard from "@/components/ui/CountdownFlipCard";
import CategoryCircleItem from "@/components/ui/CategoryCircleItem";
import QuizGameplay from "@/components/sections/QuizGameplay";
import QuizDemoBackground from "@/components/sections/QuizDemoBackground";

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
};

type LeaderboardEntry = {
  id: string;
  participantName: string;
  quizId: string;
  score: number;
};

type QuizMeta = {
  id: string;
  title: string;
  category: QuizCategory;
};

type CategoryChampionVisual = {
  displayLabel: string;
  tagline: string;
  tone: string;
  accent: string;
  icon: LucideIcon;
};

const weeklyQuizFallbackCountdown: CountdownParts = {
  days: 6,
  hours: 12,
  minutes: 0,
};

const leaderboard = [
  { rank: 1, name: "Amina T.", score: 480, streak: "8 streak" },
  { rank: 2, name: "Kelechi U.", score: 455, streak: "7 streak" },
  { rank: 3, name: "Sade O.", score: 430, streak: "6 streak" },
  { rank: 4, name: "You", score: 410, streak: "5 streak" },
  { rank: 5, name: "Bayo M.", score: 395, streak: "4 streak" },
] as const;

const leaderboardEntries: LeaderboardEntry[] = [
  {
    id: "le1",
    participantName: "Amina T.",
    quizId: "quiz_music_001",
    score: 480,
  },
  {
    id: "le2",
    participantName: "Kelechi U.",
    quizId: "quiz_music_001",
    score: 455,
  },
  {
    id: "le3",
    participantName: "Sade O.",
    quizId: "quiz_movies_001",
    score: 430,
  },
  { id: "le4", participantName: "You", quizId: "quiz_movies_001", score: 410 },
  {
    id: "le5",
    participantName: "Bayo M.",
    quizId: "quiz_geography_001",
    score: 395,
  },
  {
    id: "le6",
    participantName: "Nneka J.",
    quizId: "quiz_geography_001",
    score: 442,
  },
  { id: "le7", participantName: "Tobi L.", quizId: "quiz_art_001", score: 421 },
  { id: "le8", participantName: "Musa P.", quizId: "quiz_art_001", score: 404 },
];

const quizzes: QuizMeta[] = [
  { id: "quiz_music_001", title: "Afrobeats Weekly", category: "music" },
  { id: "quiz_movies_001", title: "Nollywood Weekly", category: "movies" },
  {
    id: "quiz_geography_001",
    title: "Nigeria Geography Sprint",
    category: "geography",
  },
  { id: "quiz_art_001", title: "Naija Art Spotlight", category: "art" },
];

const categoryOrder: QuizCategory[] = ["music", "movies", "geography", "art"];

const categoryChampionVisuals: Record<QuizCategory, CategoryChampionVisual> = {
  music: {
    displayLabel: "Music",
    tagline: "Afrobeats Champion",
    tone: "from-amber-200 via-green-900 to-black",
    accent: "bg-[#D4A017]",
    icon: Music2,
  },
  movies: {
    displayLabel: "Movies",
    tagline: "Screen Legend",
    tone: "from-emerald-700 via-emerald-900 to-stone-950",
    accent: "bg-[#C97F52]",
    icon: Clapperboard,
  },
  geography: {
    displayLabel: "Geography",
    tagline: "Map Master",
    tone: "from-zinc-100 via-emerald-200 to-zinc-300",
    accent: "bg-[#1A3C2E]",
    icon: Globe2,
  },
  art: {
    displayLabel: "Art",
    tagline: "Creative Icon",
    tone: "from-emerald-100 via-stone-100 to-zinc-300",
    accent: "bg-[#8B5E34]",
    icon: Palette,
  },
};

function getCountdownParts(targetDate: Date) {
  const remainingMs = Math.max(0, targetDate.getTime() - Date.now());
  const totalMinutes = Math.floor(remainingMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes } satisfies CountdownParts;
}

export default function QuizPage() {
  const [overlayState, setOverlayState] = useState<
    "start" | "category" | "none" | "upcoming"
  >("start");
  const [activeCategory, setActiveCategory] = useState<QuizCategory | null>(
    null,
  );
  const [loadedQuestions, setLoadedQuestions] = useState<QuestionWithOptions[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [nextWeeklyQuizRemaining, setNextWeeklyQuizRemaining] =
    useState<CountdownParts>(weeklyQuizFallbackCountdown);

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 6);
    targetDate.setHours(18, 0, 0, 0);

    const timerId = window.setInterval(() => {
      setNextWeeklyQuizRemaining(getCountdownParts(targetDate));
    }, 1000);

    setNextWeeklyQuizRemaining(getCountdownParts(targetDate));

    return () => window.clearInterval(timerId);
  }, []);

  async function handleSelectCategory(category: QuizCategory) {
    setActiveCategory(category);
    setIsLoadingQuestions(true);

    try {
      const supabase = getSupabaseBrowserClient()!;
      if (!supabase) throw new Error("No supabase client!");

      const fetched = await getShortQuizByCategory(supabase, category);

      if (fetched && fetched.length > 0) {
        setLoadedQuestions(fetched);
        setOverlayState("none");
      } else {
        setOverlayState("upcoming");
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      setOverlayState("upcoming");
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  const quizCategoryById = quizzes.reduce(
    (accumulator, quiz) => {
      accumulator[quiz.id] = quiz.category;
      return accumulator;
    },
    {} as Record<string, QuizCategory>,
  );

  const topByCategory = leaderboardEntries.reduce(
    (accumulator, entry) => {
      const category = quizCategoryById[entry.quizId];

      if (!category) {
        return accumulator;
      }

      const currentTopEntry = accumulator[category];

      if (!currentTopEntry || entry.score > currentTopEntry.score) {
        accumulator[category] = entry;
      }

      return accumulator;
    },
    {} as Partial<Record<QuizCategory, LeaderboardEntry>>,
  );

  const categoryRankings = categoryOrder.map((category) => {
    const visual = categoryChampionVisuals[category];
    const topEntry = topByCategory[category];

    return {
      name: topEntry ? topEntry.participantName : "Awaiting Results",
      tagline: topEntry
        ? `${visual.tagline} - ${topEntry.score} pts`
        : `${visual.tagline} - no score yet`,
      rank: "#1",
      tone: visual.tone,
      accent: visual.accent,
      icon: visual.icon,
      categoryLabel: visual.displayLabel,
    };
  });

  return (
    <main className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A]">
      <section className="px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.45fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[28px] bg-[#0A2818] px-6 py-8 text-white shadow-[0_24px_80px_rgba(10,40,24,0.15)] sm:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_78%_18%,rgba(212,160,23,0.12),transparent_16%),linear-gradient(180deg,rgba(10,40,24,0.72),rgba(10,40,24,0.86))]" />
            <div className="relative max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#D4A017] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                <Sparkles className="h-3.5 w-3.5 fill-current" />
                Live participant quiz
              </div>
              <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
                Find out how well you know Nigeria.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                Test your knowledge against others in competitive weekly quizzes
                and earn a spot on the leaderboard.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E5E5E5] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A3C2E]">
                  Next Weekly Quiz
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Flip through the countdown and join the next round when it
                  opens.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {nextWeeklyQuizRemaining.days > 0 && (
                  <CountdownFlipCard
                    value={String(nextWeeklyQuizRemaining.days).padStart(
                      2,
                      "0",
                    )}
                    label="Days"
                  />
                )}
                <CountdownFlipCard
                  value={String(nextWeeklyQuizRemaining.hours).padStart(2, "0")}
                  label="Hours"
                />
                <CountdownFlipCard
                  value={String(nextWeeklyQuizRemaining.minutes).padStart(
                    2,
                    "0",
                  )}
                  label="Minutes"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-[#F8F7F1] px-4 py-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A3C2E]">
                    Weekly Arena
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Compete on the official weekly stage.
                  </p>
                </div>

                <Link
                  href="/quiz/weekly"
                  className="inline-flex items-center justify-center rounded-md bg-[#1A3C2E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#142e23]"
                >
                  Join Weekly
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.55fr_0.9fr]">
          <div
            id="quiz-play"
            className="relative min-h-[520px] overflow-hidden rounded-[28px] border border-[#E5E5E5] bg-white p-6 shadow-sm sm:p-8 flex flex-col justify-center"
          >
            {/* Backdrop Blur Overlay */}
            {overlayState !== "none" && (
              <>
                {/* Auto-playing demo background visible behind glass overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none select-none p-6 sm:p-8 overflow-hidden">
                  <QuizDemoBackground />
                </div>

                {/* Transparent and blurred overlay */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-800/55 backdrop-blur-[3px] p-6 text-center transition-all duration-300">
                  {overlayState === "start" && (
                    <div className="relative z-10 max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-500">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#D4A017]">
                        <Sparkles className="h-4 w-4 fill-current text-[#D4A017]" />
                        Challenge Awaits
                      </div>
                      <h2 className="text-4xl font-black text-white sm:text-5xl leading-none">
                        Your Next
                      </h2>
                      <p className="text-sm text-white/70 sm:text-base">
                        Select your pathway to test your knowledge of
                        Nigeria&apos;s music, film, geography, and art.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setOverlayState("category")}
                          className="btn-animated w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#0A2818] shadow-lg hover:bg-white/95  transition-all duration-200"
                        >
                          Short Quiz
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <Link
                          href="/quiz/weekly"
                          className="btn-animated w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 hover:border-white/40 hover:scale-102 transition-all duration-200"
                        >
                          Weekly Quiz
                        </Link>
                      </div>
                    </div>
                  )}

                  {overlayState === "category" && (
                    <div className="relative z-10 w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-400">
                      <button
                        type="button"
                        onClick={() => setOverlayState("start")}
                        className="absolute left-0 -top-12 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>

                      <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white sm:text-4xl">
                          Select Category
                        </h2>
                        <p className="text-sm text-white/75 max-w-md mx-auto">
                          Pick a topic below to fetch your short quiz session
                          questions.
                        </p>
                      </div>

                      {isLoadingQuestions ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-4 text-white">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-[#D4A017] border-white/20" />
                          <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A017]">
                            Loading Quiz...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-4 overflow-x-auto">
                          {categoryOrder.map((cat) => {
                            const visual = categoryChampionVisuals[cat];
                            return (
                              <CategoryCircleItem
                                key={cat}
                                category={cat}
                                displayLabel={visual.displayLabel}
                                icon={visual.icon}
                                onClick={() => handleSelectCategory(cat)}
                                isSelected={activeCategory === cat}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {overlayState === "upcoming" && (
                    <div className="relative z-10 w-full max-w-2xl space-y-8 animate-in fade-in zoom-in-95 duration-400">
                      <button
                        type="button"
                        onClick={() => setOverlayState("category")}
                        className="absolute left-0 -top-12 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Categories
                      </button>

                      <div className="space-y-4 pt-4 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D4A017] mb-2">
                          <Crown className="h-4 w-4 fill-current text-[#D4A017]" />
                          Coming Soon
                        </div>
                        <h2 className="text-3xl font-black text-white sm:text-4xl">
                          No Active Questions
                        </h2>
                        <p className="text-sm text-white/75 max-w-md mx-auto leading-relaxed">
                          Our editors are currently curating the next official short trivia challenge for this category. Check back shortly!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Quiz Gameplay Screen */}
            {overlayState === "none" && (
              <QuizGameplay
                questions={loadedQuestions}
                quizType="short_quiz"
                onRestart={() => {
                  setOverlayState("start");
                  setActiveCategory(null);
                }}
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#E5E5E5] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1A3C2E]">
                <Crown className="h-4 w-4 text-[#D4A017]" />
                Live leaderboard
              </div>
              <h3 className="mt-3 text-2xl font-bold text-[#1A1A1A]">
                Stay ahead of the pack.
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                This is the participant leaderboard preview. Results update as
                you continue answering.
              </p>

              <div className="mt-6 space-y-3">
                {leaderboard.map((entry) => {
                  const isCurrentPlayer = entry.name === "You";

                  return (
                    <RankCard
                      key={entry.rank}
                      rank={entry.rank}
                      name={entry.name}
                      score={entry.score}
                      streak={entry.streak}
                      isCurrentPlayer={isCurrentPlayer}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-[#E5E5E5] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1A3C2E]">
                <Crown className="h-4 w-4 text-[#D4A017]" />
                Category rank display
              </div>
              <h3 className="mt-3 text-2xl font-bold text-[#1A1A1A]">
                Category champions
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Each category shows the current #1 participant based on the
                highest score from leaderboard entries.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto pb-2">
            <div className="flex gap-4 pr-12 sm:pr-20 lg:pr-40">
              {categoryRankings.map((ranking) => (
                <div key={ranking.categoryLabel} className="min-w-0">
                  <ChampionCard
                    name={ranking.name}
                    tagline={`${ranking.categoryLabel}: ${ranking.tagline}`}
                    rank={ranking.rank}
                    tone={ranking.tone}
                    accent={ranking.accent}
                    icon={ranking.icon}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-[#1A3C2E]">
              Round pacing
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Questions are presented one at a time with a fixed rhythm so
              players can focus on speed and accuracy.
            </p>
          </div>
          <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-[#1A3C2E]">
              Instant feedback
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Correct answers reveal explanations immediately, keeping the
              gameplay loop readable and satisfying.
            </p>
          </div>
          <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-[#1A3C2E]">
              Leaderboard flow
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Your position updates as you move through the session, giving the
              participant a clear sense of progress.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
