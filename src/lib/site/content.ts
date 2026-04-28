export type ProgramDay = {
  day: string;
  title: string;
  description: string;
  image: string;
};

export type Insight = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  published: string;
  summary: string;
  image: string;
  body: string[];
};

export const navItems = [
  { href: "/program", label: "Program" },
  { href: "/safety", label: "Safety" },
  { href: "/insights", label: "Insights" },
  { href: "/#why-eastaura", label: "About" },
];

export const trustRail = [
  "Translation support",
  "Human review",
  "Safety screening",
  "Qualified partners",
];

export const heroTrustItems = [
  {
    icon: "language" as const,
    title: "Human-reviewed intake",
  },
  {
    icon: "check" as const,
    title: "Translation support",
  },
  {
    icon: "shield" as const,
    title: "Clear safety boundaries",
  },
];

export const painPoints = [
  {
    title: "Stress that does not switch off",
    text: "For professionals whose bodies stay on alert even when the calendar is finally quiet.",
  },
  {
    title: "Sleep that does not restore",
    text: "For people who get hours in bed but wake unrefreshed, tense, or mentally overloaded.",
  },
  {
    title: "Travel that needs a purpose",
    text: "For guests who want a slower China experience shaped around recovery, not sightseeing volume.",
  },
];

export const retreatMoments = [
  {
    title: "Arrival tea",
    label: "Land softly",
    text: "A quiet first touchpoint after long-haul travel, with translation support and a slower welcome rhythm.",
    image: "/images/tea-ceremony.jpg",
  },
  {
    title: "TCM-informed review",
    label: "Understand your state",
    text: "A guided conversation focused on stress load, sleep rhythm, body tension, and service fit.",
    image: "/images/consultation.jpg",
  },
  {
    title: "Restorative bodywork",
    label: "Release pressure",
    text: "Low-friction restorative sessions shaped around recovery, not performance or sightseeing volume.",
    image: "/images/bodywork.jpg",
  },
  {
    title: "Sleep reset room",
    label: "Protect rhythm",
    text: "A calmer stay pattern with fewer decisions, softer evenings, and time for genuine downshift.",
    image: "/images/retreat-room.jpg",
  },
  {
    title: "Food-as-wellness",
    label: "Warm nourishment",
    text: "Herbal food context and gentle meal pacing without turning the trip into a medical claim.",
    image: "/images/wellness-meal.jpg",
  },
  {
    title: "Quiet city garden",
    label: "Slow China",
    text: "Cultural moments that support restoration rather than exhausting the guest before departure.",
    image: "/images/garden-path.jpg",
  },
];

export const recoveryStates = [
  { from: "wired", to: "grounded" },
  { from: "restless", to: "rested" },
  { from: "overloaded", to: "clearer" },
  { from: "scheduled", to: "spacious" },
];

export const trustCards = [
  {
    title: "Human Review",
    label: "Concierge gate",
    text: "Every intake is reviewed by a person before acceptance. Eastaura does not auto-approve guests or delegate fit decisions to AI.",
    tone: "large",
  },
  {
    title: "Safety Screening",
    label: "Before arrival",
    text: "Pregnancy, recent surgery, serious cardiovascular conditions, anticoagulant medication, severe allergy, immune suppression, diagnosed disease treatment, or unstable symptoms require extra caution.",
    tone: "checklist",
  },
  {
    title: "Translation Support",
    label: "Bilingual guidance",
    text: "Translator-supported conversations help overseas guests understand local providers, schedule details, and wellness boundaries.",
    tone: "visual",
  },
  {
    title: "Qualified Local Partners",
    label: "Vetted network",
    text: "The first pilot is designed around selected local providers, hotel options, transfers, and emergency fallback planning.",
    tone: "compact",
  },
  {
    title: "Clear Non-Medical Boundary",
    label: "No cure promises",
    text: "Eastaura is a wellness concierge. It does not diagnose disease, promise treatment results, or replace your local doctor.",
    tone: "boundary",
  },
  {
    title: "Privacy Protected",
    label: "Minimum data",
    text: "The intake asks for service-fit information only. Medical records are not required for the prototype flow.",
    tone: "compact",
  },
  {
    title: "Concierge Coordination",
    label: "One guided path",
    text: "Pre-arrival review, program planning, translation, local scheduling, and follow-up are coordinated as one calm service layer.",
    tone: "wide",
  },
];

