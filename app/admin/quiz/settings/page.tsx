'use client';

import { useEffect, useState } from 'react';
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
    Palette
} from 'lucide-react';
import Link from 'next/link';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getWeeklyQuiz } from '@/lib/supabase/queries';
import type { question, general_quiz_settings, categories, quiz_status } from '@/lib/database_types/quiz_types';

type QuizCategory = 'music' | 'movies' | 'geography' | 'art';

const categoryIcons: Record<QuizCategory, any> = {
    music: Music2,
    movies: Clapperboard,
    geography: Globe2,
    art: Palette,
};

const defaultWeeklyQuestions: question[] = [
    {
        _id: 'qw1',
        question_text: 'Which artist popularized the global breakout hit “One Dance”?',
        options: [
            { _id: 'a', option_text: 'Wizkid' },
            { _id: 'b', option_text: 'Olamide' },
            { _id: 'c', option_text: 'Burna Boy' },
            { _id: 'd', option_text: 'Flavour' },
        ],
        correct_option_id: 'a',
        explanation: 'Wizkid was featured on “One Dance,” helping push the record into global pop culture.',
        difficulty: 'easy',
        category: 'music',
    },
    {
        _id: 'qw2',
        question_text: 'Which movie franchise is best known for the character Ebere, the detective from Lagos?',
        options: [
            { _id: 'a', option_text: 'Living in Bondage' },
            { _id: 'b', option_text: 'The Figurine' },
            { _id: 'c', option_text: 'King of Boys' },
            { _id: 'd', option_text: 'Citation' },
        ],
        correct_option_id: 'c',
        explanation: 'King of Boys is the correct pick for this crime-thriller style clue.',
        difficulty: 'moderate',
        category: 'movies',
    },
    {
        _id: 'qw3',
        question_text: 'Fela Anikulapo-Kuti is globally celebrated as the pioneer of which music genre?',
        options: [
            { _id: 'a', option_text: 'Highlife' },
            { _id: 'b', option_text: 'Afrobeat' },
            { _id: 'c', option_text: 'Juju' },
            { _id: 'd', option_text: 'Apala' },
        ],
        correct_option_id: 'b',
        explanation: 'Fela Kuti created Afrobeat in the late 1960s, blending highlife, jazz, and traditional Yoruba rhythms.',
        difficulty: 'easy',
        category: 'music',
    }
];

