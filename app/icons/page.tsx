'use client';

import { useState } from 'react';
import { X, Globe, Award, ExternalLink } from 'lucide-react';

type Icon = {
    name: string;
    field: string;
    tagline: string;
    image: string;
    born: string;
    origin: string;
    achievements: string[];
    globalImpact: string;
    quote: string;
};

const globalIcons: Icon[] = [
    {
        name: 'Wole Soyinka',
        field: 'Literature',
        tagline: 'First African Nobel Laureate in Literature',
        image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
        born: '1934',
        origin: 'Abeokuta, Ogun State',
        achievements: [
            'Nobel Prize in Literature (1986)',
            'Author of Death and the King\'s Horseman',
            'Professor Emeritus at Obafemi Awolowo University',
            'Recipient of the Anisfield-Wolf Book Award'
        ],
        globalImpact: 'Soyinka\'s works blend Yoruba mythology with Western dramatic traditions, pioneering African literary modernism and giving a global voice to postcolonial identity.',
        quote: 'The man dies in all who keep silent in the face of tyranny.'
    },
    {
        name: 'Chinua Achebe',
        field: 'Literature',
        tagline: 'Author of the most read African novel in history',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        born: '1930 – 2013',
        origin: 'Ogidi, Anambra State',
        achievements: [
            'Authored Things Fall Apart — translated into 57+ languages',
            'Man Booker International Prize (2007)',
            'Fellow of the British Academy',
            'UNESCO 60th Anniversary Medal'
        ],
        globalImpact: 'Things Fall Apart redefined African literature on the world stage and became required reading in universities across six continents, challenging Western narratives of Africa.',
        quote: 'Until the lion learns to write, every story will glorify the hunter.'
    },
    {
        name: 'Ngozi Okonjo-Iweala',
        field: 'Economics & Global Governance',
        tagline: 'Director-General of the World Trade Organization',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
        born: '1954',
        origin: 'Ogwashi-Ukwu, Delta State',
        achievements: [
            'First woman & African to lead the WTO (2021–present)',
            'Two-time Nigeria Finance Minister',
            'Managing Director, World Bank',
            'TIME 100 Most Influential People (multiple years)'
        ],
        globalImpact: 'Reshaping global trade policy with a focus on vaccine equity, digital trade, and sustainable development. A symbol of African excellence in multilateral institutions.',
        quote: 'Africa is open for business — and we must own that story ourselves.'
    },
    {
        name: 'Philip Emeagwali',
        field: 'Technology',
        tagline: 'The man who invented the formula that runs the Internet',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        born: '1954',
        origin: 'Akure, Ondo State',
        achievements: [
            'Gordon Bell Prize — world\'s highest computing honour (1989)',
            'Designed the Connection Machine supercomputer protocol',
            'IEEE Computer Society Pioneer Award',
            'Called "a father of the Internet" by President Bill Clinton'
        ],
        globalImpact: 'His breakthrough computation using 65,536 microprocessors laid the architectural groundwork for modern massively parallel computing and Internet infrastructure.',
        quote: 'What made me a great computer scientist was being a child of a war. Curiosity was my survival instinct.'
    },
    {
        name: 'Hakeem Olajuwon',
        field: 'Sport',
        tagline: 'The Dream — Greatest centre in NBA history',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
        born: '1963',
        origin: 'Lagos, Lagos State',
        achievements: [
            '2× NBA Champion (1994, 1995)',
            'NBA Finals MVP (1994, 1995)',
            '2× NBA Defensive Player of the Year',
            'Basketball Hall of Fame inductee (2008)'
        ],
        globalImpact: 'The first international player to win the NBA Finals MVP, Olajuwon shattered the perception that greatness in basketball was a solely American domain.',
        quote: 'I never let anyone define my limits because of where I come from.'
    },
    {
        name: 'Aliko Dangote',
        field: 'Business',
        tagline: 'Africa\'s richest person — industrialist and nation builder',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
        born: '1957',
        origin: 'Kano, Kano State',
        achievements: [
            'Forbes Africa\'s richest person (15+ consecutive years)',
            'Founder of Dangote Group — Africa\'s largest conglomerate',
            'Dangote Refinery — Africa\'s largest oil refinery',
            'UN Secretary-General\'s Advocate for SDGs'
        ],
        globalImpact: 'Transforming African industrial self-reliance by building commodity supply chains that reduce the continent\'s dependence on imports across cement, sugar, and petroleum.',
        quote: 'Business is about making an impact. If it only makes money, it is a poor kind of business.'
    },
    {
        name: 'Fela Kuti',
        field: 'Music',
        tagline: 'Creator of Afrobeat — the genre that changed world music',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
        born: '1938 – 1997',
        origin: 'Abeokuta, Ogun State',
        achievements: [
            'Created Afrobeat — a genre synthesising jazz, funk, and Yoruba music',
            'Grammy Lifetime Achievement Award (posthumous 2024)',
            'Musical career spanning 200+ released tracks',
            'Subject of the Tony Award-winning Broadway musical Fela!'
        ],
        globalImpact: 'Fela used music as a weapon against tyranny, shaping political consciousness across Africa and inspiring generations of artists from Burna Boy to Paul McCartney.',
        quote: 'Music is the weapon of the future.'
    },
    {
        name: 'Chimamanda Ngozi Adichie',
        field: 'Literature & Feminism',
        tagline: 'Redefining African feminism for a global audience',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
        born: '1977',
        origin: 'Enugu, Enugu State',
        achievements: [
            'MacArthur Foundation "Genius" Fellowship',
            'Commonwealth Writers\' Prize for Half of a Yellow Sun',
            'TED Talk "We Should All Be Feminists" — 6M+ views',
            'Named among TIME 100 Most Influential People'
        ],
        globalImpact: 'Her essay "We Should All Be Feminists" was sampled by Beyoncé and distributed to every 16-year-old in Sweden, making her a cornerstone of modern global feminist discourse.',
        quote: 'The single story creates stereotypes, and the problem with stereotypes is not that they are untrue, but that they are incomplete.'
    },
    {
        name: 'Wizkid',
        field: 'Music',
        tagline: 'The Afrobeats superstar who conquered the globe',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
        born: '1990',
        origin: 'Surulere, Lagos State',
        achievements: [
            'Grammy Award winner — Best Global Music Performance (2022)',
            'First Nigerian artist to chart on the UK Singles Top 10',
            'Collaboration on Drake\'s "One Dance" — 1B+ streams',
            'Essence — one of the most-streamed African songs of all time'
        ],
        globalImpact: 'Wizkid placed Afrobeats permanently on the world\'s mainstream charts, turning Nigerian pop into a global cultural force that reshaped music industry conversations.',
        quote: 'Nigerian music is the best in the world. We just had to show the world.'
    },
    {
        name: 'Burna Boy',
        field: 'Music',
        tagline: 'The African Giant who brought Afro-fusion to every continent',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        born: '1991',
        origin: 'Port Harcourt, Rivers State',
        achievements: [
            'Grammy Award — Best Global Music Album, Twice As Tall (2021)',
            'BET Hip Hop Award, BET International Act',
            'Sold out Madison Square Garden and O2 Arena',
            'First African artist to headline Coachella'
        ],
        globalImpact: 'Burna Boy\'s blend of Afro-fusion, dancehall, and R&B has made him the face of a generation that refuses to be categorised — placing African storytelling at the centre of global pop culture.',
        quote: 'I am African. That is not a limitation — it is my superpower.'
    },
    {
        name: 'Tiwa Savage',
        field: 'Music',
        tagline: 'The Queen of Afrobeats',
        image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
        born: '1980',
        origin: 'Isale Eko, Lagos State',
        achievements: [
            'First African solo woman to perform at Coachella',
            'BET Best International Act (multiple years)',
            'Signed to Jay-Z\'s Roc Nation management',
            'MTV Africa Music Award — Artist of the Year'
        ],
        globalImpact: 'Tiwa Savage broke the male-dominated ceiling of Afrobeats and became its foremost female global ambassador, representing Nigeria on stages from Glastonbury to the Super Bowl pre-show.',
        quote: 'There is power in knowing who you are and where you come from.'
    },
    {
        name: 'Obiageli Ezekwesili',
        field: 'Education & Activism',
        tagline: 'Co-founder of Transparency International & education champion',
        image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face',
        born: '1963',
        origin: 'Anambra State',
        achievements: [
            'Co-founder of Transparency International',
            'World Bank Vice President for Africa',
            'Nigeria\'s Minister of Education',
            'Spearheaded the global #BringBackOurGirls campaign'
        ],
        globalImpact: 'Oby Ezekwesili translated her fight for accountability and education into a global movement — making #BringBackOurGirls a worldwide rallying cry for human rights.',
        quote: 'Leadership is not a title. It is accountability in action.'
    }
];

