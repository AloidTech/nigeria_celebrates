import type { SupabaseClient } from "@supabase/supabase-js";
import type { question, categories, difficulty_level } from "@/lib/database_types/quiz_types";

export type QuizCategory = "music" | "movies" | "geography" | "art";

type LeaderboardJoinedRow = {
  score: number;
  user_id: string;
  quiz: {
    category: QuizCategory;
  } | null;
};

export type CategoryChampion = {
  category: QuizCategory;
  userId: string;
  topScore: number;
};

export async function getCategoryChampions(
  supabase: SupabaseClient,
): Promise<CategoryChampion[]> {
  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("score,user_id,quiz:quizzes!inner(category)")
    .order("score", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as LeaderboardJoinedRow[];
  const topByCategory = new Map<QuizCategory, CategoryChampion>();

  for (const row of rows) {
    if (!row.quiz?.category) {
      continue;
    }

    if (!topByCategory.has(row.quiz.category)) {
      topByCategory.set(row.quiz.category, {
        category: row.quiz.category,
        userId: row.user_id,
        topScore: row.score,
      });
    }
  }

  return Array.from(topByCategory.values());
}

export async function getShortQuizByCategory(
  supabase: SupabaseClient,
  category: QuizCategory,
): Promise<question[]> {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("category", category)
      .limit(5);

    if (error || !data || data.length === 0) {
      console.warn("No questions found in database, falling back to local questions");
      return getLocalFallbackQuestions(category);
    }

    return data as question[];
  } catch (err) {
    console.error("Failed to fetch from database, using fallback:", err);
    return getLocalFallbackQuestions(category);
  }
}

