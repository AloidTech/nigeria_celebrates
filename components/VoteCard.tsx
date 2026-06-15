"use client";

import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Share2, X } from "lucide-react";
import { supabase } from "../supabase"; 


import { castVote } from "@/lib/supabase/queries/uploads";
import type { talent_category } from "@/lib/database_types/upload_types";

export type VoteCardProps = {
    id: string;          
    category: string;
    name: string;        // Acts as title/username
    description: string;
    votes: number;       // Swapped to number for clean arithmetic
    media_url: string;   // Added to load real media uploads instead of static gray blocks
    progress: string;
    onVoteSuccess?: () => void; // Callback hook to refresh the feed list
};

function mapCategory(cat: string) {
    const lower = cat.toLowerCase();
    if (lower.includes('tech')) return 'talent_tech';
    if (lower.includes('innovat')) return 'talent_innovation';
    if (lower.includes('art') || lower.includes('logo') || lower.includes('photo')) return 'talent_arts';
    if (lower.includes('music') || lower.includes('song') || lower.includes('comedy') || lower.includes('movie')) return 'talent_entertainment';
    if (lower.includes('freestyle') || lower.includes('football') || lower.includes('basketball') || lower.includes('sport')) return 'talent_sports';
    if (lower.includes('leader')) return 'talent_leadership';
    if (lower.includes('entrepreneur')) return 'talent_entrepreneurship';
    if (lower.includes('global')) return 'global_achiever';
    if (lower.includes('corporate') || lower.includes('economic')) return 'corporate_economic';
    return 'talent_creativity';
}

