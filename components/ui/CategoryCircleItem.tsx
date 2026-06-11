"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

type CategoryCircleItemProps = {
  category: string;
  displayLabel: string;
  icon: LucideIcon;
  onClick: () => void;
  isSelected?: boolean;
};

export default function CategoryCircleItem({
  category,
  displayLabel,
  icon: Icon,
  onClick,
  isSelected = false,
}: CategoryCircleItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-clicked group flex flex-col items-center gap-3 transition-transform focus:outline-none"
    >
      <div
        className={`relative flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out sm:h-28 sm:w-28
          ${isSelected
            ? "border-[#D4A017] bg-[#D4A017]/10 shadow-[0_0_20px_rgba(212,160,23,0.3)] scale-105"
            : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:scale-105"
          }
          backdrop-blur-md shadow-lg`}
      >
        {/* Glow backdrop effect on hover */}
        <div className="absolute inset-0 -z-10 rounded-full bg-radial from-[#D4A017]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <Icon
          className={`h-8 w-8 transition-transform duration-300 group-hover:scale-110
            ${isSelected ? "text-[#D4A017]" : "text-white/80 group-hover:text-white"}`}
        />
      </div>
      <span
        className={`text-sm font-semibold tracking-wider transition-colors duration-200
          ${isSelected ? "text-[#D4A017]" : "text-white/70 group-hover:text-white"}`}
      >
        {displayLabel}
      </span>
    </button>
  );
}
