"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Crown,
  Gauge,
  Medal,
  ShieldCheck,
} from "lucide-react";
import type { question } from "@/lib/database_types/quiz_types";

type QuizGameplayProps = {
  questions: question[];
  quizType: "short_quiz" | "weekly";
  onRestart?: () => void;
};

export default function QuizGameplay({
  questions,
  quizType,
  onRestart,
}: QuizGameplayProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const totalQuestions = questions.length;

  if (totalQuestions === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-500">No questions loaded. Please select a category to begin.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = currentQuestionIndex + (isAnswered ? 1 : 0);
  const questionProgress = Math.min(
    (answeredQuestions / totalQuestions) * 100,
    100,
  );
  const accuracy =
    answeredQuestions > 0 ? Math.round((score / answeredQuestions) * 100) : 0;

  function handleOptionSelect(optionId: string) {
    if (isAnswered || quizCompleted) {
      return;
    }
    setSelectedOptionId(optionId);
  }

  function handleSubmitAnswer() {
    if (!selectedOptionId || isAnswered || quizCompleted) {
      return;
    }

    if (selectedOptionId === currentQuestion.correct_option_id) {
      setScore((currentScore) => currentScore + 100);
    }

    setIsAnswered(true);
  }

  function handleNextQuestion() {
    if (!isAnswered || quizCompleted) {
      return;
    }

    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

    if (isLastQuestion) {
      setQuizCompleted(true);
      return;
    }

    setCurrentQuestionIndex((currentIndex) => currentIndex + 1);
    setSelectedOptionId(null);
    setIsAnswered(false);
  }

  function handleReset() {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    if (onRestart) {
      onRestart();
    }
  }

  const selectedOption = currentQuestion.options.find(
    (option) => option._id === selectedOptionId,
  );
  const correctOption = currentQuestion.options.find(
    (option) => option._id === currentQuestion.correct_option_id,
  );

  const maxScore = totalQuestions * 100;
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const resultRank =
    pct >= 80 ? "Top 5%" : pct >= 60 ? "Top 15%" : "Top 30%";

  return (
    <div className="w-full transition-all duration-300">
      {quizCompleted ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF4F0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1A3C2E]">
              <CheckCircle2 className="h-4 w-4" />
              Quiz complete
            </div>
            <h2 className="mt-4 text-3xl font-bold text-[#1A1A1A]">
              You finished the session!
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
              Your final summary is ready. Restart the round to improve
              your score or review the leaderboard to see where you stand.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#F8F7F1] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Final Score
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
                  Rank Range
                </div>
                <div className="mt-2 text-3xl font-bold text-[#1A1A1A]">
                  {resultRank}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-md bg-[#1A3C2E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#142e23]"
              >
                Play Again
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/quiz/weekly"
                className="inline-flex items-center gap-2 rounded-md border border-[#D8D8D8] bg-white px-5 py-3 text-sm font-bold text-[#1A1A1A] transition hover:border-[#1A3C2E] hover:bg-[#FAFAF8]"
              >
                Try Weekly Quiz
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] bg-[#0A2818] p-5 text-white shadow-lg shadow-[#0A2818]/10">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#D4A017]">
              <Crown className="h-4 w-4" />
              Result highlight
            </div>
            <div className="mt-4 text-4xl font-bold">{score}</div>
            <p className="mt-2 text-sm text-white/70">
              You&apos;re currently projected to land in the {resultRank} band based on this session.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Correct answers</span>
                <span className="font-semibold">
                  {score / 100} / {totalQuestions}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Quiz Type</span>
                <span className="font-semibold capitalize">{quizType.replace("_", " ")}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>

              <h2 className="mt-4 text-2xl font-bold text-[#1A1A1A] sm:text-xl">
                {currentQuestion.question_text}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                {currentQuestion.context}
              </p>
            </div>
          </div>

          <div className="mt-6 h-2 rounded-full bg-[#ECE8D9]">
            <div
              className="h-2 rounded-full bg-[#1A3C2E] transition-all duration-300"
              style={{ width: `${questionProgress}%` }}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {currentQuestion.options.map((option, index) => {
              const optionKey = String.fromCharCode(65 + index);
              const isSelected = selectedOptionId === option._id;
              const isCorrect = option._id === currentQuestion.correct_option_id;
              const isWrongSelection =
                isAnswered && isSelected && !isCorrect;
              const showResolvedState =
                isAnswered && (isCorrect || isSelected);

              return (
                <button
                  key={option._id}
                  type="button"
                  onClick={() => handleOptionSelect(option._id)}
                  disabled={isAnswered}
                  className={`flex min-h-22 items-start gap-4 rounded-2xl border p-4 text-left transition ${showResolvedState
                    ? isCorrect
                      ? "border-[#1A3C2E] bg-[#EEF4F0]"
                      : "border-[#E5E5E5] bg-[#F7F7F5]"
                    : isSelected
                      ? "border-[#1A3C2E] bg-[#F5FAF7]"
                      : "border-[#E5E5E5] bg-white hover:border-[#CFCFCF] hover:bg-[#FAFAF8]"
                    } ${isWrongSelection ? "ring-1 ring-[#D4A017]" : ""} ${isAnswered ? "cursor-default" : ""}`}
                  aria-pressed={isSelected}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${showResolvedState && isCorrect ? "bg-[#1A3C2E] text-white" : "bg-[#F0F0EC] text-[#1A1A1A]"
                      }`}
                  >
                    {showResolvedState && isCorrect ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      optionKey
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Option {optionKey}
                      </div>
                      {showResolvedState && isCorrect ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#1A3C2E] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                          Correct
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-base font-semibold leading-6 text-[#1A1A1A]">
                      {option.option_text}
                    </p>
                  </div>

                  {showResolvedState && isCorrect ? (
                    <CheckCircle2 className="mt-1 h-5 w-5 text-[#1A3C2E]" />
                  ) : null}
                  {isWrongSelection ? (
                    <Circle className="mt-1 h-5 w-5 text-[#D4A017]" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] bg-[#F8F7F1] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A3C2E]">
                  Round feedback
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Medal className="h-4 w-4 text-[#D4A017]" />
                +100 for each correct answer
              </div>
            </div>

            {isAnswered && (
              <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Explanation
                </div>
                <p className="mt-2 text-sm leading-6 text-[#1A1A1A]">
                  {currentQuestion.explanation}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-[#EEF4F0] px-3 py-1 font-medium text-[#1A3C2E]">
                    Answer: {correctOption?.option_text}
                  </span>
                  {selectedOption ? (
                    <span className="rounded-full bg-[#F8F7F1] px-3 py-1 font-medium text-gray-700">
                      Your pick: {selectedOption.option_text}
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Gauge className="h-4 w-4 text-[#1A3C2E]" />
                Question {Math.min(currentQuestionIndex + 1, totalQuestions)} of {totalQuestions}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId || isAnswered}
                  className="inline-flex items-center gap-2 rounded-md bg-[#1A3C2E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#142e23] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit Answer
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!isAnswered}
                  className="inline-flex items-center gap-2 rounded-md border border-[#D8D8D8] bg-white px-5 py-3 text-sm font-semibold text-[#1A1A1A] transition hover:border-[#1A3C2E] hover:bg-[#FAFAF8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {currentQuestionIndex >= totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