export const programDays: ProgramDay[] = [
  {
    day: "Day 1",
    title: "Arrival, check-in, orientation, rest",
    description:
      "A quiet landing in Shanghai or Hangzhou, transfer support, a short welcome briefing, and enough space to recover from travel.",
    image: "/images/retreat-room.jpg",
  },
  {
    day: "Day 2",
    title: "Translator-supported TCM-informed consultation",
    description:
      "A guided wellness consultation with local qualified providers where translation helps you understand the process and boundaries.",
    image: "/images/consultation.jpg",
  },
  {
    day: "Day 3",
    title: "Bodywork, breath, tea, and rest-focused experience",
    description:
      "Low-friction restorative sessions shaped around stress recovery, sleep rhythm, body tension, and gentle daily pacing.",
    image: "/images/bodywork.jpg",
  },
  {
    day: "Day 4",
    title: "Slow cultural wellness day and integration",
    description:
      "Tea, food-as-wellness context, breath practice, and a slower cultural day that supports recovery rather than exhausting it.",
    image: "/images/tea-ceremony.jpg",
  },
  {
    day: "Day 5",
    title: "Summary, follow-up suggestions, departure",
    description:
      "A concise English wellness summary, departure support, and a 30-day light follow-up rhythm for post-trip continuity.",
    image: "/images/journaling.jpg",
  },
];

export const included = [
  "Pre-arrival intake review and fit screening",
  "Translator-supported wellness consultation",
  "Curated local wellness experiences",
  "Hotel stay assumptions for the pilot package",
  "Local transfer coordination",
  "English wellness summary and light follow-up",
];

export const notIncluded = [
  "International flights and visas",
  "Travel insurance",
  "Emergency medical care",
  "Prescription medication or herbal products",
  "Extra medical tests or specialist treatment",
  "Personal shopping and unrelated travel costs",
];

export const safetyFaqs = [
  {
    q: "What Eastaura is",
    a: "Eastaura is a premium concierge-style wellness retreat service that helps overseas guests experience TCM-informed wellness in China with translation, coordination, safety screening, and human guidance.",
  },
  {
    q: "What Eastaura is not",
    a: "Eastaura is not a hospital, emergency medical service, online diagnosis platform, or treatment guarantee. It is not designed for urgent or unstable medical situations.",
  },
  {
    q: "Is this emergency medical care?",
    a: "No. If you have urgent symptoms, unstable health concerns, or need immediate medical attention, contact local emergency services or your doctor before considering travel.",
  },
  {
    q: "Do you diagnose, cure, or treat disease?",
    a: "No. Eastaura does not diagnose disease, promise a cure, or guarantee treatment outcomes. Medical services, if any, must be delivered by qualified local providers within their legal scope.",
  },
  {
    q: "How does risk screening work?",
    a: "The intake flags conditions that may require extra review, such as pregnancy, recent surgery, serious cardiovascular conditions, anticoagulant medication, severe allergy, immune suppression, current treatment for a diagnosed disease, or urgent symptoms.",
  },
  {
    q: "When should I speak with my doctor first?",
    a: "Speak with your doctor before applying if you are pregnant, recently had surgery, take anticoagulant medication, have a serious cardiovascular condition, severe allergies, immune suppression, a diagnosed disease under treatment, or unstable symptoms.",
  },
  {
    q: "How does translation support work?",
    a: "The pilot assumes bilingual support for key conversations so guests can understand the schedule, local provider explanations, and non-medical wellness boundaries.",
  },
  {
    q: "How is my information handled?",
    a: "The prototype only asks for information needed to assess service fit. The production system will require privacy policy review before real launch.",
  },
];

