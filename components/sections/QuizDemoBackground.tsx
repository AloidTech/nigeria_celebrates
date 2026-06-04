"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, Medal, Gauge, ShieldCheck, ArrowRight } from "lucide-react";
import type { question, categories, difficulty_level } from "@/lib/database_types/quiz_types";

type DemoQuestion = question & {
  selectId: string; // The option ID the demo will automatically select
};

const demoQuestions: DemoQuestion[] = [
  {
    _id: "m1",
    question_text: "Which artist popularized the global breakout hit “One Dance”?",
    options: [
      { _id: "a", option_text: "Wizkid" },
      { _id: "b", option_text: "Olamide" },
      { _id: "c", option_text: "Burna Boy" },
      { _id: "d", option_text: "Flavour" },
    ],
    correct_option_id: "a",
    selectId: "a", // Correct selection
    explanation: "Wizkid was featured on “One Dance,” helping push the record into global pop culture.",
    difficulty: "easy" as difficulty_level,
    category: "music" as categories,
  },
  {
    _id: "f1",
    question_text: "Which movie franchise is best known for the character Ebere, the detective from Lagos?",
    options: [
      { _id: "a", option_text: "Living in Bondage" },
      { _id: "b", option_text: "The Figurine" },
      { _id: "c", option_text: "King of Boys" },
      { _id: "d", option_text: "Citation" },
    ],
    correct_option_id: "c",
    selectId: "a", // Wrong selection (selecting option A instead of C)
    explanation: "King of Boys is the correct pick for this crime-thriller style clue.",
    difficulty: "moderate" as difficulty_level,
    category: "movies" as categories,
  },
  {
    _id: "g3",
    question_text: "What is the fastest way to score bonus points in this quiz session?",
    options: [
      { _id: "a", option_text: "Skip every question" },
      { _id: "b", option_text: "Answer correctly on the first try" },
      { _id: "c", option_text: "Wait until time runs out" },
      { _id: "d", option_text: "Refresh the page" },
    ],
    correct_option_id: "b",
    selectId: "b", // Correct selection
    explanation: "Correct first attempts preserve your score and keep your streak active.",
    difficulty: "easy" as difficulty_level,
    category: "geography" as categories,
  },
];

export default function QuizDemoBackground() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [step, setStep] = useState<"idle" | "hovering" | "answered">("idle");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentQuestion = demoQuestions[currentIdx];

    if (step === "idle") {
      timer = setTimeout(() => {
        setSelectedId(currentQuestion.selectId);
        setStep("hovering");
      }, 1500);
    } else if (step === "hovering") {
      timer = setTimeout(() => {
        setIsAnswered(true);
        setStep("answered");
      }, 800);
    } else if (step === "answered") {
      timer = setTimeout(() => {
        setSelectedId(null);
        setIsAnswered(false);
        setStep("idle");
        setCurrentIdx((prev) => (prev + 1) % demoQuestions.length);
      }, 2500);
    }

    return () => clearTimeout(timer);
  }, [currentIdx, step]);

  const currentQuestion = demoQuestions[currentIdx];
  const totalQuestions = demoQuestions.length;
  const questionProgress = ((currentIdx + (isAnswered ? 1 : 0)) / totalQuestions) * 100;

  const correctOption = currentQuestion.options.find(
    (option) => option._id === currentQuestion.correct_option_id,
  );
  const selectedOption = currentQuestion.options.find(
    (option) => option._id === selectedId,
  );

  return (
    <div className="w-full opacity-35 pointer-events-none select-none blur-[1px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF4F0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1A3C2E]">
            <ShieldCheck className="h-4 w-4" />
            Demo Preview ({currentQuestion.category})
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
            {currentQuestion.question_text}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500 capitalize">
            Difficulty: {currentQuestion.difficulty}
          </p>
        </div>
      </div>

      <div className="mt-6 h-2 rounded-full bg-[#ECE8D9]">
        <div
          className="h-2 rounded-full bg-[#1A3C2E] transition-all duration-500"
          style={{ width: `${questionProgress}%` }}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {currentQuestion.options.map((option, index) => {
          const optionKey = String.fromCharCode(65 + index);
          const isSelected = selectedId === option._id;
          const isCorrect = option._id === currentQuestion.correct_option_id;
          const isWrongSelection = isAnswered && isSelected && !isCorrect;
          const showResolvedState = isAnswered && (isCorrect || isSelected);

          return (
            <div
              key={option._id}
              className={`flex min-h-24 items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                showResolvedState
                  ? isCorrect
                    ? "border-[#1A3C2E] bg-[#EEF4F0]"
                    : "border-[#E5E5E5] bg-[#F7F7F5]"
                  : isSelected
                    ? "border-[#1A3C2E] bg-[#F5FAF7] scale-102"
                    : "border-gray-200 bg-white"
              } ${isWrongSelection ? "ring-1 ring-[#D4A017]" : ""}`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  showResolvedState && isCorrect ? "bg-[#1A3C2E] text-white" : "bg-[#F0F0EC] text-[#1A1A1A]"
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

              {showResolvedState && isCorrect && (
                <CheckCircle2 className="mt-1 h-5 w-5 text-[#1A3C2E]" />
              )}
              {isWrongSelection && (
                <Circle className="mt-1 h-5 w-5 text-[#D4A017]" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-[24px] bg-[#F8F7F1] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A3C2E]">
              Round feedback
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {isAnswered
                ? selectedOption?._id === currentQuestion.correct_option_id
                  ? "Correct. You kept your streak alive."
                  : "Not quite. Review the explanation before moving on."
                : "Choose one answer and submit to lock in your score."}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Medal className="h-4 w-4 text-[#D4A017]" />
            +100 for each correct answer
          </div>
        </div>

        {isAnswered && (
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm transition-all duration-300">
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
              {selectedOption && (
                <span className="rounded-full bg-[#F8F7F1] px-3 py-1 font-medium text-gray-700">
                  Your pick: {selectedOption.option_text}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Gauge className="h-4 w-4 text-[#1A3C2E]" />
            Question {currentIdx + 1} of {totalQuestions}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-md bg-[#1A3C2E]/50 px-5 py-3 text-sm font-semibold text-white">
              Submit Answer
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#1A1A1A]/50">
              Next Question
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