function getLocalFallbackQuestions(category: QuizCategory): question[] {
  const fallbacks: Record<QuizCategory, question[]> = {
    music: [
      {
        _id: "m1",
        question_text: "Which artist popularized the global breakout hit “One Dance”?",
        options: [
          { _id: "a", option_text: "Wizkid" },
          { _id: "b", option_text: "Olamide" },
          { _id: "c", option_text: "Burna Boy" },
          { _id: "d", option_text: "Flavour" },
        ],
        correct_option_id: "a",
        explanation: "Wizkid was featured on “One Dance,” helping push the record into global pop culture.",
        difficulty: "easy" as difficulty_level,
        category: "music" as categories,
      },
      {
        _id: "m2",
        question_text: "Fela Anikulapo-Kuti is globally celebrated as the pioneer of which music genre?",
        options: [
          { _id: "a", option_text: "Highlife" },
          { _id: "b", option_text: "Afrobeat" },
          { _id: "c", option_text: "Juju" },
          { _id: "d", option_text: "Apala" },
        ],
        correct_option_id: "b",
        explanation: "Fela Kuti created Afrobeat in the late 1960s, blending highlife, jazz, and traditional Yoruba rhythms.",
        difficulty: "easy" as difficulty_level,
        category: "music" as categories,
      },
      {
        _id: "m3",
        question_text: "Which Nigerian artist won the Best Global Music Album award at the 63rd Annual Grammy Awards?",
        options: [
          { _id: "a", option_text: "Davido" },
          { _id: "b", option_text: "Wizkid" },
          { _id: "c", option_text: "Burna Boy" },
          { _id: "d", option_text: "Rema" },
        ],
        correct_option_id: "c",
        explanation: "Burna Boy won the Best Global Music Album Grammy for his 2020 record 'Twice as Tall'.",
        difficulty: "moderate" as difficulty_level,
        category: "music" as categories,
      },
      {
        _id: "m4",
        question_text: "Which female Nigerian singer and songwriter collaborated with Wizkid on the global hit 'Essence'?",
        options: [
          { _id: "a", option_text: "Tiwa Savage" },
          { _id: "b", option_text: "Tems" },
          { _id: "c", option_text: "Yemi Alade" },
          { _id: "d", option_text: "Simi" },
        ],
        correct_option_id: "b",
        explanation: "Tems co-wrote and featured on Wizkid's single 'Essence', which became the first Nigerian song to chart on the Billboard Hot 100.",
        difficulty: "easy" as difficulty_level,
        category: "music" as categories,
      },
      {
        _id: "m5",
        question_text: "Which record label, founded by Don Jazzy, produced stars like Rema, Ayra Starr, and Johnny Drille?",
        options: [
          { _id: "a", option_text: "Mavin Records" },
          { _id: "b", option_text: "DMW (Davido Music Worldwide)" },
          { _id: "c", option_text: "Chocolate City" },
          { _id: "d", option_text: "YBNL Nation" },
        ],
        correct_option_id: "a",
        explanation: "Mavin Records was founded by Don Jazzy in 2012 and remains one of the most successful labels in Africa.",
        difficulty: "easy" as difficulty_level,
        category: "music" as categories,
      },
    ],
    movies: [
      {
        _id: "f1",
        question_text: "Which movie franchise is best known for the character Ebere, the detective from Lagos?",
        options: [
          { _id: "a", option_text: "Living in Bondage" },
          { _id: "b", option_text: "The Figurine" },
          { _id: "c", option_text: "King of Boys" },
          { _id: "d", option_text: "Citation" },
        ],
        correct_option_id: "c",
        explanation: "King of Boys is the correct pick for this crime-thriller style clue.",
        difficulty: "moderate" as difficulty_level,
        category: "movies" as categories,
      },
      {
        _id: "f2",
        question_text: "Which movie directed by Funke Akindele became the highest-grossing Nollywood film of all time?",
        options: [
          { _id: "a", option_text: "A Tribe Called Judah" },
          { _id: "b", option_text: "Omo Ghetto: The Saga" },
          { _id: "c", option_text: "Battle on Buka Street" },
          { _id: "d", option_text: "The Wedding Party" },
        ],
        correct_option_id: "a",
        explanation: "Funke Akindele's 'A Tribe Called Judah' grossed over 1.4 billion Naira, making history as Nollywood's highest earner.",
        difficulty: "easy" as difficulty_level,
        category: "movies" as categories,
      },
      {
        _id: "f3",
        question_text: "Which film was Nigeria's first-ever official submission for the Academy Awards?",
        options: [
          { _id: "a", option_text: "Mami Wata" },
          { _id: "b", option_text: "The Milkmaid" },
          { _id: "c", option_text: "Lionheart" },
          { _id: "d", option_text: "October 1" },
        ],
        correct_option_id: "c",
        explanation: "Lionheart, directed by Genevieve Nnaji, was submitted in 2019, though it was later disqualified due to having too much English dialogue.",
        difficulty: "moderate" as difficulty_level,
        category: "movies" as categories,
      },
      {
        _id: "f4",
        question_text: "Who is the legendary actor famous for playing chiefs, elders, and delivering classic proverbs?",
        options: [
          { _id: "a", option_text: "Olu Jacobs" },
          { _id: "b", option_text: "Pete Edochie" },
          { _id: "c", option_text: "Nkem Owoh" },
          { _id: "d", option_text: "Richard Mofe-Damijo" },
        ],
        correct_option_id: "b",
        explanation: "Pete Edochie is renowned for his signature voice, powerful presence, and masterclass delivery of African proverbs.",
        difficulty: "easy" as difficulty_level,
        category: "movies" as categories,
      },
      {
        _id: "f5",
        question_text: "Which 2016 blockbuster, directed by Kemi Adetiba, is centered around a chaotic wedding ceremony?",
        options: [
          { _id: "a", option_text: "Isoken" },
          { _id: "b", option_text: "Chief Daddy" },
          { _id: "c", option_text: "The Wedding Party" },
          { _id: "d", option_text: "Merry Men" },
        ],
        correct_option_id: "c",
        explanation: "The Wedding Party set box office records in 2016, capturing the vibrant drama of a high-society Nigerian wedding.",
        difficulty: "easy" as difficulty_level,
        category: "movies" as categories,
      },
    ],
    geography: [
      {
        _id: "g1",
        question_text: "What is the capital city of Nigeria, which replaced Lagos in December 1991?",
        options: [
          { _id: "a", option_text: "Abuja" },
          { _id: "b", option_text: "Ibadan" },
          { _id: "c", option_text: "Port Harcourt" },
          { _id: "d", option_text: "Enugu" },
        ],
        correct_option_id: "a",
        explanation: "Abuja was chosen as the federal capital city for its central geographical location and neutrality.",
        difficulty: "easy" as difficulty_level,
        category: "geography" as categories,
      },
      {
        _id: "g2",
        question_text: "Which river is the longest in Nigeria and forms a confluence with River Benue at Lokoja?",
        options: [
          { _id: "a", option_text: "River Benue" },
          { _id: "b", option_text: "River Kaduna" },
          { _id: "c", option_text: "River Niger" },
          { _id: "d", option_text: "River Cross" },
        ],
        correct_option_id: "c",
        explanation: "The River Niger is the principal river of West Africa, extending about 4,180 km.",
        difficulty: "easy" as difficulty_level,
        category: "geography" as categories,
      },
      {
        _id: "g3",
        question_text: "In which Nigerian state is the iconic Zuma Rock located?",
        options: [
          { _id: "a", option_text: "Federal Capital Territory" },
          { _id: "b", option_text: "Niger State" },
          { _id: "c", option_text: "Kogi State" },
          { _id: "d", option_text: "Nasarawa State" },
        ],
        correct_option_id: "b",
        explanation: "Although it sits near Abuja, Zuma Rock is physically situated in Madalla, Niger State.",
        difficulty: "easy" as difficulty_level,
        category: "geography" as categories,
      },
      {
        _id: "g4",
        question_text: "Which city is the largest by population in Nigeria and is known as the center of excellence?",
        options: [
          { _id: "a", option_text: "Lagos" },
          { _id: "b", option_text: "Kano" },
          { _id: "c", option_text: "Ibadan" },
          { _id: "d", option_text: "Kaduna" },
        ],
        correct_option_id: "a",
        explanation: "Lagos is the most populous metropolitan area in Africa, serving as the commercial powerhouse of Nigeria.",
        difficulty: "easy" as difficulty_level,
        category: "geography" as categories,
      },
      {
        _id: "g5",
        question_text: "What is the highest point in Nigeria, situated in the Taraba State border region?",
        options: [
          { _id: "a", option_text: "Zuma Rock" },
          { _id: "b", option_text: "Olumo Rock" },
          { _id: "c", option_text: "Chappal Waddi" },
          { _id: "d", option_text: "Mount Patti" },
        ],
        correct_option_id: "c",
        explanation: "Chappal Waddi (or Gangirwal), standing at 2,419 meters, is the highest peak in Nigeria, located in Gashaka Gumti National Park.",
        difficulty: "difficult" as difficulty_level,
        category: "geography" as categories,
      },
    ],
    art: [
      {
        _id: "a1",
        question_text: "Which world-famous Nigerian painting of a princess by Ben Enwonwu is often called the 'African Mona Lisa'?",
        options: [
          { _id: "a", option_text: "Sango" },
          { _id: "b", option_text: "Tutu" },
          { _id: "c", option_text: "Negritude" },
          { _id: "d", option_text: "Anya" },
        ],
        correct_option_id: "b",
        explanation: "'Tutu' was lost for decades before being discovered in a London flat and auctioned for over £1.2 million in 2018.",
        difficulty: "moderate" as difficulty_level,
        category: "art" as categories,
      },
      {
        _id: "a2",
        question_text: "Which traditional dyeing technique creates beautiful indigo resist-patterned cloths among the Yoruba?",
        options: [
          { _id: "a", option_text: "Kente" },
          { _id: "b", option_text: "Adire" },
          { _id: "c", option_text: "Ankara" },
          { _id: "d", option_text: "Aso Oke" },
        ],
        correct_option_id: "b",
        explanation: "Adire is an indigo-dyed cloth made by Yoruba women using resist-dyeing techniques to produce rich designs.",
        difficulty: "easy" as difficulty_level,
        category: "art" as categories,
      },
      {
        _id: "a3",
        question_text: "Which ancient civilization in Nigeria produced the famous terracotta heads dating back to 500 BC?",
        options: [
          { _id: "a", option_text: "Ifẹ̀ Kingdom" },
          { _id: "b", option_text: "Benin Empire" },
          { _id: "c", option_text: "Nok Culture" },
          { _id: "d", option_text: "Nri Kingdom" },
        ],
        correct_option_id: "c",
        explanation: "The Nok Culture is famed for its highly styled terracotta sculptures representing humans and animals.",
        difficulty: "easy" as difficulty_level,
        category: "art" as categories,
      },
      {
        _id: "a4",
        question_text: "Who is the Nigerian artist widely regarded as one of the pioneers of printmaking and modern art in Africa?",
        options: [
          { _id: "a", option_text: "Bruce Onobrakpeya" },
          { _id: "b", option_text: "El Anatsui" },
          { _id: "c", option_text: "Yinka Shonibare" },
          { _id: "d", option_text: "Pius Okigbo" },
        ],
        correct_option_id: "a",
        explanation: "Bruce Onobrakpeya is a legendary artist, sculptor, and printmaker whose works have been exhibited globally.",
        difficulty: "moderate" as difficulty_level,
        category: "art" as categories,
      },
      {
        _id: "a5",
        question_text: "Which prominent gallery in Lagos, founded by Nike Davies-Okundaye, is the largest art gallery in West Africa?",
        options: [
          { _id: "a", option_text: "Nike Art Gallery" },
          { _id: "b", option_text: "Red Door Gallery" },
          { _id: "c", option_text: "CCA Lagos" },
          { _id: "d", option_text: "Rele Gallery" },
        ],
        correct_option_id: "a",
        explanation: "Nike Art Centre in Lekki, Lagos is a 5-story gallery housing thousands of contemporary and traditional artworks.",
        difficulty: "easy" as difficulty_level,
        category: "art" as categories,
      },
    ],
  };

  return fallbacks[category] || fallbacks.music;
}