export default function VoteCard({ 
    id, 
    category, 
    name, 
    description, 
    votes, 
    media_url, 
    progress,
    onVoteSuccess 
}: VoteCardProps) {
    const [isShortsOpen, setIsShortsOpen] = useState(false);
    const [upvoteCount, setUpvoteCount] = useState(votes);

    // 3. Immersive Control Voting Logic Core
    const handleVote = async (type: "up" | "down") => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please log in to vote!");
                return;
            }

            const isUpvote = type === "up";
            const mappedCategory = mapCategory(category) as talent_category;

            // Trigger the centralized Option B vote process (deletes then inserts)
            await castVote(supabase, id, user.id, isUpvote, mappedCategory);

            // Update local count optimistically or visually
            if (isUpvote) {
                setUpvoteCount((prev: number) => prev + 1);
            } else {
                setUpvoteCount((prev: number) => Math.max(0, prev - 1));
            }

            alert("Ballot counted securely!");
            if (onVoteSuccess) onVoteSuccess();

        } catch (err: any) {
            alert(`Pipeline Error: ${err.message || "Operation failed."}`);
        }
    };

    const isVideo = media_url?.endsWith(".mp4") || media_url?.includes("video");

    return (
        <>
            {/* TEAMMATE'S ORIGINAL WRAPPER COMPONENT DESIGN */}
            <article className='flex overflow-hidden rounded-xl bg-white shadow-md border border-gray-100'>
                {/* Media section - Clickable to enter shorts view */}
                <div 
                    onClick={() => setIsShortsOpen(true)} 
                    className='w-1/2 shrink-0 bg-gray-900 relative cursor-pointer group overflow-hidden'
                >
                    {media_url ? (
                        isVideo ? (
                            <video src={media_url} className="w-full h-full object-cover min-h-[350px]" muted playsInline />
                        ) : (
                            <img src={media_url} alt={name} className="w-full h-full object-cover min-h-[350px] group-hover:scale-105 transition-transform duration-500" />
                        )
                    ) : (
                        <div className='h-full min-h-87.5 w-full bg-[linear-gradient(180deg,rgba(26,60,46,0.18),rgba(0,0,0,0.1)),radial-gradient(circle_at_30%_20%,rgba(212,160,23,0.35),transparent_28%),radial-gradient(circle_at_70%_30%,rgba(26,60,46,0.3),transparent_24%)]' />
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                        ⚡ View Immersive Clip
                    </div>
                </div>

                <div className='flex min-w-0 flex-1 flex-col justify-between p-6'>
                    <div>
                        <div className='mb-3 w-fit rounded-full bg-[#F0F0EC] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500'>{category}</div>
                        <h3 className='text-2xl font-bold leading-tight text-[#1A1A1A] truncate'>{name}</h3>
                        <p className='mt-2 line-clamp-3 text-sm text-gray-500'>{description}</p>
                    </div>
                    <div className='mt-4'>
                        <div className='text-sm text-gray-500'>{upvoteCount} Votes</div>
                        <div className='mt-2 h-1 w-full max-w-20 rounded-full bg-[#E9E4D0]'>
                            <div className='h-full rounded-full bg-[#D4A017]' style={{ width: progress }} />
                        </div>
                        <button 
                            type='button' 
                            onClick={() => setIsShortsOpen(true)}
                            className='mt-3 w-full rounded-md bg-[#1A3C2E] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#142e23]'
                        >
                            Vote Now
                        </button>
                    </div>
                </div>
            </article>

            {/* IMMERSIVE YOUTUBE SHORTS CLOSEUP ROUTE FRAME OVERLAY */}
            {isShortsOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center md:p-4 animate-fadeIn">
                    <div className="absolute inset-0 cursor-pointer" onClick={() => setIsShortsOpen(false)} />

                    {/* Mobile-First Display Cylinder */}
                    <div className="relative w-full h-full md:max-w-[420px] md:h-[85vh] md:rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex flex-col shadow-2xl z-10">
                        
                        {/* Upper Utility Action Strip */}
                        <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between">
                            <button 
                                onClick={() => setIsShortsOpen(false)}
                                className="text-white text-xs font-bold bg-zinc-900/60 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm"
                            >
                                ✕ Exit Reel
                            </button>
                            <span className="text-[10px] bg-[#D4A017]/20 text-[#D4A017] px-2.5 py-1 rounded-md font-bold tracking-widest uppercase">
                                {category}
                            </span>
                        </div>

                        {/* Immersive Playback Portal */}
                        <div className="flex-1 w-full bg-black flex items-center justify-center relative">
                            {isVideo ? (
                                <video src={media_url} autoPlay loop controls className="w-full h-full object-cover" />
                            ) : (
                                <img src={media_url} alt={name} className="w-full h-full object-contain" />
                            )}

                            {/* Floating Sidebar Engine Controls (YouTube Shorts Alignment Blueprint) */}
                            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-20">
                                <div className="flex flex-col items-center gap-1">
                                    <button 
                                        onClick={() => handleVote("up")}
                                        className="p-3.5 bg-zinc-900/80 border border-white/10 hover:bg-emerald-600 hover:text-white text-zinc-100 rounded-full backdrop-blur-md transition-all shadow-xl"
                                    >
                                        <ThumbsUp size={18} />
                                    </button>
                                    <span className="text-[11px] font-black text-white drop-shadow-md">{upvoteCount}</span>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <button 
                                        onClick={() => handleVote("down")}
                                        className="p-3.5 bg-zinc-900/80 border border-white/10 hover:bg-rose-600 hover:text-white text-zinc-100 rounded-full backdrop-blur-md transition-all shadow-xl"
                                    >
                                        <ThumbsDown size={18} />
                                    </button>
                                    <span className="text-[11px] font-bold text-zinc-400">Dislike</span>
                                </div>

                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Link linked to user system clipboard vector.");
                                    }}
                                    className="p-3.5 bg-zinc-900/80 border border-white/10 hover:bg-zinc-800 text-zinc-100 rounded-full backdrop-blur-md transition-all shadow-xl"
                                >
                                    <Share2 size={18} />
                                </button>
                            </div>

                            {/* Presentation Information Footer overlay */}
                            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/95 via-black/40 to-transparent pt-16 text-white z-10">
                                <h3 className="text-base font-black tracking-tight text-white">{name}</h3>
                                <p className="text-xs text-zinc-300 mt-1.5 line-clamp-2 leading-relaxed">{description}</p>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}