export const insights: Insight[] = [
  {
    slug: "what-is-tcm-wellness-retreat",
    title: "What Is a TCM Wellness Retreat?",
    category: "TCM-informed wellness",
    readTime: "5 min read",
    published: "Apr 27, 2026",
    summary:
      "A plain-English explanation of how a China-based wellness retreat can be structured without making medical promises.",
    image: "/images/herbs.jpg",
    body: [
      "A TCM wellness retreat is not the same thing as seeking medical treatment overseas. In the Eastaura model, the retreat is a curated experience around rest, rhythm, body awareness, and culturally grounded wellness practices.",
      "The value is not a miracle claim. It is the combination of local context, qualified partners, translation support, a slower schedule, and human review before the trip begins.",
      "That distinction matters. Guests should understand what is included, what is not included, and when a doctor should be consulted before travel.",
    ],
  },
  {
    slug: "stress-recovery-vs-vacation",
    title: "Stress Recovery Is Not the Same as a Vacation",
    category: "Recovery design",
    readTime: "4 min read",
    published: "Apr 27, 2026",
    summary:
      "Why a restorative trip needs pacing, screening, and rhythm instead of a packed list of attractions.",
    image: "/images/garden-path.jpg",
    body: [
      "A vacation can still be exhausting when every day is packed with movement, decisions, and social obligations. Stress recovery asks a different question: what does the nervous system need in order to stop bracing?",
      "The Eastaura pilot keeps the schedule deliberately calm. The point is to protect attention, sleep rhythm, and body recovery while still allowing a meaningful China-based experience.",
      "That slower structure is especially important for high-pressure professionals who are used to treating rest as another performance task.",
    ],
  },
  {
    slug: "is-eastaura-medical-treatment",
    title: "Is Eastaura a Medical Treatment Program?",
    category: "Safety boundary",
    readTime: "3 min read",
    published: "Apr 27, 2026",
    summary:
      "A direct answer about what Eastaura can and cannot do, including the role of qualified local providers.",
    image: "/images/meditation-space.jpg",
    body: [
      "No. Eastaura is not a medical treatment program and does not diagnose disease or promise cures. It is a wellness concierge and retreat coordination layer.",
      "If a guest needs medical care, that care must be provided by qualified local providers within their professional and legal scope. Eastaura's role is coordination, translation, and boundary clarity.",
      "People with high-risk or unstable conditions may be asked to consult their doctor first or may be declined for the pilot.",
    ],
  },
  {
    slug: "tcm-informed-consultation",
    title: "What Happens During a TCM-Informed Wellness Consultation?",
    category: "Program preview",
    readTime: "6 min read",
    published: "Apr 27, 2026",
    summary:
      "How translator-supported conversations help guests understand their wellness experience in China.",
    image: "/images/consultation.jpg",
    body: [
      "The consultation is designed to orient the guest, not overwhelm them. A translator-supported setting helps turn unfamiliar concepts into practical, understandable context.",
      "The focus is on recovery goals, daily rhythm, body tension, sleep patterns, stress load, and what kinds of low-risk wellness experiences may be appropriate.",
      "For anything medical or high-risk, Eastaura keeps the boundary clear and routes the decision to qualified providers or the guest's own doctor.",
    ],
  },
  {
    slug: "sleep-reset-needs-rhythm",
    title: "Why Sleep Reset Needs Rhythm, Not Just Rest",
    category: "Sleep reset",
    readTime: "4 min read",
    published: "Apr 27, 2026",
    summary:
      "A reset is less about sleeping late and more about protecting a steady, calmer daily pattern.",
    image: "/images/retreat-room.jpg",
    body: [
      "Sleep reset is not only about more hours in bed. For overloaded professionals, the harder part is often rebuilding a daily rhythm that feels safe enough for the body to downshift.",
      "A quiet itinerary, food timing, screen-light boundaries, gentle movement, and lower decision load can all support that rhythm.",
      "Eastaura frames sleep as a recovery environment, not a quick fix or guaranteed medical outcome.",
    ],
  },
  {
    slug: "how-we-screen-wellness-travelers",
    title: "How We Screen Wellness Travelers Before Arrival",
    category: "Human review",
    readTime: "5 min read",
    published: "Apr 27, 2026",
    summary:
      "The intake is not bureaucracy. It is how a small pilot protects guests, partners, and the service boundary.",
    image: "/images/china-landscape.jpg",
    body: [
      "The intake flow asks for travel basics, recovery goals, budget range, and a limited self-report of risk flags. It avoids asking for unnecessary medical records in the prototype.",
      "Human review matters because the decision is not only whether someone wants to come. It is whether the pilot service can responsibly support them.",
      "When risk is unclear, the right answer may be a doctor consultation first, a different service path, or a respectful no.",
    ],
  },
];

export function getInsight(slug: string) {
  return insights.find((item) => item.slug === slug);
}