export default function QuizSettingsPage() {
    // --------------------------------------------------
    // STATE FOR GENERAL SETTINGS
    // --------------------------------------------------
    const [durationMinutes, setDurationMinutes] = useState(3);
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [easyCount, setEasyCount] = useState(2);
    const [moderateCount, setModerateCount] = useState(2);
    const [difficultCount, setDifficultCount] = useState(1);
    
    // Auto calculated sum
    const totalQuestions = easyCount + moderateCount + difficultCount;

    // --------------------------------------------------
    // STATE FOR WEEKLY QUIZ
    // --------------------------------------------------
    const [weeklyCategory, setWeeklyCategory] = useState<QuizCategory>('music');
    const [weeklyStatus, setWeeklyStatus] = useState<quiz_status>('scheduled');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [weeklyQuestions, setWeeklyQuestions] = useState<question[]>([]);

    // --------------------------------------------------
    // STATE FOR UX
    // --------------------------------------------------
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

    // Initialize/Load configurations
    useEffect(() => {
        // Load settings from localStorage
        const storedSettings = localStorage.getItem('naija-vibe-quiz-settings');
        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings);
                const totalMs = parsed.quiz_duration || 180000;
                const minutes = Math.floor(totalMs / 60000);
                const seconds = Math.floor((totalMs % 60000) / 1000);
                setDurationMinutes(minutes);
                setDurationSeconds(seconds);

                const dist = parsed.difficulty_distribution || [];
                const easyObj = dist.find((d: any) => d.level === 'easy');
                const modObj = dist.find((d: any) => d.level === 'moderate');
                const diffObj = dist.find((d: any) => d.level === 'difficult');
                if (easyObj) setEasyCount(easyObj.question_amount);
                if (modObj) setModerateCount(modObj.question_amount);
                if (diffObj) setDifficultCount(diffObj.question_amount);
            } catch (e) {
                console.error('Error parsing stored settings', e);
            }
        }

        // Load weekly quiz settings
        const storedWeekly = localStorage.getItem('naija-vibe-weekly-quiz');
        if (storedWeekly) {
            try {
                const parsed = JSON.parse(storedWeekly);
                setWeeklyCategory(parsed.category || 'music');
                setWeeklyStatus(parsed.status || 'scheduled');
                setStartTime(parsed.start_time || '');
                setEndTime(parsed.end_time || '');
                if (parsed.questions && parsed.questions.length > 0) {
                    setWeeklyQuestions(parsed.questions);
                } else {
                    setWeeklyQuestions(defaultWeeklyQuestions);
                }
            } catch (e) {
                console.error('Error parsing weekly quiz', e);
            }
        } else {
            // Load from Supabase or default fallbacks
            const supabase = getSupabaseBrowserClient();
            getWeeklyQuiz(supabase)
                .then((data) => {
                    if (data && data.length > 0) {
                        setWeeklyQuestions(data);
                        setWeeklyCategory(data[0].category as QuizCategory);
                    } else {
                        setWeeklyQuestions(defaultWeeklyQuestions);
                    }
                })
                .catch(() => {
                    setWeeklyQuestions(defaultWeeklyQuestions);
                });
            
            // Set default dates
            const now = new Date();
            const startStr = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
            const endStr = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
            setStartTime(startStr);
            setEndTime(endStr);
        }
    }, []);

    // Save configurations
    function handleSaveSettings() {
        setLoading(true);
        setSuccessMessage('');

        const totalMs = (durationMinutes * 60 + durationSeconds) * 1000;
        const settingsPayload: general_quiz_settings = {
            quiz_duration: totalMs,
            question_amount: totalQuestions,
            difficulty_distribution: [
                { level: 'easy', question_amount: easyCount },
                { level: 'moderate', question_amount: moderateCount },
                { level: 'difficult', question_amount: difficultCount }
            ],
            start_time: new Date(startTime || Date.now()),
            end_time: new Date(endTime || Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        const weeklyPayload = {
            category: weeklyCategory,
            status: weeklyStatus,
            start_time: startTime,
            end_time: endTime,
            questions: weeklyQuestions
        };

        setTimeout(() => {
            localStorage.setItem('naija-vibe-quiz-settings', JSON.stringify(settingsPayload));
            localStorage.setItem('naija-vibe-weekly-quiz', JSON.stringify(weeklyPayload));
            
            setLoading(false);
            setSuccessMessage('General settings and weekly quiz schedule successfully saved!');
            
            // Fade out success message
            setTimeout(() => setSuccessMessage(''), 4000);
        }, 600);
    }

    const CategoryIcon = categoryIcons[weeklyCategory] || Trophy;

    return (
        <main className='px-4 md:px-8 py-8 max-w-6xl mx-auto'>
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
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className='inline-flex items-center gap-2 rounded-xl bg-[#1A3C2E] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#142e23] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed'
                >
                    <Save className='h-4 w-4' />
                    {loading ? 'Saving...' : 'Save Configuration'}
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

                    {/* Schedule configuration */}
                    <div className='bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm'>
                        <h2 className='text-lg font-extrabold text-[#1A1A1A] mb-4 flex items-center gap-2'>
                            <Calendar className='h-5 w-5 text-[#1A3C2E]' />
                            Weekly Quiz Scheduling
                        </h2>

                        <div className='space-y-4'>
                            <div>
                                <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'>
                                    Start Time Window
                                </label>
                                <input
                                    type='datetime-local'
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className='w-full rounded-xl border border-[#E5E5E5] px-3.5 py-2 text-sm font-medium focus:outline-none focus:border-[#1A3C2E]'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'>
                                    End Time Window
                                </label>
                                <input
                                    type='datetime-local'
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className='w-full rounded-xl border border-[#E5E5E5] px-3.5 py-2 text-sm font-medium focus:outline-none focus:border-[#1A3C2E]'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Weekly Quiz Info */}
                <div className='lg:col-span-7 space-y-6'>
                    
                    {/* Weekly quiz overview */}
                    <div className='bg-[#1A3C2E] text-white rounded-2xl border border-[#1A3C2E]/20 p-6 shadow-md relative overflow-hidden'>
                        <div className='absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none' />
                        
                        <div className='relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                            <div>
                                <span className='inline-flex items-center gap-1.5 bg-[#D4A017] text-[#1A1A1A] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2'>
                                    <Sparkles className='h-3 w-3 fill-current' />
                                    Active Campaign
                                </span>
                                <h3 className='text-xl font-black text-white'>Current Weekly Arena</h3>
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
                        <div className='mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs text-white/70'>
                            <div>
                                <span className='block text-[10px] uppercase font-bold text-white/40 tracking-wider'>Status Mode</span>
                                <select
                                    value={weeklyStatus}
                                    onChange={(e) => setWeeklyStatus(e.target.value as quiz_status)}
                                    className='mt-1 bg-transparent hover:bg-white/5 text-white font-bold rounded-md px-1 py-0.5 border border-dashed border-white/20 cursor-pointer focus:outline-none'
                                >
                                    <option value='scheduled' className='text-[#1A1A1A]'>Scheduled</option>
                                    <option value='active' className='text-[#1A1A1A]'>Active</option>
                                    <option value='ended' className='text-[#1A1A1A]'>Ended</option>
                                    <option value='upcoming' className='text-[#1A1A1A]'>Upcoming</option>
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
                    </div>

                    {/* Question List Preview */}
                    <div className='bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm'>
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className='text-lg font-extrabold text-[#1A1A1A] flex items-center gap-2'>
                                <ClipboardListIcon className='h-5 w-5 text-[#1A3C2E]' />
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

                        {weeklyQuestions.length === 0 ? (
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
                                    const isExpanded = expandedQuestion === q._id;
                                    return (
                                        <div 
                                            key={q._id || idx} 
                                            className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                                                isExpanded ? 'border-[#1A3C2E]/30 bg-[#EEF4F0]/10 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                        >
                                            {/* Collapsible Header */}
                                            <button
                                                type='button'
                                                onClick={() => setExpandedQuestion(isExpanded ? null : q._id)}
                                                className='w-full flex items-start justify-between gap-4 p-4 text-left font-medium'
                                            >
                                                <div className='flex-1'>
                                                    <div className='flex items-center gap-2 mb-1'>
                                                        <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>Q{idx + 1}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                            q.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
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
                                                            const isCorrect = opt._id === q.correct_option_id;
                                                            return (
                                                                <div 
                                                                    key={opt._id} 
                                                                    className={`flex items-center gap-2 p-2.5 rounded-lg text-xs border ${
                                                                        isCorrect 
                                                                            ? 'bg-[#EEF4F0] border-[#1A3C2E]/20 text-[#1A3C2E] font-bold' 
                                                                            : 'bg-white border-gray-150 text-gray-600'
                                                                    }`}
                                                                >
                                                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                                                                        isCorrect ? 'bg-[#1A3C2E] text-white' : 'bg-gray-100 text-gray-500'
                                                                    }`}>
                                                                        {opt._id.toUpperCase()}
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
                </div>

            </div>
        </main>
    );
}

// Simple fallback local icon since ClipboardList is imported from Lucide
function ClipboardListIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <rect width='8' height='4' x='8' y='2' rx='1' ry='1' />
            <path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' />
            <path d='M9 14h6' />
            <path d='M9 18h6' />
            <path d='M9 10h6' />
        </svg>
    );
}