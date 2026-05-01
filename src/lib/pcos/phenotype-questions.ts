export type QuestionOption = {
    value: string;
    label: string;
    emoji?: string;
};

export type PhenotypeQuestion = {
    key: keyof import("./phenotype").PhenotypeAnswers;
    question: string;
    helpText?: string;
    type: "boolean" | "single_choice";
    options?: QuestionOption[];
};

export const PHENOTYPE_QUESTIONS: PhenotypeQuestion[] = [
    {
        key: "irregularCycles",
        question: "Are your cycles typically irregular?",
        helpText: "Cycles shorter than 21 days, longer than 35 days, or skipping months entirely.",
        type: "boolean",
    },
    {
        key: "weightGainAround",
        question: "Where do you tend to gain weight?",
        helpText: "Even if you're not overweight, where does fat tend to settle for you?",
        type: "single_choice",
        options: [
            { value: "belly", label: "Belly area", emoji: "🔵" },
            { value: "hips", label: "Hips and thighs", emoji: "🍐" },
            { value: "even", label: "Evenly all over", emoji: "⚖️" },
            { value: "none", label: "I don't really gain weight", emoji: "🌱" },
        ],
    },
    {
        key: "acneType",
        question: "Where does your acne show up most?",
        type: "single_choice",
        options: [
            { value: "jaw_chin", label: "Jaw and chin", emoji: "💢" },
            { value: "forehead", label: "Forehead and temples", emoji: "🤕" },
            { value: "back_chest", label: "Back and chest", emoji: "🔥" },
            { value: "none", label: "I rarely get acne", emoji: "✨" },
        ],
    },
    {
        key: "hairGrowth",
        question: "How is your hair behaving?",
        type: "single_choice",
        options: [
            { value: "face_chest", label: "Extra hair on face/chin/chest", emoji: "🪒" },
            { value: "thinning", label: "Hair thinning on my head", emoji: "💇" },
            { value: "both", label: "Both — extra body hair AND thinning scalp", emoji: "😣" },
            { value: "neither", label: "Neither, my hair is normal", emoji: "💆" },
        ],
    },
    {
        key: "energyLevels",
        question: "How are your energy levels through the day?",
        type: "single_choice",
        options: [
            { value: "low_morning", label: "Low in the morning, better later", emoji: "🌅" },
            { value: "low_evening", label: "Crash in the afternoon/evening", emoji: "🌆" },
            { value: "stable", label: "Pretty stable", emoji: "📊" },
            { value: "fluctuates", label: "Up and down all day", emoji: "🎢" },
        ],
    },
    {
        key: "sugarCravings",
        question: "How are your sugar/carb cravings?",
        type: "single_choice",
        options: [
            { value: "intense", label: "Intense, hard to ignore", emoji: "🍫" },
            { value: "occasional", label: "Occasional", emoji: "🍪" },
            { value: "rare", label: "Rare", emoji: "🥗" },
        ],
    },
    {
        key: "stressResponse",
        question: "When you're stressed, how does your body react?",
        type: "single_choice",
        options: [
            { value: "anxious", label: "Wired and anxious, can't relax", emoji: "😰" },
            { value: "tired", label: "Exhausted and depleted", emoji: "😴" },
            { value: "fine", label: "I handle stress okay", emoji: "🧘" },
        ],
    },
    {
        key: "cardiovascular",
        question: "Have you noticed any of these?",
        helpText: "Pick the closest one, or skip if none apply.",
        type: "single_choice",
        options: [
            { value: "high_resting_hr", label: "Heart races even at rest", emoji: "💓" },
            { value: "feels_inflamed", label: "Body feels puffy/inflamed", emoji: "🌡️" },
            { value: "neither", label: "Neither", emoji: "👍" },
        ],
    },
];