const FIELD_FILTERS = ['All', 'Literature', 'Music', 'Technology', 'Business', 'Sport', 'Economics & Global Governance', 'Literature & Feminism', 'Education & Activism'];

function IconModal({ icon, onClose }: { icon: Icon; onClose: () => void }) {
    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
            onClick={onClose}
        >
            <div
                className='relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Hero strip */}
                <div className='relative h-36 bg-gradient-to-br from-[#1A3C2E] to-[#2E6B52] overflow-hidden'>
                    <div className='absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)]' />
                    <button
                        type='button'
                        onClick={onClose}
                        aria-label='Close'
                        className='absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition'
                    >
                        <X className='h-4 w-4' />
                    </button>
                    <div className='absolute bottom-0 left-6 translate-y-1/2'>
                        <div className='h-20 w-20 rounded-2xl ring-4 ring-white overflow-hidden shadow-lg'>
                            <img
                                src={icon.image}
                                alt={icon.name}
                                className='h-full w-full object-cover'
                            />
                        </div>
                    </div>
                </div>

                <div className='px-6 pt-14 pb-7'>
                    {/* Name + field */}
                    <div className='flex flex-wrap items-start justify-between gap-2'>
                        <div>
                            <h2 className='text-2xl font-bold text-[#1A1A1A]'>{icon.name}</h2>
                            <p className='mt-0.5 text-sm text-gray-500 font-medium'>{icon.tagline}</p>
                        </div>
                        <span className='rounded-full border border-[#1A3C2E]/20 bg-[#EEF4F0] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1A3C2E]'>
                            {icon.field}
                        </span>
                    </div>

                    {/* Meta row */}
                    <div className='mt-4 flex flex-wrap gap-4 text-xs text-gray-500'>
                        <span><span className='font-semibold text-gray-700'>Born:</span> {icon.born}</span>
                        <span><span className='font-semibold text-gray-700'>Origin:</span> {icon.origin}</span>
                    </div>

                    {/* Quote */}
                    <blockquote className='mt-5 border-l-2 border-[#1A3C2E] pl-4 italic text-sm text-gray-600 leading-relaxed'>
                        "{icon.quote}"
                    </blockquote>

                    {/* Global impact */}
                    <div className='mt-5'>
                        <h3 className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5'>
                            <Globe className='h-3 w-3' /> Global Impact
                        </h3>
                        <p className='text-sm text-gray-600 leading-relaxed'>{icon.globalImpact}</p>
                    </div>

                    {/* Achievements */}
                    <div className='mt-5'>
                        <h3 className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5'>
                            <Award className='h-3 w-3' /> Key Achievements
                        </h3>
                        <ul className='space-y-2'>
                            {icon.achievements.map((a) => (
                                <li key={a} className='flex items-start gap-2 text-sm text-gray-700'>
                                    <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1A3C2E]' />
                                    {a}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function IconCard({ icon, onClick }: { icon: Icon; onClick: () => void }) {
    return (
        <button
            type='button'
            onClick={onClick}
            className='group w-full text-left rounded-2xl bg-white border border-[#E5E5E5] overflow-hidden shadow-sm hover:shadow-md hover:border-[#1A3C2E]/30 transition-all duration-200 active:scale-[0.98]'
        >
            {/* Image */}
            <div className='relative h-52 overflow-hidden bg-[#EEF4F0]'>
                <img
                    src={icon.image}
                    alt={icon.name}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
                <span className='absolute top-3 left-3 rounded-full bg-[#1A3C2E]/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white'>
                    {icon.field}
                </span>
                <span className='absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity'>
                    <ExternalLink className='h-3.5 w-3.5' />
                </span>
            </div>

            {/* Body */}
            <div className='p-4'>
                <h3 className='text-base font-bold text-[#1A1A1A] leading-snug'>{icon.name}</h3>
                <p className='mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2'>{icon.tagline}</p>

                <div className='mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#1A3C2E] uppercase tracking-wider'>
                    <Globe className='h-3 w-3' />
                    {icon.origin.split(',').slice(-1)[0].trim()}
                </div>
            </div>
        </button>
    );
}

export default function GlobalIconsPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);

    const displayed = activeFilter === 'All'
        ? globalIcons
        : globalIcons.filter((ic) => ic.field === activeFilter);

    return (
        <main className='min-h-screen bg-[#F5F5F0] text-[#1A1A1A]'>
            {/* Header */}
            <section className='px-6 sm:px-8 pt-10 pb-6 max-w-7xl mx-auto'>
                <div className='inline-flex items-center gap-1.5 rounded-full bg-[#EEF4F0] border border-[#1A3C2E]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#1A3C2E] mb-3'>
                    <Globe className='h-3 w-3' /> Celebrating Nigeria
                </div>
                <h1 className='text-4xl font-bold text-[#1A1A1A] tracking-tight'>Global Icons</h1>
                <p className='mt-2 max-w-xl text-sm text-gray-600 leading-relaxed'>
                    Nigerians who carried the green-white-green beyond our borders and left an indelible mark on the world — in science, arts, sport, and public life.
                </p>

                {/* Filter tabs */}
                <div className='mt-6 flex flex-wrap gap-2'>
                    {FIELD_FILTERS.map((f) => (
                        <button
                            key={f}
                            type='button'
                            onClick={() => setActiveFilter(f)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                activeFilter === f
                                    ? 'bg-[#1A3C2E] text-white shadow-sm'
                                    : 'bg-white border border-[#E5E5E5] text-gray-600 hover:border-[#1A3C2E]/30 hover:text-[#1A3C2E]'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </section>

            {/* Grid */}
            <section className='px-6 sm:px-8 pb-16 max-w-7xl mx-auto'>
                <p className='mb-5 text-xs text-gray-400 font-medium'>
                    {displayed.length} icon{displayed.length !== 1 ? 's' : ''}
                    {activeFilter !== 'All' ? ` in ${activeFilter}` : ''}
                </p>
                <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                    {displayed.map((icon) => (
                        <IconCard key={icon.name} icon={icon} onClick={() => setSelectedIcon(icon)} />
                    ))}
                </div>
            </section>

            {/* Modal */}
            {selectedIcon && (
                <IconModal icon={selectedIcon} onClose={() => setSelectedIcon(null)} />
            )}
        </main>
    );
}
