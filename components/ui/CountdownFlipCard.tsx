"use client";

import { useEffect, useState } from "react";

type CountdownFlipCardProps = {
  value: string;
  label: string;
};

export default function CountdownFlipCard({ value, label }: CountdownFlipCardProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value === displayValue) {
      return;
    }

    setPreviousValue(displayValue);
    setDisplayValue(value);
    setIsFlipping(true);

    const timeoutId = window.setTimeout(() => {
      setIsFlipping(false);
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [displayValue, value]);

  return (
    <div className="quiz-flip-shell flex-1 min-w-20">
      {isFlipping ? (
        <div className="quiz-flip-card">
          <div className="quiz-flip-face quiz-flip-face--front">
            {previousValue}
          </div>
          <div className="quiz-flip-face quiz-flip-face--back">
            {displayValue}
          </div>
        </div>
      ) : (
        <div className="quiz-flip-face">{displayValue}</div>
      )}
      <div className="mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1A3C2E]">
        {label}
      </div>
    </div>
  );
}
