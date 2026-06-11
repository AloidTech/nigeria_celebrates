"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Crown,
  Gauge,
  Medal,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { QuestionWithOptions } from "@/lib/database_types/quiz_types";
import { QuizOptionButton, QuizExplanationCard } from "./QuizSharedComponents";

type WeeklyQuizGameplayProps = {
  questions: QuestionWithOptions[];
  quizId: string;
  onRestart?: () => void;
};

export default function WeeklyQuizGameplay({
  questions,
  quizId,
  onRestart,
}: WeeklyQuizGameplayProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentSlide, setCurrentSlide] = useState<"questions" | "results" | "review" | "next_category">("questions");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize/Start a session in Supabase on mount
  useEffect(() => {
    async function initSession() {
      setLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.warn("User not authenticated, starting session locally");
          return;
        }

        // Call the RPC helper to start a session and get a sessionId
        const { data: newSessionId, error } = await supabase.rpc("start_quiz_session", {
          p_user_id: user.id,
          p_quiz_id: quizId,
        });

        if (error) throw error;
        setSessionId(newSessionId);
      } catch (err) {
        console.error("Failed to start weekly quiz session", err);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [quizId]);

  if (totalQuestions === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-500">No questions loaded.</p>
      </div>
    );
  }

  // Handle option selection locally (exam style)
  function handleOptionSelect(optionId: string) {
    if (currentSlide !== "questions") return;
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  }

  // Submit all answers to the database at once (Grading)
  async function handleSubmitExam() {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      
      // Calculate score and accuracy on client for quick local state update
      let correctCount = 0;
      questions.forEach((q) => {
        if (selectedOptions[q.id] === q.correct_option_id) {
          correctCount++;
        }
      });
      const calculatedScore = correctCount * 100;
      const calculatedAccuracy = Math.round((correctCount / totalQuestions) * 100);

      setScore(calculatedScore);
      setAccuracy(calculatedAccuracy);

      if (sessionId) {
        // 1. Submit answers to session_questions
        const answersToInsert = Object.entries(selectedOptions).map(([qId, optId]) => ({
          session_id: sessionId,
          question_id: qId,
          selected_option_id: optId,
        }));

        if (answersToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from("session_questions")
            .insert(answersToInsert);
          if (insertError) throw insertError;
        }

        // 2. Complete the session to trigger DB automated grading & leaderboard update
        const { error: updateError } = await supabase
          .from("quiz_sessions")
          .update({ status: "completed" })
          .eq("id", sessionId);

        if (updateError) throw updateError;
      }

      setCurrentSlide("results");
    } catch (err) {
      console.error("Failed to submit exam", err);
      alert("Error submitting quiz. Results saved locally.");
      setCurrentSlide("results");
    } finally {
      setLoading(false);
    }
  }

  const resultRank = accuracy >= 80 ? "Top 5%" : accuracy >= 60 ? "Top 15%" : "Top 30%";

  return (
    <div className="w-full transition-all duration-300">
      {/* -------------------------------------------------- */}
      {/* SLIDE 1: QUESTIONS (EXAM MODE)                     */}
      {/* -------------------------------------------------- */}
      {currentSlide === "questions" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="mt-4 text-2xl font-bold text-[#1A1A1A] sm:text-xl">
                {currentQuestion.question_text}
              </h2>
              {currentQuestion.context && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                  {currentQuestion.context}
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 h-2 rounded-full bg-[#ECE8D9]">
            <div
              className="h-2 rounded-full bg-[#1A3C2E] transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Options */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {currentQuestion.options.map((option, index) => {
              const optionKey = String.fromCharCode(65 + index);
              const isSelected = selectedOptions[currentQuestion.id] === option.id;

              return (
                <QuizOptionButton
                  key={option.id}
                  option={option}
                  optionKey={optionKey}
                  isSelected={isSelected}
                  isAnswered={false}
                  showResolvedState={false}
                  onClick={() => handleOptionSelect(option.id)}
                />
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Gauge className="h-4 w-4 text-[#1A3C2E]" />
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="quiz-btn-secondary"
              >
                Previous
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="quiz-btn-primary"
                >
                  Next Question
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  disabled={loading}
                  className="quiz-btn-primary bg-yellow-600 hover:bg-yellow-700"
                >
                  {loading ? "Submitting..." : "Submit Exam"}
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* -------------------------------------------------- */}
      {/* SLIDE 2: RESULTS DISPLAY                           */}
      {/* -------------------------------------------------- */}
      {currentSlide === "results" && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF4F0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1A3C2E]">
              <CheckCircle2 className="h-4 w-4 text-[#D4A017]" />
              Exam Submitted Successfully
            </div>
            <h2 className="mt-4 text-3xl font-bold text-[#1A1A1A]">
              Weekly Round Complete!
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
              Your exam has been graded. Review the detailed answers sheet to check where you made mistakes or advance to preview next week's edition.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#F8F7F1] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Total Score
                </div>
                <div className="mt-2 text-3xl font-bold text-[#1A1A1A]">
                  {score}
                </div>
              </div>
              <div className="rounded-2xl bg-[#F8F7F1] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Accuracy
                </div>
                <div className="mt-2 text-3xl font-bold text-[#1A1A1A]">
                  {accuracy}%
                </div>
              </div>
              <div className="rounded-2xl bg-[#F8F7F1] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Rank Band
                </div>
                <div className="mt-2 text-3xl font-bold text-[#1A1A1A]">
                  {resultRank}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setCurrentSlide("review");
                }}
                className="quiz-btn-primary"
              >
                Review Marked Answers
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-[24px] bg-[#0A2818] p-5 text-white shadow-lg shadow-[#0A2818]/10">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#D4A017]">
              <Crown className="h-4 w-4" />
              Result highlight
            </div>
            <div className="mt-4 text-4xl font-bold">{score}</div>
            <p className="mt-2 text-sm text-white/70">
              You correctly answered {score / 100} out of {totalQuestions} questions in this week's edition.
            </p>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* SLIDE 3: REVIEW MODE (MARKED SHEETS)              */}
      {/* -------------------------------------------------- */}
      {currentSlide === "review" && (
        <>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F7F1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-650 mb-3">
            Reviewing Exam Sheet
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] sm:text-xl">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Options in Review Mode */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {currentQuestion.options.map((option, index) => {
              const optionKey = String.fromCharCode(65 + index);
              const isSelected = selectedOptions[currentQuestion.id] === option.id;
              const isCorrect = option.id === currentQuestion.correct_option_id;
              const isWrongSelection = isSelected && !isCorrect;

              return (
                <QuizOptionButton
                  key={option.id}
                  option={option}
                  optionKey={optionKey}
                  isSelected={isSelected}
                  isCorrect={isCorrect}
                  isAnswered={true}
                  isWrongSelection={isWrongSelection}
                  showResolvedState={true}
                  onClick={() => {}}
                />
              );
            })}
          </div>

          {/* Explanation Card */}
          <QuizExplanationCard
            explanation={currentQuestion.explanation || "No explanation provided."}
            correctOptionText={currentQuestion.options.find(o => o.id === currentQuestion.correct_option_id)?.option_text}
            selectedOptionText={currentQuestion.options.find(o => o.id === selectedOptions[currentQuestion.id])?.option_text}
          />

          {/* Review Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Gauge className="h-4 w-4 text-[#1A3C2E]" />
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="quiz-btn-secondary"
              >
                Previous
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="quiz-btn-primary"
                >
                  Next Question
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentSlide("next_category")}
                  className="quiz-btn-primary bg-yellow-600 hover:bg-yellow-700"
                >
                  Finish Review
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* -------------------------------------------------- */}
      {/* SLIDE 4: NEXT WEEKLY QUIZ CATEGORY                 */}
      {/* -------------------------------------------------- */}
      {currentSlide === "next_category" && (
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto min-h-[350px]">
          <div className="relative flex items-center justify-center w-20 h-20 mb-6 bg-[#EEF4F0] rounded-full">
            <Trophy className="h-10 w-10 text-[#D4A017]" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-[#D4A017] fill-current" />
          </div>

          <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
            You're All Caught Up!
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Check the leaderboard to see your official rank standings, or head back to the Quiz Arena to play the general trivia games.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link
              href="/quiz#leaderboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A3C2E] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#142e23] shadow-md hover:shadow-lg active:scale-98"
            >
              View Leaderboard
              <Crown className="h-4 w-4 text-[#D4A017] fill-current" />
            </Link>
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8D8D8] bg-white px-6 py-3 text-sm font-bold text-[#1A1A1A] transition hover:border-[#1A3C2E] hover:bg-[#FAFAF8] active:scale-98"
            >
              Back to Quiz Arena
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
