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
import type { QuestionWithOptions, QuizCategory, DifficultyLevel } from '@/lib/database_types/quiz_types';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const seedQuestions: QuestionWithOptions[] = [
    // Music
    {
        id: 'm1',
        question_text: 'Which artist popularized the global breakout hit “One Dance”?',
        options: [
            { id: 'a', question_id: 'm1', option_text: 'Wizkid' },
            { id: 'b', question_id: 'm1', option_text: 'Olamide' },
            { id: 'c', question_id: 'm1', option_text: 'Burna Boy' },
            { id: 'd', question_id: 'm1', option_text: 'Flavour' },
        ],
        correct_option_id: 'a',
        explanation: 'Wizkid was featured on “One Dance,” helping push the record into global pop culture.',
        difficulty: 'easy',
        category: 'music',
    },
    {
        id: 'm2',
        question_text: 'Fela Anikulapo-Kuti is globally celebrated as the pioneer of which music genre?',
        options: [
            { id: 'a', question_id: 'm2', option_text: 'Highlife' },
            { id: 'b', question_id: 'm2', option_text: 'Afrobeat' },
            { id: 'c', question_id: 'm2', option_text: 'Juju' },
            { id: 'd', question_id: 'm2', option_text: 'Apala' },
        ],
        correct_option_id: 'b',
        explanation: 'Fela Kuti created Afrobeat in the late 1960s, blending highlife, jazz, and traditional Yoruba rhythms.',
        difficulty: 'easy',
        category: 'music',
    },
    {
        id: 'm3',
        question_text: 'Which Nigerian artist won the Best Global Music Album award at the 63rd Annual Grammy Awards?',
        options: [
            { id: 'a', question_id: 'm3', option_text: 'Davido' },
            { id: 'b', question_id: 'm3', option_text: 'Wizkid' },
            { id: 'c', question_id: 'm3', option_text: 'Burna Boy' },
            { id: 'd', question_id: 'm3', option_text: 'Rema' },
        ],
        correct_option_id: 'c',
        explanation: 'Burna Boy won the Best Global Music Album Grammy for his 2020 record "Twice as Tall".',
        difficulty: 'moderate',
        category: 'music',
    },
    // Movies
    {
        id: 'f1',
        question_text: 'Which movie franchise is best known for the character Ebere, the detective from Lagos?',
        options: [
            { id: 'a', question_id: 'f1', option_text: 'Living in Bondage' },
            { id: 'b', question_id: 'f1', option_text: 'The Figurine' },
            { id: 'c', question_id: 'f1', option_text: 'King of Boys' },
            { id: 'd', question_id: 'f1', option_text: 'Citation' },
        ],
        correct_option_id: 'c',
        explanation: 'King of Boys is the correct pick for this crime-thriller style clue.',
        difficulty: 'moderate',
        category: 'movies',
    },
    {
        id: 'f2',
        question_text: 'Which movie directed by Funke Akindele became the highest-grossing Nollywood film of all time?',
        options: [
            { id: 'a', question_id: 'f2', option_text: 'A Tribe Called Judah' },
            { id: 'b', question_id: 'f2', option_text: 'Omo Ghetto: The Saga' },
            { id: 'c', question_id: 'f2', option_text: 'Battle on Buka Street' },
            { id: 'd', question_id: 'f2', option_text: 'The Wedding Party' },
        ],
        correct_option_id: 'a',
        explanation: "Funke Akindele's 'A Tribe Called Judah' grossed over 1.4 billion Naira, making history as Nollywood's highest earner.",
        difficulty: 'easy',
        category: 'movies',
    },
    // Geography
    {
        id: 'g1',
        question_text: 'What is the capital city of Nigeria, which replaced Lagos in December 1991?',
        options: [
            { id: 'a', question_id: 'g1', option_text: 'Abuja' },
            { id: 'b', question_id: 'g1', option_text: 'Ibadan' },
            { id: 'c', question_id: 'g1', option_text: 'Port Harcourt' },
            { id: 'd', question_id: 'g1', option_text: 'Enugu' },
        ],
        correct_option_id: 'a',
        explanation: 'Abuja was chosen as the federal capital city for its central geographical location and neutrality.',
        difficulty: 'easy',
        category: 'geography',
    },
    {
        id: 'g2',
        question_text: 'Which river is the longest in Nigeria and forms a confluence with River Benue at Lokoja?',
        options: [
            { id: 'a', question_id: 'g2', option_text: 'River Benue' },
            { id: 'b', question_id: 'g2', option_text: 'River Kaduna' },
            { id: 'c', question_id: 'g2', option_text: 'River Niger' },
            { id: 'd', question_id: 'g2', option_text: 'River Cross' },
        ],
        correct_option_id: 'c',
        explanation: 'The River Niger is the principal river of West Africa, extending about 4,180 km.',
        difficulty: 'easy',
        category: 'geography',
    },
    // Art
    {
        id: 'a1',
        question_text: "Which world-famous Nigerian painting of a princess by Ben Enwonwu is often called the 'African Mona Lisa'?",
        options: [
            { id: 'a', question_id: 'a1', option_text: 'Sango' },
            { id: 'b', question_id: 'a1', option_text: 'Tutu' },
            { id: 'c', question_id: 'a1', option_text: 'Negritude' },
            { id: 'd', question_id: 'a1', option_text: 'Anya' },
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
    const [promptDifficulty, setPromptDifficulty] = useState<DifficultyLevel | 'mixed'>('mixed');
    const [promptCount, setPromptCount] = useState(10);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [copied, setCopied] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    // --------------------------------------------------
    // JSON IMPORTER STATE
    // --------------------------------------------------
    const [jsonInput, setJsonInput] = useState('');
    const [validationError, setValidationError] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState<QuestionWithOptions[]>([]);
    const [importSuccess, setImportSuccess] = useState('');

    // --------------------------------------------------
    // QUESTION POOL STATE
    // --------------------------------------------------
    const [questionPool, setQuestionPool] = useState<QuestionWithOptions[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

    // Load initial question pool from Supabase
    useEffect(() => {
        async function fetchQuestions() {
            setLoading(true);
            try {
                const supabase = getSupabaseBrowserClient();
                const { data, error } = await supabase
                    .from('questions')
                    .select('*, options!options_question_id_fkey(*)');

                if (error) {
                    throw error;
                }
                
                if (data && data.length > 0) {
                    setQuestionPool(data as QuestionWithOptions[]);
                } else {
                    setQuestionPool([]);
                }
            } catch (err) {
                console.error('Failed to fetch questions from database', err);
            } finally {
                setLoading(false);
                setPageLoading(false);
            }
        }
        fetchQuestions();
        generatePromptText('music', 'mixed', 10);
    }, []);

    // Generate prompt helper using the refined Nigerian expert prompt
    function generatePromptText(category: QuizCategory, diff: string, count: number) {
        let easyCount = 0;
        let moderateCount = 0;
        let difficultCount = 0;

        if (diff === 'mixed') {
            easyCount = Math.round(count * 0.35);
            moderateCount = Math.round(count * 0.35);
            difficultCount = count - easyCount - moderateCount;
        } else if (diff === 'easy') {
            easyCount = count;
        } else if (diff === 'moderate') {
            moderateCount = count;
        } else if (diff === 'difficult') {
            difficultCount = count;
        }

        const categoryLabel = category === 'music' ? 'music (music stars, genres, trends, history, cultural movements, and global impact)' :
                              category === 'movies' ? 'movies (Nollywood films, directors, actors, box office records, and cultural impact)' :
                              category === 'geography' ? 'geography (Nigerian states, landmarks, historical sites, borders, and natural features)' :
                              'art (fine arts, traditional crafts like Adire and Nok culture, pioneered artists, and galleries)';

        const eraDescription = category === 'music' ? 'from Highlife and Jùjú roots (1950s–1970s), through Afrobeat and Fuji (1970s–1990s), into the Afrobeats/contemporary era (2000s–present)' :
                               category === 'movies' ? 'from early cinema and television roots (1965-1990), through the home video boom (1990s-2000s), into New Nollywood and modern cinema' :
                               category === 'geography' ? 'spanning historical boundaries, geopolitical zones, national resources, physical geography, and capitals' :
                               'covering traditional classical African art, mid-century modern pioneers, up to contemporary international galleries and artists';

        const distributionText = diff === 'mixed'
            ? `- ${easyCount} Easy questions\n- ${moderateCount} Moderate questions\n- ${difficultCount} Difficult questions`
            : `- ${count} ${diff} questions`;

        const template = `You are a highly knowledgeable Nigerian ${category} trivia expert. Generate exactly ${count} multiple-choice trivia questions about Nigerian ${categoryLabel}.

**Difficulty Distribution (strictly enforced):**
${distributionText}

**Content & Accuracy Standards:**
- Every question must be grounded in verifiable, multi-source factual information — covering areas such as key historical dates, award histories, origins, collaborations, records, and cultural milestones in Nigerian history.
- Do NOT generate questions about topics commonly misattributed, disputed without consensus, or frequently confused in AI-generated trivia. If a fact cannot be confirmed across multiple credible sources, do not use it.
- Questions must span a wide range of eras: ${eraDescription}.
- Incorrect options (distractors) must be plausible and thematically relevant — never random or obviously wrong.

**Output Rules — STRICTLY ENFORCED:**
- Respond with a single raw JSON array only.
- No markdown code blocks, no backticks, no commentary before or after the JSON.
- No trailing commas. Valid, parseable JSON only.
- Every object must exactly match this TypeScript interface:

\`\`\`
interface Question {
  id: string; // e.g. "q-${category}-\${Date.now()}-1"
  question_text: string;
  options: [
    { id: "a"; option_text: string },
    { id: "b"; option_text: string },
    { id: "c"; option_text: string },
    { id: "d"; option_text: string }
  ];
  correct_option_id: "a" | "b" | "c" | "d";
  explanation: string;
  difficulty: "easy" | "moderate" | "difficult";
  category: "${category}";
}
\`\`\`

- \`explanation\` must be 2–4 sentences providing rich historical or cultural context that educates the reader beyond the question itself.
- \`question_text\` must be specific, engaging, and unambiguous — avoid vague phrasing like "which artist is known for…"
- \`id\` must be unique across all ${count} questions using the format \`q-${category}-\${timestamp}-\${index}\`.`;

        setGeneratedPrompt(template);
    }

    // Handle parameter changes for prompt
    function handlePromptParamChange(category: QuizCategory, diff: DifficultyLevel | 'mixed', count: number) {
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

            const validated: QuestionWithOptions[] = [];

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
                    if (!opt || !opt.id || !opt.option_text || typeof opt.option_text !== 'string') {
                        setValidationError(`${prefix}Option ${j + 1} is missing "id" or "option_text" (must be string).`);
                        return;
                    }
                }

                const optionIds = item.options.map((o: any) => o.id);
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
                    id: item.id || `q-imported-${Date.now()}-${i}`,
                    question_text: item.question_text,
                    options: item.options.map((o: any) => ({ id: o.id, question_id: item.id || `q-imported-${Date.now()}-${i}`, option_text: o.option_text })),
                    correct_option_id: item.correct_option_id,
                    explanation: item.explanation || 'No explanation provided.',
                    difficulty: item.difficulty as DifficultyLevel,
                    category: item.category as QuizCategory
                });
            }

            setParsedQuestions(validated);
        } catch (e: any) {
            setValidationError(`Malformed JSON syntax: ${e.message}`);
        }
    }

    // Save parsed questions to Supabase
    async function handleImportQuestions() {
        if (parsedQuestions.length === 0) return;
        setLoading(true);
        setValidationError('');
        
        try {
            const supabase = getSupabaseBrowserClient();
            
            // 1. Generate real UUIDs for questions and options to match them up
            const preparedQuestions = parsedQuestions.map(q => {
                const qId = crypto.randomUUID();
                
                // Map options to have the new question UUID and new option UUIDs
                const mappedOptions = q.options.map(opt => ({
                    id: crypto.randomUUID(),
                    oldId: opt.id, // Keep old ID to map correct_option_id
                    question_id: qId,
                    option_text: opt.option_text
                }));
                
                // Find the new option UUID for the correct option
                const correctOpt = mappedOptions.find(o => o.oldId === q.correct_option_id);
                
                return {
                    id: qId,
                    question_text: q.question_text,
                    correct_option_id: correctOpt ? correctOpt.id : null,
                    explanation: q.explanation,
                    difficulty: q.difficulty,
                    category: q.category,
                    options: mappedOptions
                };
            });
            
            // 2. Insert questions with correct_option_id as NULL first (to avoid FK violation)
            const questionsToInsert = preparedQuestions.map(q => ({
                id: q.id,
                question_text: q.question_text,
                correct_option_id: null,
                explanation: q.explanation,
                difficulty: q.difficulty,
                category: q.category
            }));
            
            const { error: qError } = await supabase
                .from('questions')
                .insert(questionsToInsert);
                
            if (qError) throw qError;
            
            // 3. Insert options
            const optionsToInsert = preparedQuestions.flatMap(q => 
                q.options.map(opt => ({
                    id: opt.id,
                    question_id: opt.question_id,
                    option_text: opt.option_text
                }))
            );
            
            const { error: oError } = await supabase
                .from('options')
                .insert(optionsToInsert);
                
            if (oError) throw oError;
            
            // 4. Update questions with their correct_option_id
            for (const q of preparedQuestions) {
                if (q.correct_option_id) {
                    const { error: updateError } = await supabase
                        .from('questions')
                        .update({ correct_option_id: q.correct_option_id })
                        .eq('id', q.id);
                        
                    if (updateError) throw updateError;
                }
            }
            
            // 5. Fetch updated questions to refresh pool
            const { data: updatedData, error: fetchError } = await supabase
                .from('questions')
                .select('*, options!options_question_id_fkey(*)');
                
            if (fetchError) throw fetchError;
            
            if (updatedData) {
                setQuestionPool(updatedData as QuestionWithOptions[]);
            }
            
            setImportSuccess(`Successfully imported ${parsedQuestions.length} questions into Supabase!`);
            setJsonInput('');
            setParsedQuestions([]);
            
            setTimeout(() => setImportSuccess(''), 4500);
        } catch (err: any) {
            console.error('Failed to import questions to Supabase', err);
            setValidationError(`Import failed: ${err.message || err}`);
        } finally {
            setLoading(false);
        }
    }

    // Delete question from Supabase
    async function handleDeleteQuestion(id: string) {
        if (!confirm('Are you sure you want to delete this question?')) return;
        setLoading(true);
        try {
            const supabase = getSupabaseBrowserClient();
            
            // Delete from questions table (cascade deletes options automatically)
            const { error } = await supabase
                .from('questions')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            setQuestionPool(prev => prev.filter(q => q.id !== id));
        } catch (err) {
            console.error('Failed to delete question from Supabase', err);
            alert('Failed to delete question.');
        } finally {
            setLoading(false);
        }
    }

    // Filter questions
    const filteredQuestions = questionPool.filter((q) => {
        const matchCategory = filterCategory === 'all' || q.category === filterCategory;
        const matchDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
        const matchSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q?.explanation?.toLowerCase().includes(searchQuery.toLowerCase());
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
                                    onChange={(e) => handlePromptParamChange(promptCategory, e.target.value as DifficultyLevel | 'mixed', promptCount)}
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
                                <input
                                    type='number'
                                    min='1'
                                    max='20'
                                    value={promptCount}
                                    onChange={(e) => {
                                        const val = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
                                        handlePromptParamChange(promptCategory, promptDifficulty, val);
                                    }}
                                    className='w-full bg-gray-50 text-[#1A1A1A] text-xs font-semibold rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:border-[#1A3C2E]'
                                />
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
                                className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${copied
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
                                    placeholder='[\n  {\n    "id": "q-music-1",\n    "question_text": "...",\n    "options": [...],\n    ...\n  }\n]'
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
                                    className={`px-5 py-2.5 text-sm font-bold rounded-xl border transition active:scale-95 ${parsedQuestions.length > 0
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
                                                    <div key={opt.id} className={opt.id === q.correct_option_id ? 'text-[#1A3C2E] font-bold' : ''}>
                                                        {opt.id.toUpperCase()}: {opt.option_text}
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
                            {pageLoading ? (
                                <div className='flex flex-col items-center justify-center py-20 text-gray-400 border border-dashed border-gray-150 rounded-xl space-y-3'>
                                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3C2E]' />
                                    <span className='text-xs font-semibold'>Loading question pool...</span>
                                </div>
                            ) : filteredQuestions.length === 0 ? (
                                <div className='text-center py-20 text-gray-450 border border-dashed border-gray-150 rounded-xl'>
                                    No questions match your current search parameters.
                                </div>
                            ) : (
                                filteredQuestions.map((q, idx) => {
                                    const isExpanded = expandedQuestion === q.id;
                                    return (
                                        <div
                                            key={q.id || idx}
                                            className={`border rounded-xl transition-all duration-200 overflow-hidden ${isExpanded ? 'border-[#1A3C2E]/30 bg-[#EEF4F0]/5' : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            {/* Header */}
                                            <div className='w-full flex items-start gap-4 p-4 text-left font-medium'>
                                                <button
                                                    type='button'
                                                    onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                                                    className='flex-1 text-left'
                                                >
                                                    <div className='flex items-center gap-2 mb-1.5'>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${q.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
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
                                                        onClick={() => handleDeleteQuestion(q.id)}
                                                        className='text-gray-350 hover:text-red-655 p-1 rounded-md hover:bg-red-50 transition'
                                                        title='Delete from pool'
                                                    >
                                                        <Trash2 className='h-3.5 w-3.5' />
                                                    </button>
                                                    <button
                                                        type='button'
                                                        onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                                                        className='text-gray-400'
                                                    >
                                                        {isExpanded ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Collapsed body */}
                                            {isExpanded && (
                                                <div className='px-4 pb-4 pt-1 bg-[#FBFBFA] border-t border-gray-150/50'>
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
                                                                    <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[10px] ${isCorrect ? 'bg-[#1A3C2E] text-white' : 'bg-gray-100 text-gray-500'
                                                                        }`}>
                                                                        {opt.id.toUpperCase()}
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

// Simple fallback local icon since ClipboardList is imported from Lucide
function ClipboardListIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns='http://www.w3.org/2500/svg'
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