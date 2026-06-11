"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  Clapperboard,
  Globe2,
  Music2,
  Palette,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { QuestionWithOptions } from "@/lib/database_types/quiz_types";
import WeeklyQuizGameplay from "@/components/sections/WeeklyQuizGameplay";
import { useLiveWeeklyQuiz, getWeeklyQuestions } from "@/lib/supabase/queries";

type QuizCategory = "music" | "movies" | "geography" | "art";

type CategoryVisual = {
  displayLabel: string;
  tone: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  glowTopLeft: string;
  glowBottomRight: string;
  icon: LucideIcon;
};

const categoryVisuals: Record<QuizCategory, CategoryVisual> = {
  music: {
    displayLabel: "Music",
    tone: "from-amber-200 via-green-900 to-black",
    accent: "bg-[#D4A017]",
    badgeBg: "bg-[#D4A017]",
    badgeText: "text-[#1A1A1A]",
    glowTopLeft: "bg-[#D4A017]/10",
    glowBottomRight: "bg-emerald-500/10",
    icon: Music2,
  },
  movies: {
    displayLabel: "Movies",
    tone: "from-[#C97F52] via-[#5C2B15] to-[#1A0D08]",
    accent: "bg-[#C97F52]",
    badgeBg: "bg-[#C97F52]",
    badgeText: "text-white",
    glowTopLeft: "bg-[#C97F52]/10",
    glowBottomRight: "bg-[#5C2B15]/20",
    icon: Clapperboard,
  },
  geography: {
    displayLabel: "Geography",
    tone: "from-emerald-200 via-[#1A3C2E] to-zinc-950",
    accent: "bg-[#1A3C2E]",
    badgeBg: "bg-[#1A3C2E]",
    badgeText: "text-white",
    glowTopLeft: "bg-emerald-400/10",
    glowBottomRight: "bg-[#1A3C2E]/25",
    icon: Globe2,
  },
  art: {
    displayLabel: "Art",
    tone: "from-[#8B5E34] via-[#4A2D11] to-[#1A0A00]",
    accent: "bg-[#8B5E34]",
    badgeBg: "bg-[#8B5E34]",
    badgeText: "text-white",
    glowTopLeft: "bg-[#8B5E34]/15",
    glowBottomRight: "bg-[#4A2D11]/25",
    icon: Palette,
  },
};

const defaultVisual: CategoryVisual = {
  displayLabel: "General",
  tone: "from-[#0A2818] via-[#05140C] to-black",
  accent: "bg-[#D4A017]",
  badgeBg: "bg-[#D4A017]",
  badgeText: "text-[#1A1A1A]",
  glowTopLeft: "bg-[#D4A017]/10",
  glowBottomRight: "bg-emerald-500/10",
  icon: Trophy,
};

export default function WeeklyQuizPage() {
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { quizData, loading: quizLoading } = useLiveWeeklyQuiz();

  useEffect(() => {
    async function load() {
      if (quizLoading) {
        setIsLoading(true);
        return;
      }
      if (!quizData) {
        setIsLoading(false);
        return;
      }
      try {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) throw new Error("No supabase client!");

        setQuizId(quizData.id);

        // 2. Fetch questions for this weekly quiz category
        const { quizQuestions, err } = await getWeeklyQuestions(supabase);

        if (err) throw err;
        setQuestions(quizQuestions);
      } catch (err) {
        console.error("Failed to load weekly quiz:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [quizData, quizLoading]);

  // Derive the category of the weekly quiz if questions exist
  const derivedCategory = questions.length > 0 ? questions[0].category : null;
  const visual =
    (derivedCategory && categoryVisuals[derivedCategory as QuizCategory]) ||
    defaultVisual;
  const CategoryIcon = visual.icon;

  // Premium empty state if there are no weekly quiz questions
  if (!isLoading && questions.length === 0) {
    return (
      <main className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A]">
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-[28px] border border-[#E5E5E5] bg-white p-8 shadow-sm sm:p-12 min-h-[450px] flex flex-col justify-center items-center text-center relative overflow-hidden">
              {/* Subtle background decoration */}
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#F8F7F1]/50 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#EEF4F0]/40 blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-md flex flex-col items-center">
                {/* Icon display - glowing circles with trophy / clock icons */}
                <div className="relative flex items-center justify-center w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-[#F5FAF7] rounded-full animate-ping opacity-40 duration-1000" />
                  <div className="absolute inset-2 bg-[#EEF4F0] rounded-full" />
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white border border-[#E5E5E5] shadow-sm">
                    <Trophy className="h-8 w-8 text-[#D4A017]" />
                  </div>
                  {/* Small secondary overlay icon */}
                  <div className="absolute bottom-1 right-1 flex items-center justify-center w-7 h-7 rounded-full bg-[#1A3C2E] border border-white text-white shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[#D4A017] fill-current" />
                  </div>
                </div>

                <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                  No Active Weekly Quiz
                </h2>
                <p className="mt-4 text-sm leading-6 text-gray-500">
                  Our editors are currently curating the next official weekly trivia challenge. Check back shortly to test your knowledge and claim your rank!
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
                  <Link
                    href="/quiz"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A3C2E] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#142e23] shadow-md hover:shadow-lg active:scale-98"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go to Quiz Arena
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A]">
      <section className="px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#1A3C2E] hover:text-[#142e23] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quiz Arena
          </Link>

          <div className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${visual.tone} px-6 py-8 text-white shadow-[0_24px_80px_rgba(10,40,24,0.15)] sm:px-8 transition-all duration-500`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.12),transparent_25%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.05),transparent_20%)]" />

            {/* Ambient glows based on category */}
            <div className={`absolute -top-12 -left-12 w-64 h-64 rounded-full ${visual.glowTopLeft} blur-3xl pointer-events-none transition-all duration-500`} />
            <div className={`absolute -bottom-12 -right-12 w-64 h-64 rounded-full ${visual.glowBottomRight} blur-3xl pointer-events-none transition-all duration-500`} />

            <div className="relative max-w-2xl">
              <div className={`mb-4 inline-flex items-center gap-2 rounded-full ${visual.badgeBg} ${visual.badgeText} px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500`}>
                <CategoryIcon className="h-3.5 w-3.5 fill-current" />
                {visual.displayLabel} Edition - Weekly Arena
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Weekly Trivia Challenge
              </h1>
              <p className="mt-4 text-sm leading-6 text-white/70 sm:text-base">
                Compete against the community in this week&apos;s dedicated {visual.displayLabel.toLowerCase()} challenge. Answer these questions accurately to lock in your score on the live leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[28px] border border-[#E5E5E5] bg-white p-6 shadow-sm sm:p-8 min-h-[400px] flex flex-col justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-[#1A3C2E] border-gray-200" />
                <p className="text-xs font-semibold uppercase tracking-widest text-[#1A3C2E]">
                  Loading Weekly Quiz...
                </p>
              </div>
            ) : (
              <WeeklyQuizGameplay
                questions={questions}
                quizId={quizId || ""}
                onRestart={() => {
                  window.location.reload();
                }}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
