"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Crown,
  Gauge,
  Eye,
} from "lucide-react";
import type { QuestionWithOptions } from "@/lib/database_types/quiz_types";
import { QuizOptionButton, QuizExplanationCard } from "./QuizSharedComponents";

type QuizGameplayProps = {
  questions: QuestionWithOptions[];
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
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  const totalQuestions = questions.length;

  if (totalQuestions === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-500">No questions loaded. Please select a category to begin.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  const progressCount = isReviewMode 
    ? currentQuestionIndex + 1 
    : currentQuestionIndex + (isAnswered ? 1 : 0);
    
  const questionProgress = Math.min((progressCount / totalQuestions) * 100, 100);
  
  const accuracy = totalQuestions > 0 ? Math.round((score / (totalQuestions * 100)) * 100) : 0;

  function handleOptionSelect(optionId: string) {
    if (isAnswered || quizCompleted || isReviewMode) {
      return;
    }
    setSelectedOptionId(optionId);
  }

  function handleSubmitAnswer() {
    if (!selectedOptionId || isAnswered || quizCompleted || isReviewMode) {
      return;
    }

    if (selectedOptionId === currentQuestion.correct_option_id) {
      setScore((currentScore) => currentScore + 100);
    }
    
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: selectedOptionId }));
    setIsAnswered(true);
  }

  function handleNextQuestion() {
    if ((!isAnswered && !isReviewMode) || (quizCompleted && !isReviewMode)) {
      return;
    }

    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

    if (isLastQuestion) {
      if (!isReviewMode) {
        setQuizCompleted(true);
      }
      return;
    }

    const nextIdx = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIdx);
    
    if (isReviewMode) {
       setSelectedOptionId(userAnswers[nextIdx] || null);
       setIsAnswered(true);
    } else {
       setSelectedOptionId(null);
       setIsAnswered(false);
    }
  }

  function handlePrevQuestion() {
     if (!isReviewMode || currentQuestionIndex === 0) return;
     const prevIdx = currentQuestionIndex - 1;
     setCurrentQuestionIndex(prevIdx);
     setSelectedOptionId(userAnswers[prevIdx] || null);
     setIsAnswered(true);
  }

  function handleStartReview() {
    setIsReviewMode(true);
    setCurrentQuestionIndex(0);
    setIsAnswered(true);
    setSelectedOptionId(userAnswers[0] || null);
  }

  function handleBackToResults() {
    setIsReviewMode(false);
    // keep quizCompleted true
  }

  function handleReset() {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setIsReviewMode(false);
    setUserAnswers({});
    if (onRestart) {
      onRestart();
    }
  }

  const selectedOption = currentQuestion.options.find(
    (option) => option.id === selectedOptionId,
  );
  const correctOption = currentQuestion.options.find(
    (option) => option.id === currentQuestion.correct_option_id,
  );

  const maxScore = totalQuestions * 100;
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const resultRank =
    pct >= 80 ? "Top 5%" : pct >= 60 ? "Top 15%" : "Top 30%";

  return (
    <div className="w-full transition-all duration-300">
      {quizCompleted && !isReviewMode ? (
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
              your score or review the answers you submitted.
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
              <button
                type="button"
                onClick={handleStartReview}
                className="inline-flex items-center gap-2 rounded-md border border-[#D8D8D8] bg-white px-5 py-3 text-sm font-bold text-[#1A1A1A] transition hover:border-[#1A3C2E] hover:bg-[#FAFAF8]"
              >
                <Eye className="h-4 w-4" />
                Review Answers
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
              {isReviewMode && (
                 <div className="inline-flex items-center gap-2 rounded-full bg-[#1A3C2E] px-3 py-1 mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                   <Eye className="h-4 w-4" />
                   Review Mode
                 </div>
              )}
              <h2 className="mt-2 text-2xl font-bold text-[#1A1A1A] sm:text-xl">
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
              const isSelected = selectedOptionId === option.id;
              const isCorrect = option.id === currentQuestion.correct_option_id;
              const isWrongSelection = isAnswered && isSelected && !isCorrect;
              const showResolvedState = isAnswered && (isCorrect || isSelected);

              return (
                <QuizOptionButton
                  key={option.id}
                  option={option}
                  optionKey={optionKey}
                  isSelected={isSelected}
                  isCorrect={isCorrect}
                  isAnswered={isAnswered}
                  isWrongSelection={isWrongSelection}
                  showResolvedState={showResolvedState}
                  onClick={() => handleOptionSelect(option.id)}
                />
              );
            })}
          </div>

          {isAnswered && (
            <QuizExplanationCard
              explanation={currentQuestion.explanation || ""}
              correctOptionText={correctOption?.option_text}
              selectedOptionText={selectedOption?.option_text}
            />
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Gauge className="h-4 w-4 text-[#1A3C2E]" />
              Question {Math.min(currentQuestionIndex + 1, totalQuestions)} of {totalQuestions}
            </div>

            <div className="flex flex-wrap gap-3">
              {!isReviewMode ? (
                <>
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOptionId || isAnswered}
                    className="quiz-btn-primary"
                  >
                    Submit Answer
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={!isAnswered}
                    className="quiz-btn-secondary"
                  >
                    {currentQuestionIndex >= totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="quiz-btn-secondary"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="quiz-btn-secondary"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBackToResults}
                      className="quiz-btn-primary bg-[#D4A017] hover:bg-[#b8860b]"
                    >
                      Back to Results
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
