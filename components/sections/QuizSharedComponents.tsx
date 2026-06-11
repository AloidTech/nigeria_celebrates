"use client";

import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import type { Option } from "@/lib/database_types/quiz_types";

interface QuizOptionButtonProps {
  option: Option;
  optionKey: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isAnswered: boolean;
  isWrongSelection?: boolean;
  showResolvedState: boolean;
  onClick: () => void;
}

export function QuizOptionButton({
  option,
  optionKey,
  isSelected,
  isCorrect = false,
  isAnswered,
  isWrongSelection = false,
  showResolvedState,
  onClick,
}: QuizOptionButtonProps) {
  let btnClass = "quiz-option-btn";
  if (showResolvedState) {
    btnClass += isCorrect ? " quiz-option-btn-correct" : " quiz-option-btn-wrong";
  } else if (isSelected) {
    btnClass += " quiz-option-btn-selected";
  }

  let badgeClass = "quiz-option-badge";
  if (showResolvedState && isCorrect) {
    badgeClass += " quiz-option-badge-correct";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isAnswered}
      className={`${btnClass} ${isWrongSelection ? "ring-1 ring-[#D4A017]" : ""} ${isAnswered ? "cursor-default" : ""}`}
      aria-pressed={isSelected}
    >
      <div className={badgeClass}>
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
}

interface QuizExplanationCardProps {
  explanation: string;
  correctOptionText?: string;
  selectedOptionText?: string;
}

export function QuizExplanationCard({
  explanation,
  correctOptionText,
  selectedOptionText,
}: QuizExplanationCardProps) {
  return (
    <div className="quiz-feedback-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A3C2E]">
            Round feedback
          </div>
        </div>
      </div>

      <div className="quiz-explanation-box animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Explanation
        </div>
        <p className="mt-2 text-sm leading-6 text-[#1A1A1A]">
          {explanation}
        </p>
        {(correctOptionText || selectedOptionText) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {correctOptionText && (
              <span className="rounded-full bg-[#EEF4F0] px-3 py-1 font-medium text-[#1A3C2E]">
                Answer: {correctOptionText}
              </span>
            )}
            {selectedOptionText && (
              <span className="rounded-full bg-[#F8F7F1] px-3 py-1 font-medium text-gray-700">
                Your pick: {selectedOptionText}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