export async function getWeeklyQuiz(supabase: SupabaseClient): Promise<question[]> {
  try {
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("quiz_type", "weekly")
      .eq("status", "scheduled")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (quizError || !quizData) {
      console.warn("No scheduled weekly quiz found in database", quizError);
      return [];
    }

    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("category", quizData.category)
      .eq("quiz_type", "weekly")
      .limit(5);

    if (questionsError || !questionsData || questionsData.length === 0) {
      console.warn("No questions found for the weekly quiz category:", quizData.category, questionsError);
      return [];
    }

    return questionsData as question[];
  } catch (err) {
    console.error("Failed to fetch weekly quiz:", err);
    return [];
  }
}

function getWeeklyFallbackQuestions(): question[] {
  return [
    {
      _id: "qw1",
      question_text: "Which artist popularized the global breakout hit “One Dance”?",
      options: [
        { _id: "a", option_text: "Wizkid" },
        { _id: "b", option_text: "Olamide" },
        { _id: "c", option_text: "Burna Boy" },
        { _id: "d", option_text: "Flavour" },
      ],
      correct_option_id: "a",
      explanation: "Wizkid was featured on “One Dance,” helping push the record into global pop culture.",
      difficulty: "easy" as difficulty_level,
      category: "music" as categories,
    },
    {
      _id: "qw2",
      question_text: "Which movie franchise is best known for the character Ebere, the detective from Lagos?",
      options: [
        { _id: "a", option_text: "Living in Bondage" },
        { _id: "b", option_text: "The Figurine" },
        { _id: "c", option_text: "King of Boys" },
        { _id: "d", option_text: "Citation" },
      ],
      correct_option_id: "c",
      explanation: "King of Boys is the correct pick for this crime-thriller style clue.",
      difficulty: "moderate" as difficulty_level,
      category: "movies" as categories,
    },
    {
      _id: "qw3",
      question_text: "What is the fastest way to score bonus points in this quiz session?",
      options: [
        { _id: "a", option_text: "Skip every question" },
        { _id: "b", option_text: "Answer correctly on the first try" },
        { _id: "c", option_text: "Wait until time runs out" },
        { _id: "d", option_text: "Refresh the page" },
      ],
      correct_option_id: "b",
      explanation: "Correct first attempts preserve your score and keep your streak active.",
      difficulty: "easy" as difficulty_level,
      category: "music" as categories, // gameplay mapped to music in categories
    },
    {
      _id: "qw4",
      question_text: "Which action keeps a participant in the active leaderboard flow?",
      options: [
        { _id: "a", option_text: "Submitting an answer before the timer expires" },
        { _id: "b", option_text: "Leaving the page open in another tab" },
        { _id: "c", option_text: "Changing themes" },
        { _id: "d", option_text: "Typing in the admin panel" },
      ],
      correct_option_id: "a",
      explanation: "Only completed responses count toward the live session and leaderboard ranking.",
      difficulty: "easy" as difficulty_level,
      category: "music" as categories,
    },
    {
      _id: "qw5",
      question_text: "Which international body certified Nigeria wild-polio free in August 2020?",
      options: [
        { _id: "a", option_text: "United Nations (UN)" },
        { _id: "b", option_text: "World Health Organization (WHO)" },
        { _id: "c", option_text: "Doctors Without Borders" },
        { _id: "d", option_text: "African Union (AU)" },
      ],
      correct_option_id: "b",
      explanation: "The World Health Organization (WHO) officially certified Nigeria wild-polio free after three consecutive years without any recorded cases.",
      difficulty: "easy" as difficulty_level,
      category: "geography" as categories,
    },
  ];
}
