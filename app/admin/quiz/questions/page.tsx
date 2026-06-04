'use client';

import { useEffect, useState } from 'react';
import { 
    ClipboardList, 
    Copy, 
    Check, 
    FileJson, 
    AlertCircle, 
    CheckCircle2, 
    Trash2, 
    Filter, 
    Search,
    Sparkles,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import type { question, categories, difficulty_level } from '@/lib/database_types/quiz_types';

type QuizCategory = 'music' | 'movies' | 'geography' | 'art';

const seedQuestions: question[] = [
    // Music
    {
        _id: 'm1',
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
        _id: 'm2',
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
    },
    {
        _id: 'm3',
        question_text: 'Which Nigerian artist won the Best Global Music Album award at the 63rd Annual Grammy Awards?',
        options: [
            { _id: 'a', option_text: 'Davido' },
            { _id: 'b', option_text: 'Wizkid' },
            { _id: 'c', option_text: 'Burna Boy' },
            { _id: 'd', option_text: 'Rema' },
        ],
        correct_option_id: 'c',
        explanation: 'Burna Boy won the Best Global Music Album Grammy for his 2020 record "Twice as Tall".',
        difficulty: 'moderate',
        category: 'music',
    },
    // Movies
    {
        _id: 'f1',
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
        _id: 'f2',
        question_text: 'Which movie directed by Funke Akindele became the highest-grossing Nollywood film of all time?',
        options: [
            { _id: 'a', option_text: 'A Tribe Called Judah' },
            { _id: 'b', option_text: 'Omo Ghetto: The Saga' },
            { _id: 'c', option_text: 'Battle on Buka Street' },
            { _id: 'd', option_text: 'The Wedding Party' },
        ],
        correct_option_id: 'a',
        explanation: "Funke Akindele's 'A Tribe Called Judah' grossed over 1.4 billion Naira, making history as Nollywood's highest earner.",
        difficulty: 'easy',
        category: 'movies',
    },
    // Geography
    {
        _id: 'g1',
        question_text: 'What is the capital city of Nigeria, which replaced Lagos in December 1991?',
        options: [
            { _id: 'a', option_text: 'Abuja' },
            { _id: 'b', option_text: 'Ibadan' },
            { _id: 'c', option_text: 'Port Harcourt' },
            { _id: 'd', option_text: 'Enugu' },
        ],
        correct_option_id: 'a',
        explanation: 'Abuja was chosen as the federal capital city for its central geographical location and neutrality.',
        difficulty: 'easy',
        category: 'geography',
    },
    {
        _id: 'g2',
        question_text: 'Which river is the longest in Nigeria and forms a confluence with River Benue at Lokoja?',
        options: [
            { _id: 'a', option_text: 'River Benue' },
            { _id: 'b', option_text: 'River Kaduna' },
            { _id: 'c', option_text: 'River Niger' },
            { _id: 'd', option_text: 'River Cross' },
        ],
        correct_option_id: 'c',
        explanation: 'The River Niger is the principal river of West Africa, extending about 4,180 km.',
        difficulty: 'easy',
        category: 'geography',
    },
    // Art
    {
        _id: 'a1',
        question_text: "Which world-famous Nigerian painting of a princess by Ben Enwonwu is often called the 'African Mona Lisa'?",
        options: [
            { _id: 'a', option_text: 'Sango' },
            { _id: 'b', option_text: 'Tutu' },
            { _id: 'c', option_text: 'Negritude' },
            { _id: 'd', option_text: 'Anya' },
        ],
        correct_option_id: 'b',
        explanation: "'Tutu' was lost for decades before being discovered in a London flat and auctioned for over £1.2 million in 2018.",
        difficulty: 'moderate',
        category: 'art',
    }
];

export default function AdminQuizQuestionsPage() {
    // --------------------------------------------------
    // PROMPT GENERATOR STATE
    // --------------------------------------------------
    const [promptCategory, setPromptCategory] = useState<QuizCategory>('music');
    const [promptDifficulty, setPromptDifficulty] = useState<difficulty_level | 'mixed'>('mixed');
    const [promptCount, setPromptCount] = useState(5);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [copied, setCopied] = useState(false);

    // --------------------------------------------------
    // JSON IMPORTER STATE
    // --------------------------------------------------
    const [jsonInput, setJsonInput] = useState('');
    const [validationError, setValidationError] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState<question[]>([]);
    const [importSuccess, setImportSuccess] = useState('');

    // --------------------------------------------------
    // QUESTION POOL STATE
    // --------------------------------------------------
    const [questionPool, setQuestionPool] = useState<question[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

    // Load initial question pool
    useEffect(() => {
        const storedPool = localStorage.getItem('naija-vibe-question-pool');
        if (storedPool) {
            try {
                setQuestionPool(JSON.parse(storedPool));
            } catch {
                setQuestionPool(seedQuestions);
            }
        } else {
            setQuestionPool(seedQuestions);
            localStorage.setItem('naija-vibe-question-pool', JSON.stringify(seedQuestions));
        }
        
        generatePromptText('music', 'mixed', 5);
    }, []);

    // Generate prompt helper
    function generatePromptText(category: QuizCategory, diff: string, count: number) {
        const difficultyText = diff === 'mixed' 
            ? 'a balanced distribution of Easy, Moderate, and Difficult levels' 
            : `strictly ${diff} level`;

        const template = `Generate exactly ${count} multiple-choice trivia questions about Nigerian ${category.toUpperCase()} (music stars, trends, history, cultural significance).
The difficulty of these questions must be ${difficultyText}.

You MUST respond with a single, raw JSON array of objects (no markdown blocks, no markdown formatting, no leading/trailing commentary, just the raw JSON text) matching this TypeScript interface:

interface Question {
  _id: string; // Unique string identifier, e.g. "q-${category}-${Date.now()}-1"
  question_text: string; // Clear, highly engaging, historically accurate trivia question
  options: [
    { _id: "a"; option_text: string },
    { _id: "b"; option_text: string },
    { _id: "c"; option_text: string },
    { _id: "d"; option_text: string }
  ];
  correct_option_id: "a" | "b" | "c" | "d"; // The ID of the correct option
  explanation: string; // Educating details on the history or context of the answer
  difficulty: "easy" | "moderate" | "difficult"; // Difficulty rating
  category: "${category}"; // Must match the category exactly
}

Strict Example JSON structure (do not deviate from this shape):
[
  {
    "_id": "q-${category}-1",
    "question_text": "Which legendary artist is widely regarded as the pioneer of Afrobeat?",
    "options": [
      { "_id": "a", "option_text": "Sunny Ade" },
      { "_id": "b", "option_text": "Fela Kuti" },
      { "_id": "c", "option_text": "Osadebe" },
      { "_id": "d", "option_text": "Oliver De Coque" }
    ],
    "correct_option_id": "b",
    "explanation": "Fela Anikulapo-Kuti pioneered the Afrobeat genre in the late 1960s, fusing highlife, jazz, and traditional rhythms.",
    "difficulty": "easy",
    "category": "${category}"
  }
]`;
        setGeneratedPrompt(template);
    }

    // Handle parameter changes for prompt
    function handlePromptParamChange(category: QuizCategory, diff: difficulty_level | 'mixed', count: number) {
        setPromptCategory(category);
        setPromptDifficulty(diff);
        setPromptCount(count);
        generatePromptText(category, diff, count);
    }

    // Copy prompt to clipboard
    async function handleCopyPrompt() {
        if (!generatedPrompt) return;
        await navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // Validate JSON input
    function handleValidateJSON() {
        setValidationError('');
        setParsedQuestions([]);
        setImportSuccess('');

        if (!jsonInput.trim()) {
            setValidationError('JSON input is empty.');
            return;
        }

        try {
            // Strip any wrapping markdown code blocks if the user included them
            let cleanJson = jsonInput.trim();
            if (cleanJson.startsWith('```')) {
                const lines = cleanJson.split('\n');
                if (lines[0].startsWith('```json') || lines[0].startsWith('```')) {
                    lines.shift();
                }
                if (lines[lines.length - 1].startsWith('```')) {
                    lines.pop();
                }
                cleanJson = lines.join('\n').trim();
            }

            const parsed = JSON.parse(cleanJson);
            
            if (!Array.isArray(parsed)) {
                setValidationError('JSON must be a root array of question objects.');
                return;
            }

            if (parsed.length === 0) {
                setValidationError('The JSON array is empty.');
                return;
            }

            const validated: question[] = [];
            
            for (let i = 0; i < parsed.length; i++) {
                const item = parsed[i];
                const prefix = `Question ${i + 1}: `;

                if (!item.question_text || typeof item.question_text !== 'string') {
                    setValidationError(`${prefix}Missing or invalid "question_text" (must be string).`);
                    return;
                }

                if (!Array.isArray(item.options) || item.options.length !== 4) {
                    setValidationError(`${prefix}"options" must be an array of exactly 4 choices.`);
                    return;
                }

                for (let j = 0; j < 4; j++) {
                    const opt = item.options[j];
                    if (!opt || !opt._id || !opt.option_text || typeof opt.option_text !== 'string') {
                        setValidationError(`${prefix}Option ${j + 1} is missing "_id" or "option_text" (must be string).`);
                        return;
                    }
                }

                const optionIds = item.options.map((o: any) => o._id);
                if (!item.correct_option_id || !optionIds.includes(item.correct_option_id)) {
                    setValidationError(`${prefix}"correct_option_id" (${item.correct_option_id}) must match one of the options: ${optionIds.join(', ')}.`);
                    return;
                }

                if (!item.difficulty || !['easy', 'moderate', 'difficult'].includes(item.difficulty)) {
                    setValidationError(`${prefix}"difficulty" must be "easy", "moderate", or "difficult".`);
                    return;
                }

                if (!item.category || !['music', 'movies', 'geography', 'art'].includes(item.category)) {
                    setValidationError(`${prefix}"category" must be "music", "movies", "geography", or "art".`);
                    return;
                }

                validated.push({
                    _id: item._id || `q-imported-${Date.now()}-${i}`,
                    question_text: item.question_text,
                    options: item.options.map((o: any) => ({ _id: o._id, option_text: o.option_text })),
                    correct_option_id: item.correct_option_id,
                    explanation: item.explanation || 'No explanation provided.',
                    difficulty: item.difficulty as difficulty_level,
                    category: item.category as categories
                });
            }

            setParsedQuestions(validated);
        } catch (e: any) {
            setValidationError(`Malformed JSON syntax: ${e.message}`);
        }
    }

    // Save parsed questions to pool
    function handleImportQuestions() {
        if (parsedQuestions.length === 0) return;

        const updatedPool = [...questionPool, ...parsedQuestions];
        setQuestionPool(updatedPool);
        localStorage.setItem('naija-vibe-question-pool', JSON.stringify(updatedPool));

        // Also check if they want to update the weekly quiz settings with this imported block
        const storedWeekly = localStorage.getItem('naija-vibe-weekly-quiz');
        if (storedWeekly) {
            try {
                const parsedWeekly = JSON.parse(storedWeekly);
                if (parsedWeekly.category === parsedQuestions[0].category) {
                    parsedWeekly.questions = [...(parsedWeekly.questions || []), ...parsedQuestions].slice(-5);
                    localStorage.setItem('naija-vibe-weekly-quiz', JSON.stringify(parsedWeekly));
                }
            } catch (e) {
                console.error('Failed to auto-update weekly quiz', e);
            }
        }

        setImportSuccess(`Successfully imported ${parsedQuestions.length} questions into the pool!`);
        setJsonInput('');
        setParsedQuestions([]);
        
        setTimeout(() => setImportSuccess(''), 4500);
    }

    // Delete question from pool
    function handleDeleteQuestion(id: string) {
        const updatedPool = questionPool.filter(q => q._id !== id);
        setQuestionPool(updatedPool);
        localStorage.setItem('naija-vibe-question-pool', JSON.stringify(updatedPool));
    }

    // Filter questions
    const filteredQuestions = questionPool.filter((q) => {
        const matchCategory = filterCategory === 'all' || q.category === filterCategory;
        const matchDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
        const matchSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchDifficulty && matchSearch;
    });

    return (
        <main className='px-4 md:px-8 py-8 max-w-6xl mx-auto'>
            {/* Header */}
            <div className='mb-8 border-b border-gray-200 pb-6'>
                <h1 className='text-3xl font-black text-[#1A1A1A] tracking-tight flex items-center gap-2'>
                    <ClipboardList className='h-8 w-8 text-[#1A3C2E]' />
                    Question Creator & Importer
                </h1>
                <p className='text-sm text-gray-500 mt-1'>
                    Utilize AI tools to draft high-fidelity multiple-choice questions, validate their structure, and append them directly to the active question pool.
                </p>
            </div>

            {/* Success and error notifications */}
            {importSuccess && (
                <div className='mb-6 flex items-center gap-2 bg-[#EEF4F0] border border-[#1A3C2E]/20 text-[#1A3C2E] px-4 py-3 rounded-xl shadow-sm text-sm animate-fadeIn'>
                    <CheckCircle2 className='h-5 w-5 text-[#D4A017]' />
                    <span className='font-medium'>{importSuccess}</span>
                </div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                
                {/* Left Column: Creator and Importer */}
                <div className='lg:col-span-6 space-y-6'>
                    
                    {/* Prompt Builder */}
                    <div className='bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm'>
                        <div className='flex items-center gap-2 mb-4'>
                            <Sparkles className='h-5 w-5 text-[#D4A017] fill-current' />
                            <h2 className='text-lg font-extrabold text-[#1A1A1A]'>
                                AI Prompt Generator
                            </h2>
                        </div>
                        
                        {/* Parameters */}
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4'>
                            <div>
                                <label className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1'>Category</label>
                                <select
                                    value={promptCategory}
                                    onChange={(e) => handlePromptParamChange(e.target.value as QuizCategory, promptDifficulty, promptCount)}
                                    className='w-full bg-gray-50 text-[#1A1A1A] text-xs font-semibold rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:border-[#1A3C2E]'
                                >
                                    <option value='music'>Music</option>
                                    <option value='movies'>Movies</option>
                                    <option value='geography'>Geography</option>
                                    <option value='art'>Art</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1'>Difficulty</label>
                                <select
                                    value={promptDifficulty}
                                    onChange={(e) => handlePromptParamChange(promptCategory, e.target.value as difficulty_level | 'mixed', promptCount)}
                                    className='w-full bg-gray-50 text-[#1A1A1A] text-xs font-semibold rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:border-[#1A3C2E]'
                                >
                                    <option value='mixed'>Mixed Diff</option>
                                    <option value='easy'>Easy Only</option>
                                    <option value='moderate'>Moderate Only</option>
                                    <option value='difficult'>Difficult Only</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1'>Amount</label>
                                <select
                                    value={promptCount}
                                    onChange={(e) => handlePromptParamChange(promptCategory, promptDifficulty, parseInt(e.target.value))}
                                    className='w-full bg-gray-50 text-[#1A1A1A] text-xs font-semibold rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:border-[#1A3C2E]'
                                >
                                    <option value={5}>5 Questions</option>
                                    <option value={10}>10 Questions</option>
                                    <option value={15}>15 Questions</option>
                                    <option value={20}>20 Questions</option>
                                </select>
                            </div>
                        </div>

                        {/* Generated Output Box */}
                        <div className='relative mt-4'>
                            <textarea
                                readOnly
                                value={generatedPrompt}
                                rows={8}
                                className='w-full bg-[#1A1A1A] text-zinc-300 text-[11px] font-mono rounded-xl p-4 pr-12 focus:outline-none leading-relaxed border border-zinc-800'
                            />
                            <button
                                type='button'
                                onClick={handleCopyPrompt}
                                className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${
                                    copied 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                                title='Copy to clipboard'
                            >
                                {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                            </button>
                        </div>
                        <p className='text-[11px] text-gray-400 mt-2'>
                            Copy this structured prompt and paste it into an AI assistant like Gemini or Claude to generate questions.
                        </p>
                    </div>

                    {/* JSON Importer */}
                    <div className='bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm'>
                        <div className='flex items-center gap-2 mb-4'>
                            <FileJson className='h-5 w-5 text-[#1A3C2E]' />
                            <h2 className='text-lg font-extrabold text-[#1A1A1A]'>
                                Import AI JSON Output
                            </h2>
                        </div>

                        <div className='space-y-4'>
                            <div>
                                <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                                    Paste JSON Content
                                </label>
                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    placeholder='[\n  {\n    "_id": "q-music-1",\n    "question_text": "...",\n    "options": [...],\n    ...\n  }\n]'
                                    rows={8}
                                    className='w-full bg-gray-50 border border-[#E5E5E5] rounded-xl p-3.5 text-xs font-mono focus:outline-none focus:border-[#1A3C2E] focus:bg-white leading-relaxed'
                                />
                            </div>

                            {validationError && (
                                <div className='flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs'>
                                    <AlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
                                    <p className='font-medium'>{validationError}</p>
                                </div>
                            )}

                            <div className='flex gap-3 justify-end'>
                                {parsedQuestions.length > 0 && (
                                    <button
                                        type='button'
                                        onClick={handleImportQuestions}
                                        className='flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1A3C2E] hover:bg-[#142e23] text-white px-5 py-2.5 text-sm font-bold shadow-md transition active:scale-95'
                                    >
                                        <CheckCircle2 className='h-4 w-4 text-[#D4A017]' />
                                        Commit {parsedQuestions.length} Questions
                                    </button>
                                )}
                                <button
                                    type='button'
                                    onClick={handleValidateJSON}
                                    className={`px-5 py-2.5 text-sm font-bold rounded-xl border transition active:scale-95 ${
                                        parsedQuestions.length > 0
                                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'
                                            : 'bg-[#1A3C2E] hover:bg-[#142e23] text-white border-transparent w-full'
                                    }`}
                                >
                                    Validate JSON Schema
                                </button>
                            </div>
                        </div>

                        {/* Parsed Preview Section */}
                        {parsedQuestions.length > 0 && (
                            <div className='mt-6 border-t border-gray-150 pt-5'>
                                <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3'>
                                    Import Validation Preview
                                </h3>
                                <div className='space-y-3 max-h-60 overflow-y-auto pr-2'>
                                    {parsedQuestions.map((q, idx) => (
                                        <div key={idx} className='bg-[#FBFBFA] border border-gray-200 rounded-xl p-3.5 text-xs relative'>
                                            <div className='flex items-center gap-1.5 mb-1.5'>
                                                <span className='bg-[#EEF4F0] text-[#1A3C2E] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase'>
                                                    {q.difficulty}
                                                </span>
                                                <span className='bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize'>
                                                    {q.category}
                                                </span>
                                            </div>
                                            <p className='font-bold text-gray-800'>{q.question_text}</p>
                                            <div className='mt-2 pl-3 border-l-2 border-[#1A3C2E]/20 space-y-1 text-gray-500'>
                                                {q.options.map((opt) => (
                                                    <div key={opt._id} className={opt._id === q.correct_option_id ? 'text-[#1A3C2E] font-bold' : ''}>
                                                        {opt._id.toUpperCase()}: {opt.option_text}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Question Pool Browser */}
                <div className='lg:col-span-6'>
                    <div className='bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm min-h-[500px] flex flex-col'>
                        
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-lg font-extrabold text-[#1A1A1A]'>
                                Question Pool Browser ({filteredQuestions.length})
                            </h2>
                        </div>

                        {/* Search and Filters */}
                        <div className='space-y-3 mb-6'>
                            <div className='relative'>
                                <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                                <input
                                    type='text'
                                    placeholder='Search questions or explanations...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='w-full rounded-xl border border-[#E5E5E5] pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#1A3C2E]'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-3'>
                                <div className='flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-150 px-2.5 py-1.5'>
                                    <Filter className='h-3.5 w-3.5 text-gray-400' />
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className='bg-transparent text-xs font-semibold focus:outline-none cursor-pointer w-full text-gray-650'
                                    >
                                        <option value='all'>All Categories</option>
                                        <option value='music'>Music</option>
                                        <option value='movies'>Movies</option>
                                        <option value='geography'>Geography</option>
                                        <option value='art'>Art</option>
                                    </select>
                                </div>

                                <div className='flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-150 px-2.5 py-1.5'>
                                    <Filter className='h-3.5 w-3.5 text-gray-400' />
                                    <select
                                        value={filterDifficulty}
                                        onChange={(e) => setFilterDifficulty(e.target.value)}
                                        className='bg-transparent text-xs font-semibold focus:outline-none cursor-pointer w-full text-gray-650'
                                    >
                                        <option value='all'>All Difficulties</option>
                                        <option value='easy'>Easy</option>
                                        <option value='moderate'>Moderate</option>
                                        <option value='difficult'>Difficult</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* List of Questions in Pool */}
                        <div className='flex-1 overflow-y-auto space-y-3.5 max-h-[620px] pr-2'>
                            {filteredQuestions.length === 0 ? (
                                <div className='text-center py-20 text-gray-450 border border-dashed border-gray-150 rounded-xl'>
                                    No questions match your current search parameters.
                                </div>
                            ) : (
                                filteredQuestions.map((q, idx) => {
                                    const isExpanded = expandedQuestion === q._id;
                                    return (
                                        <div 
                                            key={q._id || idx}
                                            className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                                                isExpanded ? 'border-[#1A3C2E]/30 bg-[#EEF4F0]/5' : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                        >
                                            {/* Header */}
                                            <div className='w-full flex items-start gap-4 p-4 text-left font-medium'>
                                                <button
                                                    type='button'
                                                    onClick={() => setExpandedQuestion(isExpanded ? null : q._id)}
                                                    className='flex-1 text-left'
                                                >
                                                    <div className='flex items-center gap-2 mb-1.5'>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                            q.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                                                            q.difficulty === 'moderate' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                                        }`}>
                                                            {q.difficulty}
                                                        </span>
                                                        <span className='text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold capitalize'>
                                                            {q.category}
                                                        </span>
                                                    </div>
                                                    <p className='text-xs font-bold text-[#1A1A1A] leading-relaxed'>{q.question_text}</p>
                                                </button>

                                                <div className='flex items-center gap-2.5 mt-0.5'>
                                                    <button
                                                        type='button'
                                                        onClick={() => handleDeleteQuestion(q._id)}
                                                        className='text-gray-350 hover:text-red-655 p-1 rounded-md hover:bg-red-50 transition'
                                                        title='Delete from pool'
                                                    >
                                                        <Trash2 className='h-3.5 w-3.5' />
                                                    </button>
                                                    <button
                                                        type='button'
                                                        onClick={() => setExpandedQuestion(isExpanded ? null : q._id)}
                                                        className='text-gray-400'
                                                    >
                                                        {isExpanded ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Collapsed body */}
                                            {isExpanded && (
                                                <div className='px-4 pb-4 pt-1 bg-[#FBFBFA] border-t border-gray-100/50'>
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
                                                                    <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[10px] ${
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
                                                        <div className='mt-3.5 p-3 bg-white rounded-lg border border-gray-100 text-xs text-gray-500'>
                                                            <strong className='text-gray-700 font-bold block mb-0.5'>Explanation:</strong>
                                                            {q.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </main>
    );
}