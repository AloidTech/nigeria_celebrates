"use client";

import { useEffect, useState } from "react";

type CountdownFlipCardProps = {
  value: string;
  label: string;
};

export default function CountdownFlipCard({ value, label }: CountdownFlipCardProps) {
  const [prev, setPrev] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFlipping(true);
      const timeoutId = window.setTimeout(() => {
        setPrev(value);
        setIsFlipping(false);
      }, 600); // matches the 0.6s animation in globals.css

      return () => window.clearTimeout(timeoutId);
    }
  }, [value, prev]);

  return (
    <div className="flex-1 min-w-20 flex flex-col items-center">
      {/* Outer shell with perspective */}
      <div className="perspective-1000 w-full h-20 relative">
        {/* Inner card container that does the rotating */}
        <div
          className={`w-full h-full relative transform-style-3d ${
            isFlipping ? "digit-card-flip" : ""
          }`}
        >
          {/* Front Face: shows the old value */}
          <div className="absolute inset-0 backface-hidden digit-card-face rounded-2xl flex items-center justify-center text-3xl font-black font-mono shadow-md">
            {prev}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#e2e2d9]/60 z-10 pointer-events-none" />
          </div>

          {/* Back Face: shows the new value, pre-rotated */}
          <div className="absolute inset-0 backface-hidden rotate-x-180 digit-card-face rounded-2xl flex items-center justify-center text-3xl font-black font-mono shadow-md">
            {value}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#e2e2d9]/60 z-10 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="mt-2.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A3C2E]/75">
        {label}
      </div>
    </div>
  );
}
