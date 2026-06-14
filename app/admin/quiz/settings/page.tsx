'use client';

import { useEffect, useState, useRef } from 'react';
import {
    Sliders,
    Calendar,
    Clock,
    Save,
    Trophy,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Music2,
    Clapperboard,
    Globe2,
    Palette,
    ClipboardList
} from 'lucide-react';
import Link from 'next/link';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getWeeklyQuiz, useLiveWeeklyQuiz } from '@/lib/supabase/quizzes';
import type { QuestionWithOptions, GeneralQuizSettings, QuizStatus, QuizCategory, DifficultyLevel, QuizType } from '@/lib/database_types/quiz_types';

import { formatForInput, formatForDisplay, calculateDuration } from '@/lib/utils/date';

const categoryIcons: Record<QuizCategory, any> = {
    music: Music2,
    movies: Clapperboard,
    geography: Globe2,
    art: Palette,
};


export default function QuizSettingsPage() {
    // --------------------------------------------------
    // CHANGE DETECTION REF
    // --------------------------------------------------
    const initialSettingsRef = useRef<{
        durationMinutes: number;
        durationSeconds: number;
        easyCount: number;
        moderateCount: number;
        difficultCount: number;
        weeklyCategory: QuizCategory;
        startDay: number;
        weeklyStartTime: string;
        weeklyEndTime: string;
        intervalDays: number;
        startTime: string;
        endTime: string;
        weeklyStatus: QuizStatus;
        autoGenerationEnabled: boolean;
    } | null>(null);

    // --------------------------------------------------
    // STATE FOR GENERAL SETTINGS
    // --------------------------------------------------
    const [durationMinutes, setDurationMinutes] = useState(3);
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [easyCount, setEasyCount] = useState(2);
    const [moderateCount, setModerateCount] = useState(2);
    const [difficultCount, setDifficultCount] = useState(1);
    const [startDay, setStartDay] = useState(1);
    const [weeklyStartTime, setWeeklyStartTime] = useState('09:00');
    const [weeklyEndTime, setWeeklyEndTime] = useState('17:00');
    const [intervalDays, setIntervalDays] = useState(7);
    const [autoGenerationEnabled, setAutoGenerationEnabled] = useState(true);

    // Auto calculated sum
    const totalQuestions = easyCount + moderateCount + difficultCount;

    // --------------------------------------------------
    // STATE FOR WEEKLY QUIZ
    // --------------------------------------------------
    const [weeklyCategory, setWeeklyCategory] = useState<QuizCategory>('music');
    const [weeklyStatus, setWeeklyStatus] = useState<QuizStatus>('scheduled');
    const [startTime, setStartTime] = useState(formatForInput(new Date()));
    const [endTime, setEndTime] = useState(formatForInput(new Date()));
    const [weeklyQuestions, setWeeklyQuestions] = useState<QuestionWithOptions[]>([]);

    // --------------------------------------------------
    // STATE FOR UX
    // --------------------------------------------------
    const [pageLoading, setPageLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);


    // Error states
    const [gsError, setGsError] = useState<string | null>(null);
    const [questionsError, setQuestionsError] = useState<string | null>(null);

    // Live fetch moved to top level!
    const { quizData: liveQuizData, loading: quizLoading } = useLiveWeeklyQuiz();

    // Computed changes check
    const hasChanges = initialSettingsRef.current ? (
        durationMinutes !== initialSettingsRef.current.durationMinutes ||
        durationSeconds !== initialSettingsRef.current.durationSeconds ||
        easyCount !== initialSettingsRef.current.easyCount ||
        moderateCount !== initialSettingsRef.current.moderateCount ||
        difficultCount !== initialSettingsRef.current.difficultCount ||
        weeklyCategory !== initialSettingsRef.current.weeklyCategory ||
        startDay !== initialSettingsRef.current.startDay ||
        weeklyStartTime !== initialSettingsRef.current.weeklyStartTime ||
        weeklyEndTime !== initialSettingsRef.current.weeklyEndTime ||
        intervalDays !== initialSettingsRef.current.intervalDays ||
        startTime !== initialSettingsRef.current.startTime ||
        endTime !== initialSettingsRef.current.endTime ||
        weeklyStatus !== initialSettingsRef.current.weeklyStatus ||
        autoGenerationEnabled !== initialSettingsRef.current.autoGenerationEnabled
    ) : false;

    // Initialize/Load configurations from Supabase
    useEffect(() => {
        async function loadConfig() {
            setLoading(true);
            setPageLoading(true);
            setGsError(null);
            try {
                const supabase = getSupabaseBrowserClient();

                // 1. Fetch general settings
                let { data: gsData, error: gsErr } = await supabase
                    .from('general_settings')
                    .select('*')
                    .eq('quiz_type', 'weekly')
                    .limit(1)
                    .maybeSingle();

                if (gsErr) {
                    setGsError('Failed to load settings. Please check your connection or refresh.');
                    throw gsErr;
                }

                // If no general settings row exists, insert the default one
                if (!gsData) {
                    const defaultGs = {
                        weekly_category: 'music' as QuizCategory,
                        quiz_type: 'weekly' as QuizType,
                        quiz_duration: 180000,
                        question_amount: 5,
                        difficulty_distribution: [
                            { level: 'easy', question_amount: 2 },
                            { level: 'moderate', question_amount: 2 },
                            { level: 'difficult', question_amount: 1 }
                        ],
                        auto_generation_enabled: true,
                        start_day: 1
                    };

                    const { data: newGs, error: insertError } = await supabase
                        .from('general_settings')
                        .insert(defaultGs)
                        .select()
                        .single();

                    if (insertError) {
                        setGsError('Failed to create default settings.');
                        throw insertError;
                    }
                    gsData = newGs;
                }

                // Populate general settings state
                let fetchedDurationMin = 3;
                let fetchedDurationSec = 0;
                let fetchedEasy = 2;
                let fetchedModerate = 2;
                let fetchedDifficult = 1;
                let fetchedStartDay = 1;
                let fetchedWeeklyStart = '09:00';
                let fetchedWeeklyEnd = '17:00';
                let fetchedIntervalDays = 7;
                let fetchedCategory = 'music' as QuizCategory;
                let fetchedAutoGeneration = true;

                if (gsData) {
                    const totalMs = gsData.quiz_duration || 180000;
                    fetchedDurationMin = Math.floor(totalMs / 60000);
                    fetchedDurationSec = Math.floor((totalMs % 60000) / 1000);
                    setDurationMinutes(fetchedDurationMin);
                    setDurationSeconds(fetchedDurationSec);

                    const dist = gsData.difficulty_distribution || [];
                    const easyObj = dist.find((d: any) => d.level === 'easy');
                    const modObj = dist.find((d: any) => d.level === 'moderate');
                    const diffObj = dist.find((d: any) => d.level === 'difficult');
                    if (easyObj) {
                        fetchedEasy = easyObj.question_amount;
                        setEasyCount(fetchedEasy);
                    }
                    if (modObj) {
                        fetchedModerate = modObj.question_amount;
                        setModerateCount(fetchedModerate);
                    }
                    if (diffObj) {
                        fetchedDifficult = diffObj.question_amount;
                        setDifficultCount(fetchedDifficult);
                    }
                    fetchedCategory = gsData.weekly_category || 'music';
                    setWeeklyCategory(fetchedCategory);

                    fetchedStartDay = gsData.start_day ?? 1;
                    setStartDay(fetchedStartDay);

                    // Extract HH:MM from the ISO TIMESTAMPTZ values or time-only strings safely
                    const extractTime = (ts: string) => {
                        if (!ts) return '09:00';
                        const timeMatch = ts.match(/^(\d{2}):(\d{2})/);
                        if (timeMatch) {
                            return `${timeMatch[1]}:${timeMatch[2]}`;
                        }
                        const d = new Date(ts);
                        if (isNaN(d.getTime())) {
                            const match = ts.match(/(\d{2}):(\d{2})/);
                            if (match) {
                                return `${match[1]}:${match[2]}`;
                            }
                            return '09:00';
                        }
                        return d.toISOString().substring(11, 16);
                    };
                    fetchedWeeklyStart = gsData.weekly_start_time ? extractTime(gsData.weekly_start_time) : '09:00';
                    fetchedWeeklyEnd = gsData.weekly_end_time ? extractTime(gsData.weekly_end_time) : '17:00';
                    console.log("fetchedWeeklyStart", fetchedWeeklyStart, "fetchedWeeklyEnd", fetchedWeeklyEnd);
                    setWeeklyStartTime(fetchedWeeklyStart);
                    setWeeklyEndTime(fetchedWeeklyEnd);

                    fetchedAutoGeneration = gsData.auto_generation_enabled ?? true;
                    setAutoGenerationEnabled(fetchedAutoGeneration);

                    const rawInterval = gsData.interval_duration;
                    if (rawInterval) {
                        if (typeof rawInterval === 'string') {
                            const match = rawInterval.match(/(\d+)\s*day/);
                            if (match) fetchedIntervalDays = parseInt(match[1]);
                        } else if (typeof rawInterval === 'object' && rawInterval.days !== undefined) {
                            fetchedIntervalDays = rawInterval.days;
                        }
                    }
                    setIntervalDays(fetchedIntervalDays);
                }

                // We just capture the initial general settings.
                initialSettingsRef.current = {
                    durationMinutes: fetchedDurationMin,
                    durationSeconds: fetchedDurationSec,
                    easyCount: fetchedEasy,
                    moderateCount: fetchedModerate,
                    difficultCount: fetchedDifficult,
                    weeklyCategory: fetchedCategory,
                    startDay: fetchedStartDay,
                    weeklyStartTime: fetchedWeeklyStart,
                    weeklyEndTime: fetchedWeeklyEnd,
                    intervalDays: fetchedIntervalDays,
                    autoGenerationEnabled: fetchedAutoGeneration,
                    // These will be populated by the live sync below
                    startTime: '',
                    endTime: '',
                    weeklyStatus: 'scheduled'
                };
            } catch (err) {
                console.error('Failed to load settings from Supabase', err);
            } finally {
                setLoading(false);
                setPageLoading(false);
            }
        }
        loadConfig();
    }, []);

    // Sync live quiz data to local form state (only if no unsaved changes)
    useEffect(() => {
        console.log('Live quiz data update:', liveQuizData);
        if (!quizLoading && liveQuizData && !hasChanges && initialSettingsRef.current) {
            // Guard against null/undefined timestamps
            const safeStart = liveQuizData.start_time ?? formatForInput(new Date());
            const safeEnd = liveQuizData.end_time ?? formatForInput(new Date());
            setWeeklyStatus(liveQuizData.status || 'scheduled');
            setStartTime(safeStart);
            setEndTime(safeEnd);
            // Update ref
            initialSettingsRef.current.startTime = safeStart;
            initialSettingsRef.current.endTime = safeEnd;
            initialSettingsRef.current.weeklyStatus = liveQuizData.status || 'scheduled';
            // Fetch preview questions for the current category
            const fetchQs = async () => {
                const supabase = getSupabaseBrowserClient();
                const { data } = await supabase
                    .from('questions')
                    .select('*, options!options_question_id_fkey(*)')
                    .eq('category', liveQuizData.category || 'music')
                    .limit(5);
                setWeeklyQuestions(data ? (data as QuestionWithOptions[]) : []);
            };
            fetchQs();
        } else if (!quizLoading && !liveQuizData && !hasChanges) {
            // No quiz yet – set defaults
            const now = new Date();
            const defaultStart = weeklyStartTime;
            const defaultEnd = weeklyEndTime;
            setStartTime(defaultStart);
            setEndTime(defaultEnd);
            setWeeklyQuestions([]);

        }
    }, [liveQuizData, quizLoading, hasChanges, pageLoading]);

    // Discard changes
    const handleDiscard = () => {
        setDurationMinutes(initialSettingsRef.current?.durationMinutes || 5);
        setDurationSeconds(initialSettingsRef.current?.durationSeconds || 0);
        setEasyCount(initialSettingsRef.current?.easyCount || 5);
        setModerateCount(initialSettingsRef.current?.moderateCount || 5);
        setDifficultCount(initialSettingsRef.current?.difficultCount || 0);
        setWeeklyCategory(initialSettingsRef.current?.weeklyCategory || 'music');
        setStartDay(initialSettingsRef.current?.startDay || 2);
        setWeeklyStartTime(initialSettingsRef.current?.weeklyStartTime || formatForInput(new Date()));
        setWeeklyEndTime(initialSettingsRef.current?.weeklyEndTime || formatForInput(new Date()));
        setIntervalDays(initialSettingsRef.current?.intervalDays || 1);
        setStartTime(initialSettingsRef.current?.startTime || formatForInput(new Date()));
        setEndTime(initialSettingsRef.current?.endTime || formatForInput(new Date()));
        setWeeklyStatus(initialSettingsRef.current?.weeklyStatus || 'ended');
        setAutoGenerationEnabled(initialSettingsRef.current?.autoGenerationEnabled ?? true);
    };

    // Save configurations to Supabase
    async function handleSaveSettings() {
        setLoading(true);
        setSuccessMessage('');

        try {
            const supabase = getSupabaseBrowserClient();
            const totalMs = (durationMinutes * 60 + durationSeconds) * 1000;

            // 1. Update general settings
            const { data: gsData } = await supabase
                .from('general_settings')
                .select('id')
                .eq('quiz_type', 'weekly')
                .limit(1)
                .maybeSingle();

            const { error: gsErrorVal } = await supabase
                .from('general_settings')
                .update({
                    weekly_category: weeklyCategory,
                    quiz_duration: totalMs,
                    question_amount: totalQuestions,
                    start_day: startDay,
                    // Convert HH:MM UI values to full ISO timestamps (using today's date as reference)
                    weekly_start_time: new Date(`${new Date().toISOString().split('T')[0]}T${weeklyStartTime}:00Z`).toISOString(),
                    weekly_end_time: new Date(`${new Date().toISOString().split('T')[0]}T${weeklyEndTime}:00Z`).toISOString(),
                    interval_duration: `${intervalDays} days`,
                    auto_generation_enabled: autoGenerationEnabled,
                    difficulty_distribution: [
                        { level: 'easy', question_amount: easyCount },
                        { level: 'moderate', question_amount: moderateCount },
                        { level: 'difficult', question_amount: difficultCount }
                    ]
                })
                .eq('id', gsData?.id);

            if (gsErrorVal) throw gsErrorVal;

            // 2. Update or insert the current weekly quiz
            const { data: quizData } = await supabase
                .from('quizzes')
                .select('id')
                .eq('quiz_type', 'weekly')
                .eq('status', 'scheduled')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const quizPayload = {
                title: `Weekly Quiz - ${weeklyCategory.charAt(0).toUpperCase() + weeklyCategory.slice(1)}`,
                category: weeklyCategory,
                status: weeklyStatus,
                start_time: new Date(startTime).toISOString(),
                end_time: new Date(endTime).toISOString(),
                quiz_type: 'weekly' as QuizType
            };

            if (quizData) {
                // Update existing
                const { error: quizError } = await supabase
                    .from('quizzes')
                    .update(quizPayload)
                    .eq('id', quizData.id);

                if (quizError) throw quizError;
            } else {
                // Insert new
                const { error: quizError } = await supabase
                    .from('quizzes')
                    .insert(quizPayload);

                if (quizError) throw quizError;
            }

            // Update ref for change detection
            initialSettingsRef.current = {
                durationMinutes,
                durationSeconds,
                easyCount,
                moderateCount,
                difficultCount,
                weeklyCategory,
                startDay,
                weeklyStartTime,
                weeklyEndTime,
                intervalDays,
                startTime,
                endTime,
                weeklyStatus,
                autoGenerationEnabled
            };

            setSuccessMessage('General settings and weekly quiz schedule successfully saved to Supabase!');

            // Fade out success message
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err: any) {
            console.error('Failed to save settings to Supabase', err);
            alert(`Failed to save configuration: ${err.message || err}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateNextQuiz() {

    }

    if (pageLoading) {
        return (
            <main className='px-4 md:px-8 py-8 max-w-6xl mx-auto'>
                {/* Header Skeleton */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-200 pb-6'>
                    <div className='space-y-2.5'>
                        <div className='h-8 skeleton-premium-bar w-64' />
                        <div className='h-4 skeleton-premium-bar w-80' />
                    </div>
                    <div className='h-12 skeleton-premium-bar w-40' />
                </div>
                {/* Content Grid Skeleton */}
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                    <div className='lg:col-span-5 space-y-6'>
                        <div className='h-64 skeleton-premium ' />
                        <div className='h-64 skeleton-premium ' />
                        <div className='h-48 skeleton-premium' />
                    </div>
                    <div className='lg:col-span-7 space-y-6'>
                        <div className='h-44 skeleton-premium' />
                        <div className='h-[420px] skeleton-premium' />
                    </div>
                </div>
            </main>
        );
    }

    const CategoryIcon = categoryIcons[weeklyCategory] || Trophy;

    return (
        <main className='px-4 md:pr-4 py-8 max-w-6xl mx-auto'>
            {/* Header */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-200 pb-6'>
                <div>
                    <h1 className='text-3xl font-black text-[#1A1A1A] tracking-tight flex items-center gap-2'>
                        <Sliders className='h-8 w-8 text-[#1A3C2E]' />
                        Quiz Arena Settings
                    </h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        Manage global configuration values, difficulty weightages, and schedule the active weekly trivia editions.
                    </p>
                </div>

                <button
                    onClick={handleCreateNextQuiz}
                    disabled={loading || hasChanges}
                    className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${!hasChanges ? 'btn-save-unsaved' : 'btn-save-saved'
                        }`}
                >
                    <Save className='h-4 w-4' />
                    {loading ? 'Updating...' : 'Create Next Quiz'}
                </button>
            </div>

            {/* Notification Toast */}
            {successMessage && (
                <div className='mb-6 flex items-center gap-2 bg-[#EEF4F0] border border-[#1A3C2E]/20 text-[#1A3C2E] px-4 py-3 rounded-xl shadow-sm text-sm animate-fadeIn'>
                    <CheckCircle2 className='h-5 w-5 text-[#D4A017]' />
                    <span className='font-medium'>{successMessage}</span>
                </div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>

                {/* Left Column: Form Controls */}
                <div className='lg:col-span-5 space-y-6'>
                    {gsError ? (
                        <div className='bg-white rounded-2xl border border-red-200 p-6 shadow-sm text-center py-12'>
                            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4 animate-pulse' />
                            <h3 className='text-lg font-bold text-gray-800 font-sans'>No Settings Loaded</h3>
                            <p className='text-xs text-gray-500 mt-2 max-w-xs mx-auto'>{gsError}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className='mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold bg-[#EEF4F0] text-[#1A3C2E] px-4 py-2.5 rounded-xl hover:bg-[#dcece2] transition'
                            >
                                Refresh Page
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* General Parameters */}
                            <div className='bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm relative overflow-hidden'>
                                <h2 className='text-lg font-extrabold text-[#1A1A1A] mb-4 flex items-center gap-2'>
                                    <Clock className='h-5 w-5 text-[#1A3C2E]' />
                                    General Gameplay Settings
                                </h2>

                                <div className='space-y-4'>
                                    {/* Duration */}
                                    <div>
                                        <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                                            Session Timer Duration
                                        </label>
                                        <div className='flex gap-2 items-center'>
                                            <div className='relative flex-1'>
                                                <input
                                                    type='number'
                                                    min='0'
                                                    max='59'
                                                    value={durationMinutes}
                                                    onChange={(e) => setDurationMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                                                    className='w-full rounded-xl border border-[#E5E5E5] px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#1A3C2E]'
                                                />
                                                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400'>Min</span>
                                            </div>
                                            <div className='relative flex-1'>
                                                <input
                                                    type='number'
                                                    min='0'
                                                    max='59'
                                                    value={durationSeconds}
                                                    onChange={(e) => setDurationSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                                    className='w-full rounded-xl border border-[#E5E5E5] px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#1A3C2E]'
                                                />
                                                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400'>Sec</span>
                                            </div>
                                        </div>
                                        <p className='text-xs text-gray-400 mt-1.5'>Time allowed to complete the active quiz pool.</p>
                                    </div>

                                    {/* Start Day Selection */}
                                    <div className='pt-2 border-t border-gray-100'>
                                        <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                                            Auto-Schedule Start Day
                                        </label>
                                        <select
                                            value={startDay}
                                            onChange={(e) => setStartDay(parseInt(e.target.value))}
                                            className='w-full rounded-xl border border-[#E5E5E5] px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-[#1A3C2E] bg-white cursor-pointer'
                                        >
                                            <option value={1}>Monday</option>
                                            <option value={2}>Tuesday</option>
                                            <option value={3}>Wednesday</option>
                                            <option value={4}>Thursday</option>
                                            <option value={5}>Friday</option>
                                            <option value={6}>Saturday</option>
                                            <option value={7}>Sunday</option>
                                        </select>
                                        <p className='text-xs text-gray-400 mt-1.5'>Weekday when the auto-generated quiz will launch next week.</p>
                                    </div>

                                    {/* Auto-Schedule Start & End Time of Day */}
                                    <div className='pt-2 border-t border-gray-100 grid grid-cols-2 gap-3'>
                                        <div>
                                            <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                                                Daily Start Time
                                            </label>
                                            <input
                                                type='time'
                                                value={weeklyStartTime}
                                                onChange={(e) => setWeeklyStartTime(e.target.value)}
                                                className='w-full rounded-xl border border-[#E5E5E5] px-3.5 py-2 text-sm font-medium focus:outline-none focus:border-[#1A3C2E] bg-white'
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                                                Daily End Time
                                            </label>
                                            <input
                                                type='time'
                                                value={weeklyEndTime}
                                                onChange={(e) => setWeeklyEndTime(e.target.value)}
                                                className='w-full rounded-xl border border-[#E5E5E5] px-3.5 py-2 text-sm font-medium focus:outline-none focus:border-[#1A3C2E] bg-white'
                                            />
                                        </div>
                                    </div>

                                    {/* Active Window Duration */}
                                    <div className='pt-2 border-t border-gray-100'>
                                        <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                                            Active Duration (Days)
                                        </label>
                                        <input
                                            type='number'
                                            min='1'
                                            max='30'
                                            value={intervalDays}
                                            onChange={(e) => setIntervalDays(Math.max(1, parseInt(e.target.value) || 1))}
                                            className='w-full rounded-xl border border-[#E5E5E5] px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#1A3C2E] bg-white'
                                        />
                                        <p className='text-xs text-gray-400 mt-1.5'>Number of days the weekly quiz will remain open for gameplay.</p>
                                    </div>

                                    {/* Auto-Generation Toggle */}
                                    <div className='pt-2 border-t border-gray-100 flex items-center justify-between'>
                                        <div>
                                            <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider'>
                                                Auto-Generate Next Quiz
                                            </label>
                                            <p className='text-xs text-gray-400 mt-0.5'>Automatically pre-generate the next week&apos;s edition when this one ends.</p>
                                        </div>
                                        <button
                                            type='button'
                                            onClick={() => setAutoGenerationEnabled(!autoGenerationEnabled)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoGenerationEnabled ? 'bg-[#1A3C2E]' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoGenerationEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>

                                    {/* Question Amount Indicator */}
                                    <div className='pt-2 border-t border-gray-100'>
                                        <div className='flex justify-between items-center mb-1'>
                                            <span className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
                                                Total Question Quantity
                                            </span>
                                            <span className='bg-[#EEF4F0] text-[#1A3C2E] px-2.5 py-0.5 rounded-full text-xs font-bold'>
                                                {totalQuestions} Questions
                                            </span>
                                        </div>
                                        <p className='text-xs text-gray-400'>Determined automatically by the difficulty weights below.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Difficulty Distribution */}
                            <div className='bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm'>
                                <h2 className='text-lg font-extrabold text-[#1A1A1A] mb-4 flex items-center gap-2'>
                                    <Trophy className='h-5 w-5 text-[#1A3C2E]' />
                                    Difficulty Distribution
                                </h2>

                                <div className='space-y-4'>
                                    {/* Easy */}
                                    <div>
                                        <div className='flex justify-between text-xs font-bold text-gray-500 mb-1'>
                                            <span>EASY LEVEL QUESTIONS</span>
                                            <span className='text-green-700'>{easyCount}</span>
                                        </div>
                                        <input
                                            type='range'
                                            min='0'
                                            max='10'
                                            value={easyCount}
                                            onChange={(e) => setEasyCount(parseInt(e.target.value))}
                                            className='w-full accent-green-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg'
                                        />
                                    </div>

                                    {/* Moderate */}
                                    <div>
                                        <div className='flex justify-between text-xs font-bold text-gray-500 mb-1'>
                                            <span>MODERATE LEVEL QUESTIONS</span>
                                            <span className='text-amber-700'>{moderateCount}</span>
                                        </div>
                                        <input
                                            type='range'
                                            min='0'
                                            max='10'
                                            value={moderateCount}
                                            onChange={(e) => setModerateCount(parseInt(e.target.value))}
                                            className='w-full accent-amber-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg'
                                        />
                                    </div>

                                    {/* Difficult */}
                                    <div>
                                        <div className='flex justify-between text-xs font-bold text-gray-500 mb-1'>
                                            <span>DIFFICULT LEVEL QUESTIONS</span>
                                            <span className='text-red-700'>{difficultCount}</span>
                                        </div>
                                        <input
                                            type='range'
                                            min='0'
                                            max='10'
                                            value={difficultCount}
                                            onChange={(e) => setDifficultCount(parseInt(e.target.value))}
                                            className='w-full accent-red-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg'
                                        />
                                    </div>

                                    {totalQuestions === 0 && (
                                        <div className='flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg mt-2'>
                                            <AlertCircle className='h-4 w-4 shrink-0' />
                                            <span>Please configure at least 1 question for the distribution.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='flex gap-4'>
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={loading || !hasChanges}
                                    className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${hasChanges ? 'btn-save-unsaved' : 'btn-save-saved'
                                        }`}
                                >
                                    <Save className='h-4 w-4' />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>

                                <button
                                    onClick={handleDiscard}
                                    disabled={loading || !hasChanges}
                                    className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${hasChanges ? 'btn-save-unsaved' : 'btn-save-saved'
                                        }`}
                                >
                                    <Save className='h-4 w-4' />
                                    {loading ? 'Saving...' : 'Discard'}
                                </button>
                            </div>
                        </>
                    )}

                </div>


                {/* Right Column: Weekly Quiz Info */}
                <div className='lg:col-span-7 space-y-6'>
                    {!liveQuizData ? (
                        <div className='bg-[#1A3C2E] text-white rounded-2xl border border-[#1A3C2E]/20 p-8 shadow-md text-center py-16 relative overflow-hidden'>
                            <div className='absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none' />
                            <Trophy className='h-16 w-16 text-[#D4A017] mx-auto mb-4 animate-bounce' style={{ animationDuration: '3s' }} />
                            <h3 className='text-2xl font-black text-white font-sans'>No Scheduled Weekly Quiz</h3>
                            <p className='text-sm text-white/70 mt-3 max-w-md mx-auto'>
                                There is currently no active or scheduled weekly quiz in the database. Use the button above or below to create one with the current settings.
                            </p>
                            <button
                                onClick={handleSaveSettings}
                                className='mt-6 inline-flex items-center gap-2 rounded-xl bg-white text-[#1A3C2E] px-6 py-3 text-sm font-extrabold transition-all hover:bg-gray-100 active:scale-95 shadow-md'
                            >
                                <Sparkles className='h-4 w-4 text-[#D4A017] fill-current' />
                                Create Weekly Quiz
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Weekly quiz overview */}
                            <div className='bg-[#1A3C2E] text-white rounded-2xl border border-[#1A3C2E]/20 p-6 shadow-md relative overflow-hidden'>
                                <div className='absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none' />

                                <div className='relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                                    <div>
                                        <span className='inline-flex items-center gap-1.5 bg-[#D4A017] text-[#1A1A1A] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2'>
                                            <Sparkles className='h-3 w-3 fill-current' />
                                            Active Campaign
                                        </span>
                                        <h3 className='text-xl font-black text-white'>Current Weekly Settings</h3>
                                        <p className='text-xs text-white/60 mt-0.5'>Configure target topic and preview scheduled questions.</p>
                                    </div>

                                    <div className='flex flex-col items-end gap-1.5 max-sm:w-full'>
                                        <select
                                            value={weeklyCategory}
                                            onChange={(e) => setWeeklyCategory(e.target.value as QuizCategory)}
                                            className='bg-white/10 hover:bg-white/15 text-white text-sm font-bold rounded-xl border border-white/20 px-3.5 py-2 focus:outline-none focus:border-[#D4A017] cursor-pointer'
                                        >
                                            <option value='music' className='text-[#1A1A1A]'>Music Category</option>
                                            <option value='movies' className='text-[#1A1A1A]'>Movies Category</option>
                                            <option value='geography' className='text-[#1A1A1A]'>Geography Category</option>
                                            <option value='art' className='text-[#1A1A1A]'>Art Category</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Schedule Metadata */}
                                <div className='mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs text-white/70 relative z-10'>
                                    <div>
                                        <span className='block text-[10px] uppercase font-bold text-white/40 tracking-wider'>Status Mode</span>
                                        <select
                                            value={weeklyStatus}
                                            onChange={(e) => setWeeklyStatus(e.target.value as QuizStatus)}
                                            className='mt-1 bg-transparent hover:bg-white/5 text-white font-bold rounded-md px-1 py-0.5 border border-dashed border-white/20 cursor-pointer focus:outline-none'
                                        >
                                            <option value='scheduled' className='text-[#1A1A1A]'>Scheduled</option>
                                            <option value='active' className='text-[#1A1A1A]'>Active</option>
                                            <option value='ended' className='text-[#1A1A1A]'>Ended</option>
                                        </select>
                                    </div>
                                    <div>
                                        <span className='block text-[10px] uppercase font-bold text-white/40 tracking-wider'>Topic Theme</span>
                                        <span className='mt-1 font-bold text-white flex items-center gap-1.5 capitalize'>
                                            <CategoryIcon className='h-3.5 w-3.5 text-[#D4A017]' />
                                            {weeklyCategory}
                                        </span>
                                    </div>
                                </div>

                                {/* Weekly Quiz Active Period Scheduling Fields */}
                                <div className='mt-6 border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-white/70 relative z-10'>
                                    <div>
                                        <label className='block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1'>Start Window</label>
                                        <input
                                            type='datetime-local'
                                            value={startTime ?? ''}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className='w-full bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl border border-white/20 px-3 py-1.5 focus:outline-none focus:border-[#D4A017] cursor-pointer'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1'>End Window</label>
                                        <input
                                            type='datetime-local'
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className='w-full bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl border border-white/20 px-3 py-1.5 focus:outline-none focus:border-[#D4A017] cursor-pointer'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1'>Current Duration</label>
                                        <div className='w-full bg-white/5 text-white font-bold rounded-xl border border-white/10 px-3 py-1.5 text-center mt-0.5'>
                                            {calculateDuration(startTime, endTime)}
                                        </div>
                                    </div>
                                </div>
                                {weeklyStatus === 'scheduled' && startTime && (
                                    <div className='mt-4 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white/90 flex items-center gap-2 relative z-10'>
                                        <Clock className='h-4 w-4 text-[#D4A017] shrink-0' />
                                        <span>
                                            Scheduled to start on: <strong className='text-white'>{formatForDisplay(startTime)}</strong>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Question List Preview */}
                            <div className='bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm'>
                                <div className='flex justify-between items-center mb-6'>
                                    <h2 className='text-lg font-extrabold text-[#1A1A1A] flex items-center gap-2'>
                                        <ClipboardList className='h-5 w-5 text-[#1A3C2E]' />
                                        Scheduled Weekly Questions ({weeklyQuestions.length})
                                    </h2>
                                    <Link
                                        href='/admin/quiz/questions'
                                        className='text-xs font-bold text-[#1A3C2E] hover:text-[#142e23] underline flex items-center gap-1'
                                    >
                                        <Sparkles className='h-3 w-3 text-[#D4A017]' />
                                        Add more questions
                                    </Link>
                                </div>

                                {questionsError ? (
                                    <div className='text-center py-12 border border-red-100 bg-red-50/10 rounded-xl'>
                                        <AlertCircle className='h-10 w-10 text-red-500 mx-auto mb-3 animate-pulse' />
                                        <h4 className='text-sm font-bold text-red-700'>Failed to Load Questions</h4>
                                        <p className='text-xs text-red-500 mt-1 max-w-xs mx-auto'>{questionsError}</p>
                                    </div>
                                ) : weeklyQuestions.length === 0 ? (
                                    <div className='text-center py-10 border-2 border-dashed border-gray-100 rounded-xl'>
                                        <p className='text-sm text-gray-400'>No questions currently imported in the pool for this category.</p>
                                        <Link
                                            href='/admin/quiz/questions'
                                            className='mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold bg-[#EEF4F0] text-[#1A3C2E] px-3.5 py-2 rounded-xl hover:bg-[#dcece2] transition'
                                        >
                                            Go generate questions
                                        </Link>
                                    </div>
                                ) : (
                                    <div className='space-y-3.5'>
                                        {weeklyQuestions.map((q, idx) => {
                                            const isExpanded = expandedQuestion === q.id;
                                            return (
                                                <div
                                                    key={q.id || idx}
                                                    className={`border rounded-xl transition-all duration-200 overflow-hidden ${isExpanded ? 'border-[#1A3C2E]/30 bg-[#EEF4F0]/10 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    {/* Collapsible Header */}
                                                    <button
                                                        type='button'
                                                        onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                                                        className='w-full flex items-start justify-between gap-4 p-4 text-left font-medium'
                                                    >
                                                        <div className='flex-1'>
                                                            <div className='flex items-center gap-2 mb-1'>
                                                                <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>Q{idx + 1}</span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${q.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                                                                    q.difficulty === 'moderate' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                                                    }`}>
                                                                    {q.difficulty}
                                                                </span>
                                                                <span className='text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold capitalize'>
                                                                    {q.category}
                                                                </span>
                                                            </div>
                                                            <p className='text-sm font-bold text-[#1A1A1A] line-clamp-2'>{q.question_text}</p>
                                                        </div>
                                                        <div className='text-gray-400 mt-1'>
                                                            {isExpanded ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
                                                        </div>
                                                    </button>

                                                    {/* Collapsible Body */}
                                                    {isExpanded && (
                                                        <div className='px-4 pb-4 pt-1 border-t border-gray-100/50 bg-[#FBFBFA]'>
                                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2'>
                                                                {q.options.map((opt) => {
                                                                    const isCorrect = opt.id === q.correct_option_id;
                                                                    return (
                                                                        <div
                                                                            key={opt.id}
                                                                            className={`flex items-center gap-2 p-2.5 rounded-lg text-xs border ${isCorrect
                                                                                ? 'bg-[#EEF4F0] border-[#1A3C2E]/20 text-[#1A3C2E] font-bold'
                                                                                : 'bg-white border-gray-150 text-gray-600'
                                                                                }`}
                                                                        >
                                                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${isCorrect ? 'bg-[#1A3C2E] text-white' : 'bg-gray-100 text-gray-500'
                                                                                }`}>
                                                                                {opt.id.toUpperCase()}
                                                                            </span>
                                                                            <span>{opt.option_text}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            {q.explanation && (
                                                                <div className='mt-4 p-3 bg-white rounded-lg border border-gray-100 text-xs text-gray-500'>
                                                                    <strong className='text-gray-700 font-bold block mb-0.5'>Explanation:</strong>
                                                                    {q.explanation}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

            </div>


        </main>
    );
}
