import React from "react";
import { Star } from "lucide-react";

type Props = {
  rank: number;
  name: string;
  score: number;
  streak?: string;
  isCurrentPlayer?: boolean;
};

export default function RankCard({
  rank,
  name,
  score,
  streak,
  isCurrentPlayer,
}: Props) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
        isCurrentPlayer
          ? "border-[#1A3C2E] bg-[#EEF4F0]"
          : "border-[#ECE8D9] bg-[#FAFAF8]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
            rank === 1
              ? "bg-[#D4A017] text-[#1A1A1A]"
              : "bg-white text-[#1A1A1A]"
          }`}
        >
          {rank === 1 ? <Star className="h-4 w-4 fill-current" /> : rank}
        </div>
        <div>
          <div className="text-sm font-semibold text-[#1A1A1A]">{name}</div>
          <div className="text-xs text-gray-500">{streak}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-[#1A1A1A]">{score}</div>
        <div className="text-xs uppercase tracking-[0.18em] text-gray-500">
          points
        </div>
      </div>
    </div>
  );
}
