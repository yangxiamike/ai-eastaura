export interface Lead {
  id: string;
  name: string;
  email: string;
  country: string;
  age: number;
  primaryGoals: string[];
  source: string;
  campaign: string;
  status: "new" | "contacted" | "qualified" | "consultation_booked" | "proposal_sent" | "won" | "not_fit" | "nurture";
  riskLevel: "low" | "medium" | "high";
  intentScore: number;
  lastActivity: string;
  nextAction: string;
  budget?: string;
  aiSummary?: string;
  riskNotes?: string[];
  intakeDetails?: {
    goals: string;
    concerns: string;
    timeline: string;
    previousExperience: string;
    medicalConditions: string[];
    medications: string[];
    preferredContact: string;
  };
  timeline?: { date: string; action: string; by: string }[];
  sourceAttribution?: {
    campaign: string;
    contentItem: string;
    channel: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
  };
}

export interface ContentItem {
  id: string;
  title: string;
  type: "short_video_script" | "linkedin_post" | "newsletter" | "blog" | "reels_script";
  channel: string;
  campaign: string;
  cta: string;
  complianceStatus: "pending" | "approved" | "flagged" | "rejected";
  publishStatus: "draft" | "review" | "scheduled" | "published" | "idea";
  sourceCode: string;
  performanceNotes?: string;
  createdAt: string;
  updatedAt: string;
  body?: string;
  topics?: string[];
  platforms?: string[];
}

export interface ReviewTask {
  id: string;
  type: "lead_risk_review" | "followup_email_approval" | "content_compliance" | "script_approval" | "notification_priority";
  priority: "low" | "medium" | "high" | "urgent";
  relatedObject: string;
  relatedObjectId: string;
  aiRecommendation: string;
  status: "pending" | "approved" | "rejected" | "edited";
  createdAt: string;
  details?: string;
}

export interface Notification {
  id: string;
  type: "new_lead" | "high_risk_alert" | "followup_reminder" | "daily_brief" | "failed_email" | "failed_ai_task";
  title: string;
  message: string;
  status: "pending" | "sent" | "failed" | "skipped";
  createdAt: string;
  read: boolean;
  relatedId?: string;
}

export interface SkillFile {
  id: string;
  name: string;
  category: string;
  content: string;
  updatedAt: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

// ─── LEADS ───
export const leads: Lead[] = [
  {
    id: "lead_001",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@email.com",
    country: "United States",
    age: 42,
    primaryGoals: ["Sleep Reset", "Stress Recovery"],
    source: "Instagram Reels",
    campaign: "POV: Arrive in China",
    status: "qualified",
    riskLevel: "low",
    intentScore: 92,
    lastActivity: "2 hours ago",
    nextAction: "Send video consultation link",
    budget: "$3,000 - $5,000",
    aiSummary: "High-intent lead from US corporate sector. Primary goals: sleep reset and stress recovery. Concerned about language barrier and acupuncture safety. No major medical red flags. Planning September visit. Previously tried sleep supplements with limited results.",
    riskNotes: ["Taking sleep supplements — follow up on dosage", "Do not promise cure outcomes"],
    intakeDetails: {
      goals: "Sleep reset, stress recovery, whole-person balance",
      concerns: "Language barrier, safety of acupuncture, not wanting tourist-group experience",
      timeline: "Planning visit in September 2026",
      previousExperience: "Tried sleep supplements, meditation apps, corporate wellness programs",
      medicalConditions: ["Chronic insomnia (self-reported)", "High stress levels"],
      medications: ["Melatonin 3mg nightly", "Magnesium supplement"],
      preferredContact: "Email",
    },
    timeline: [
      { date: "Apr 26, 2026", action: "Submitted intake form via Reels CTA", by: "Lead" },
      { date: "Apr 26, 2026", action: "AI risk assessment completed — LOW risk", by: "AI Agent" },
      { date: "Apr 27, 2026", action: "Flagged for human review — sleep supplement interaction", by: "AI Agent" },
      { date: "Apr 27, 2026", action: "Reviewed and approved by founder", by: "You" },
    ],
    sourceAttribution: {
      campaign: "POV Experience Series Q2",
      contentItem: "POV: You arrive in China for 5-day TCM reset",
      channel: "Instagram Reels",
      utmSource: "instagram",
      utmMedium: "reels",
      utmCampaign: "pov_arrive_china_0426",
    },
  },
  {
    id: "lead_002",
    name: "James Chen",
    email: "j.chen@techflow.io",
    country: "Singapore",
    age: 35,
    primaryGoals: ["Stress Recovery"],
    source: "LinkedIn",
    campaign: "Why Eastaura Doesn't Promise Cures",
    status: "contacted",
    riskLevel: "medium",
    intentScore: 74,
    lastActivity: "5 hours ago",
    nextAction: "Follow up on medical history form",
    budget: "$2,000 - $4,000",
    aiSummary: "Tech executive from Singapore. Interested in stress recovery but hesitant about TCM credibility. Strong analytical profile. Asked about clinical evidence. Medium risk due to skepticism that may lead to early churn if expectations are not carefully managed.",
    riskNotes: ["Skeptical about TCM — needs evidence-based framing", "High expectation for measurable outcomes"],
    intakeDetails: {
      goals: "Burnout recovery, regain focus and energy",
      concerns: "Scientific validity of TCM, ROI on wellness retreat",
      timeline: "Flexible, Q3 2026",
      previousExperience: "Executive coaching, biomarker testing",
      medicalConditions: ["Work-related burnout"],
      medications: ["None reported"],
      preferredContact: "LinkedIn DM + Email",
    },
    timeline: [
      { date: "Apr 25, 2026", action: "Submitted intake form", by: "Lead" },
      { date: "Apr 25, 2026", action: "AI summary generated", by: "AI Agent" },
      { date: "Apr 26, 2026", action: "Initial follow-up email drafted", by: "AI Agent" },
    ],
    sourceAttribution: {
      campaign: "Trust & Transparency Series",
      contentItem: "Why Eastaura Doesn't Promise Cures",
      channel: "LinkedIn",
      utmSource: "linkedin",
      utmMedium: "post",
      utmCampaign: "trust_no_cure_0420",
    },
  },
  {
    id: "lead_003",
    name: "Elena Rossi",
    email: "elena.rossi@designstudio.it",
    country: "Italy",
    age: 51,
    primaryGoals: ["Whole-Person Balance", "Sleep Reset"],
    source: "YouTube Shorts",
    campaign: "Sleep Reset Explained",
    status: "new",
    riskLevel: "high",
    intentScore: 68,
    lastActivity: "1 hour ago",
    nextAction: "Risk review required before contact",
    budget: "$4,000 - $6,000",
    aiSummary: "Designer from Italy. Interested in holistic balance and sleep. High risk flagged due to reported heart condition and blood pressure medication. Requires medical boundary review before any consultation can be offered.",
    riskNotes: ["Heart condition reported — requires medical boundary check", "On blood pressure medication — TCM interaction assessment needed", "Do NOT provide medical advice"],
    intakeDetails: {
      goals: "Holistic wellness, sleep improvement, life balance",
      concerns: "Safety due to heart condition, travel to China",
      timeline: "October 2026",
      previousExperience: "Ayurveda retreat in India, yoga teacher training",
      medicalConditions: ["Hypertension", "Mild heart arrhythmia (self-reported)"],
      medications: ["Lisinopril", "Metoprolol"],
      preferredContact: "Email",
    },
    timeline: [
      { date: "Apr 27, 2026", action: "Submitted intake form via YouTube Shorts", by: "Lead" },
      { date: "Apr 27, 2026", action: "AI flagged HIGH RISK — medical conditions detected", by: "AI Agent" },
    ],
    sourceAttribution: {
      campaign: "Sleep Education Series",
      contentItem: "Sleep Reset Explained",
      channel: "YouTube Shorts",
      utmSource: "youtube",
      utmMedium: "shorts",
      utmCampaign: "sleep_reset_0415",
    },
  },
  {
    id: "lead_004",
    name: "David Park",
    email: "david.park@outlook.kr",
    country: "South Korea",
    age: 29,
    primaryGoals: ["Stress Recovery"],
    source: "TikTok",
    campaign: "5-Day 4-Night Experience",
    status: "nurture",
    riskLevel: "low",
    intentScore: 45,
    lastActivity: "3 days ago",
    nextAction: "Add to nurture sequence — budget not ready",
    budget: "$1,000 - $2,000",
    aiSummary: "Young professional from Seoul. Interested in stress recovery but budget constraint noted. Currently saving for experience. Low immediate conversion probability but good long-term nurture candidate. No medical risks.",
    riskNotes: [],
    intakeDetails: {
      goals: "Stress recovery, mental clarity",
      concerns: "Budget, travel logistics",
      timeline: "2027 or later",
      previousExperience: "Local spa treatments, gym membership",
      medicalConditions: [],
      medications: [],
      preferredContact: "Email",
    },
    timeline: [
      { date: "Apr 20, 2026", action: "Submitted intake form", by: "Lead" },
      { date: "Apr 21, 2026", action: "AI scored intent at 45 — nurture recommended", by: "AI Agent" },
    ],
    sourceAttribution: {
      campaign: "Experience Overview",
      contentItem: "5-Day 4-Night Experience",
      channel: "TikTok",
      utmSource: "tiktok",
      utmMedium: "video",
      utmCampaign: "experience_5d4n_0410",
    },
  },
  {
    id: "lead_005",
    name: "Anna Kowalski",
    email: "anna.k@wellness.pl",
    country: "Poland",
    age: 38,
    primaryGoals: ["Sleep Reset", "Whole-Person Balance"],
    source: "Newsletter",
    campaign: "Weekly Brief — Sleep Edition",
    status: "consultation_booked",
    riskLevel: "low",
    intentScore: 88,
    lastActivity: "12 hours ago",
    nextAction: "Prepare for video call on Apr 29",
    budget: "$3,500 - $5,500",
    aiSummary: "Wellness practitioner from Poland. High intent, clear goals, comfortable with holistic approaches. Already booked consultation. Low risk profile. Good fit for premium 5-day program.",
    riskNotes: [],
    intakeDetails: {
      goals: "Sleep reset, energy restoration, learn TCM self-care",
      concerns: "None significant",
      timeline: "May 2026",
      previousExperience: "Naturopathy training, yoga instruction",
      medicalConditions: [],
      medications: [],
      preferredContact: "Email + Zoom",
    },
    timeline: [
      { date: "Apr 15, 2026", action: "Submitted intake form", by: "Lead" },
      { date: "Apr 15, 2026", action: "AI summary — HIGH INTENT, LOW RISK", by: "AI Agent" },
      { date: "Apr 16, 2026", action: "Follow-up email sent", by: "AI Agent" },
      { date: "Apr 18, 2026", action: "Video consultation booked for Apr 29", by: "Lead" },
    ],
    sourceAttribution: {
      campaign: "Newsletter Sleep Series",
      contentItem: "Weekly Brief — Sleep Edition",
      channel: "Newsletter",
      utmSource: "newsletter",
      utmMedium: "email",
      utmCampaign: "newsletter_sleep_apr3",
    },
  },
  {
    id: "lead_006",
    name: "Marcus Weber",
    email: "m.weber@consulting.de",
    country: "Germany",
    age: 47,
    primaryGoals: ["Stress Recovery", "Sleep Reset"],
    source: "LinkedIn",
    campaign: "Founder's Story",
    status: "proposal_sent",
    riskLevel: "low",
    intentScore: 85,
    lastActivity: "1 day ago",
    nextAction: "Follow up on proposal response",
    budget: "$5,000 - $8,000",
    aiSummary: "Senior consultant from Germany. High budget, clear timeline (June 2026). Already received personalized proposal. Interested in executive-focused program with privacy and discretion.",
    riskNotes: [],
    intakeDetails: {
      goals: "Executive burnout recovery, sleep restoration",
      concerns: "Privacy, efficiency of program, dietary requirements",
      timeline: "June 2026",
      previousExperience: "Luxury spa retreats, executive wellness programs",
      medicalConditions: ["Mild sleep apnea (using CPAP)"],
      medications: [],
      preferredContact: "Email",
    },
    timeline: [
      { date: "Apr 10, 2026", action: "Submitted intake form", by: "Lead" },
      { date: "Apr 11, 2026", action: "Video consultation completed", by: "You" },
      { date: "Apr 14, 2026", action: "Personalized proposal sent", by: "AI Agent" },
    ],
    sourceAttribution: {
      campaign: "Founder Series",
      contentItem: "Founder's Story — Why I Built Eastaura",
      channel: "LinkedIn",
      utmSource: "linkedin",
      utmMedium: "post",
      utmCampaign: "founder_story_0405",
    },
  },
  {
    id: "lead_007",
    name: "Yuki Tanaka",
    email: "yuki.t@creative.jp",
    country: "Japan",
    age: 33,
    primaryGoals: ["Whole-Person Balance"],
    source: "Instagram Reels",
    campaign: "No Chinese Required",
    status: "contacted",
    riskLevel: "low",
    intentScore: 70,
    lastActivity: "8 hours ago",
    nextAction: "Answer questions about dietary accommodations",
    budget: "$2,500 - $4,000",
    aiSummary: "Creative director from Tokyo. Interested in whole-person balance. Asked about Japanese/English bilingual support and pescatarian meal options. Good intent, no medical risks.",
    riskNotes: [],
    intakeDetails: {
      goals: "Creative renewal, work-life balance, cultural immersion",
      concerns: "Language support, dietary needs (pescatarian)",
      timeline: "August 2026",
      previousExperience: "Onsen retreats, meditation practice",
      medicalConditions: [],
      medications: [],
      preferredContact: "Email",
    },
    timeline: [
      { date: "Apr 24, 2026", action: "Submitted intake form", by: "Lead" },
      { date: "Apr 24, 2026", action: "AI drafted personalized email", by: "AI Agent" },
      { date: "Apr 25, 2026", action: "Email approved and sent", by: "You" },
    ],
    sourceAttribution: {
      campaign: "Barrier Breaker Series",
      contentItem: "No Chinese Required — Full English Support",
      channel: "Instagram Reels",
      utmSource: "instagram",
      utmMedium: "reels",
      utmCampaign: "no_chinese_required_0420",
    },
  },
  {
    id: "lead_008",
    name: "Olivia Brown",
    email: "olivia.brown@health.au",
    country: "Australia",
    age: 55,
    primaryGoals: ["Sleep Reset"],
    source: "Blog",
    campaign: "What Happens in Your First TCM Consultation",
    status: "new",
    riskLevel: "medium",
    intentScore: 60,
    lastActivity: "6 hours ago",
    nextAction: "Review medical history — menopause-related sleep issues",
    budget: "$3,000 - $4,500",
    aiSummary: "Health professional from Australia. Investigating TCM for menopause-related sleep disruption. Medium risk due to hormone therapy. Needs careful medical boundary framing.",
    riskNotes: ["On HRT — clarify that Eastaura does not replace medical treatment", "Menopause-related symptoms require sensitive language"],
    intakeDetails: {
      goals: "Natural sleep support during menopause transition",
      concerns: "Safety with HRT, evidence for TCM in menopause",
      timeline: "September 2026",
      previousExperience: "Integrative medicine practice, acupuncture referral",
      medicalConditions: ["Menopause transition", "Occasional hot flashes"],
      medications: ["HRT (estradiol/progesterone)"],
      preferredContact: "Email",
    },
    timeline: [
      { date: "Apr 27, 2026", action: "Submitted intake form", by: "Lead" },
      { date: "Apr 27, 2026", action: "AI summary generated", by: "AI Agent" },
    ],
    sourceAttribution: {
      campaign: "Education Series",
      contentItem: "What Happens in Your First TCM Consultation",
      channel: "Blog",
      utmSource: "blog",
      utmMedium: "article",
      utmCampaign: "first_consultation_0325",
    },
  },
];

// ─── CONTENT ITEMS ───
export const contentItems: ContentItem[] = [
  {
    id: "content_001",
    title: "POV: You come to China for a quiet wellness reset",
    type: "short_video_script",
    channel: "Instagram Reels",
    campaign: "POV Experience Series Q2",
    cta: "Fill Intake Form",
    complianceStatus: "approved",
    publishStatus: "scheduled",
    sourceCode: "reels_pov_arrive_001",
    performanceNotes: "Strong hook in first 3s. Airport-to-tea transition tested well.",
    createdAt: "2026-04-20",
    updatedAt: "2026-04-26",
    body: "[Scene 1: 0-3s] POV shot: airplane window, clouds over China. Text overlay: 'You finally did it.'\n[Scene 2: 3-8s] Quiet car ride through bamboo-lined road. No music, only ambient sound.\n[Scene 3: 8-15s] Arrival at Eastaura. Tea ceremony. Close-up of steam rising.\n[Scene 4: 15-20s] Practitioner takes pulse. Soft spoken explanation.\n[Scene 5: 20-25s] Sunset view from meditation pavilion. Text: '5 days. No schedule. Just reset.'\n[CTA] Link in bio for intake form.",
    topics: ["POV", "Arrival Experience", "Quiet Luxury"],
    platforms: ["Instagram", "TikTok", "YouTube Shorts"],
  },
  {
    id: "content_002",
    title: "Why Eastaura Doesn't Promise Cures",
    type: "linkedin_post",
    channel: "LinkedIn",
    campaign: "Trust & Transparency Series",
    cta: "Read Full Position Paper",
    complianceStatus: "approved",
    publishStatus: "published",
    sourceCode: "linkedin_no_cure_001",
    performanceNotes: "Highest LinkedIn engagement this quarter. 47 shares from wellness professionals.",
    createdAt: "2026-04-15",
    updatedAt: "2026-04-18",
    body: "Three reasons Eastaura never promises 'cures':\n\n1. TCM is a system of balance, not a drug protocol\n2. Every body responds differently to herbal support and acupuncture\n3. The retreat is an experience of reset, not a medical intervention\n\nWhat we DO promise: a structured 5-day immersion designed by licensed practitioners, in a setting that removes the stressors preventing your recovery.\n\nThe rest is your body's own intelligence.",
    topics: ["Trust", "Medical Boundary", "Transparency"],
    platforms: ["LinkedIn"],
  },
  {
    id: "content_003",
    title: "Stress Recovery Is Not a Vacation",
    type: "short_video_script",
    channel: "TikTok",
    campaign: "Barrier Breaker Series",
    cta: "Learn the Difference",
    complianceStatus: "flagged",
    publishStatus: "review",
    sourceCode: "tiktok_stress_not_vacay_001",
    performanceNotes: "Flagged for medical-adjacent language. Revision needed before publish.",
    createdAt: "2026-04-22",
    updatedAt: "2026-04-26",
    body: "[Scene 1: 0-3s] Split screen: beach resort vs. quiet clinic. Text: 'This is a vacation. This is recovery.'\n[Scene 2: 3-8s] Explain the difference: vacation avoids stress. Recovery addresses it.\n[Scene 3: 8-15s] Show daily rhythm at Eastaura: pulse check, herbal tea, structured rest, acupuncture, evening reflection.\n[Scene 4: 15-20s] Practitioner explains: 'We don't distract you from burnout. We give your nervous system space to downregulate.'\n[CTA] 'Is this what you need?' — link to self-assessment.",
    topics: ["Stress Recovery", "Vacation vs Recovery"],
    platforms: ["TikTok", "Instagram Reels"],
  },
  {
    id: "content_004",
    title: "What Happens in Your First TCM Consultation",
    type: "blog",
    channel: "Blog",
    campaign: "Education Series",
    cta: "Book a Free Discovery Call",
    complianceStatus: "approved",
    publishStatus: "published",
    sourceCode: "blog_first_consult_001",
    performanceNotes: "Top organic search traffic driver. Avg. 4:30 time on page.",
    createdAt: "2026-03-20",
    updatedAt: "2026-04-01",
    body: "Your first consultation is not a sales pitch. It is a diagnostic conversation.\n\nStep 1: Intake form (submitted 48 hours before)\nStep 2: Pulse diagnosis and tongue observation (15 minutes)\nStep 3: Conversation about sleep, digestion, stress patterns, and goals (30 minutes)\nStep 4: Personalized retreat protocol drafted (delivered within 24 hours)\n\nNo pressure. No upsell. Just clarity on whether Eastaura is the right fit for your situation.",
    topics: ["First Consultation", "TCM Process", "Education"],
    platforms: ["Blog", "Newsletter"],
  },
  {
    id: "content_005",
    title: "Sleep Reset Explained",
    type: "short_video_script",
    channel: "YouTube Shorts",
    campaign: "Sleep Education Series",
    cta: "Download Sleep Guide",
    complianceStatus: "approved",
    publishStatus: "published",
    sourceCode: "shorts_sleep_reset_001",
    performanceNotes: "Strong completion rate. Weak CTA — need to test alternative.",
    createdAt: "2026-04-10",
    updatedAt: "2026-04-15",
    body: "[Scene 1: 0-3s] Time-lapse: person tossing at night vs. sleeping peacefully.\n[Scene 2: 3-8s] 'Sleep reset isn't about sleeping more. It's about restoring the signal.'\n[Scene 3: 8-15s] Explain cortisol-melatonin rhythm. Visual: sunrise/sunset cycle.\n[Scene 4: 15-20s] Eastaura approach: herbal support + circadian environment + acupuncture for nervous system regulation.\n[Scene 5: 20-25s] '5 days to reset the pattern. The rest is maintenance.'\n[CTA] Download free Sleep Reset Guide.",
    topics: ["Sleep Reset", "Circadian Rhythm", "Education"],
    platforms: ["YouTube Shorts", "TikTok"],
  },
  {
    id: "content_006",
    title: "5-Day 4-Night Experience Overview",
    type: "short_video_script",
    channel: "TikTok",
    campaign: "Experience Overview",
    cta: "See Full Itinerary",
    complianceStatus: "approved",
    publishStatus: "scheduled",
    sourceCode: "tiktok_5d4n_overview_001",
    performanceNotes: "Itinerary format tested well in previous campaign. Reuse structure.",
    createdAt: "2026-04-18",
    updatedAt: "2026-04-24",
    body: "[Scene 1: 0-3s] '5 days. Here is exactly what happens.'\n[Scene 2: 3-8s] Day 1: Arrival, consultation, first herbal tea blend.\n[Scene 3: 8-13s] Day 2-3: Acupuncture, bodywork, structured rest, nature walks.\n[Scene 4: 13-18s] Day 4: Integration session, self-care protocol design.\n[Scene 5: 18-23s] Day 5: Departure with 30-day follow-up plan.\n[Scene 6: 23-25s] 'No group activities. No forced socializing. Just you and your reset.'\n[CTA] Link to full itinerary PDF.",
    topics: ["Itinerary", "Experience Overview"],
    platforms: ["TikTok", "Instagram Reels", "YouTube Shorts"],
  },
  {
    id: "content_007",
    title: "Weekly Brief — Sleep Edition: April 20",
    type: "newsletter",
    channel: "Newsletter",
    campaign: "Newsletter Sleep Series",
    cta: "Read Full Issue",
    complianceStatus: "approved",
    publishStatus: "published",
    sourceCode: "newsletter_sleep_apr20",
    performanceNotes: "Open rate 42%, click rate 8.3%. Above benchmark.",
    createdAt: "2026-04-19",
    updatedAt: "2026-04-20",
    body: "This week's focus: the difference between sleep deprivation and circadian disruption.\n\n- Case snapshot: executive who 'slept 8 hours' but woke exhausted\n- TCM lens: why time of day matters more than duration\n- Practical tip: 48-hour screen curfew before arrival\n- Next week: herbal support vs. supplement stacking\n\n[CTA] Reply with your sleep question for next edition.",
    topics: ["Newsletter", "Sleep", "Circadian"],
    platforms: ["Newsletter"],
  },
  {
    id: "content_008",
    title: "No Chinese Required — Full English Support",
    type: "short_video_script",
    channel: "Instagram Reels",
    campaign: "Barrier Breaker Series",
    cta: "Check Language Options",
    complianceStatus: "approved",
    publishStatus: "published",
    sourceCode: "reels_no_chinese_001",
    performanceNotes: "Strong engagement from Japan, Korea, and Southeast Asia.",
    createdAt: "2026-04-12",
    updatedAt: "2026-04-16",
    body: "[Scene 1: 0-3s] Text: 'I want to try TCM but I don't speak Chinese.'\n[Scene 2: 3-8s] Show bilingual team. English intake, English consultation, English protocol.\n[Scene 3: 8-15s] Testimonials in English. 'I was worried about language. It was never an issue.'\n[Scene 4: 15-20s] Translation support for herbal prescriptions to take home.\n[Scene 5: 20-23s] 'Your only job is to show up. We'll handle the rest.'\n[CTA] Link to language support page.",
    topics: ["Language Barrier", "English Support"],
    platforms: ["Instagram Reels", "YouTube Shorts"],
  },
];

// ─── REVIEW TASKS ───
export const reviewTasks: ReviewTask[] = [
  {
    id: "task_001",
    type: "lead_risk_review",
    priority: "high",
    relatedObject: "Elena Rossi — Lead",
    relatedObjectId: "lead_003",
    aiRecommendation: "Flag for medical boundary review. Lead reported heart arrhythmia and blood pressure medication. Recommend consulting with medical advisor before offering any TCM services. Suggested response: empathetic acknowledgment + request for physician clearance + offer of non-medical wellness components only.",
    status: "pending",
    createdAt: "2026-04-27T09:30:00",
    details: "Hypertension + arrhythmia + Lisinopril + Metoprolol",
  },
  {
    id: "task_002",
    type: "followup_email_approval",
    priority: "medium",
    relatedObject: "James Chen — Lead",
    relatedObjectId: "lead_002",
    aiRecommendation: "Draft emphasizes evidence-based TCM research and includes links to peer-reviewed studies. Tone is consultative, not promotional. Includes clear next step: schedule 15-minute discovery call.",
    status: "pending",
    createdAt: "2026-04-26T14:20:00",
    details: "Follow-up email for skeptical tech executive",
  },
  {
    id: "task_003",
    type: "content_compliance",
    priority: "high",
    relatedObject: "Stress Recovery Is Not a Vacation",
    relatedObjectId: "content_003",
    aiRecommendation: "Flagged phrase: 'addresses stress at the nervous system level' could be interpreted as medical claim. Suggested revision: 'creates conditions for your nervous system to downregulate.' Also flagged: 'herbal support' — add disclaimer that herbs are not a substitute for medical treatment.",
    status: "pending",
    createdAt: "2026-04-26T11:00:00",
    details: "Medical-adjacent language in TikTok script",
  },
  {
    id: "task_004",
    type: "script_approval",
    priority: "medium",
    relatedObject: "POV: You come to China for a quiet wellness reset",
    relatedObjectId: "content_001",
    aiRecommendation: "Script is clean from compliance perspective. All medical claims avoided. Visual storytelling approach is strong. One suggestion: add subtitle for accessibility. CTA is clear and tracks to correct intake form.",
    status: "approved",
    createdAt: "2026-04-24T10:15:00",
    details: "Instagram Reels script for POV series",
  },
  {
    id: "task_005",
    type: "notification_priority",
    priority: "urgent",
    relatedObject: "Failed Email — Anna Kowalski",
    relatedObjectId: "notif_005",
    aiRecommendation: "Email bounce detected for high-value lead. Suggested action: verify email address from intake form, attempt alternative contact method, or flag for manual outreach within 2 hours to prevent consultation no-show.",
    status: "pending",
    createdAt: "2026-04-27T08:00:00",
    details: "Consultation reminder email bounced",
  },
  {
    id: "task_006",
    type: "lead_risk_review",
    priority: "medium",
    relatedObject: "Olivia Brown — Lead",
    relatedObjectId: "lead_008",
    aiRecommendation: "Lead is on HRT for menopause. Medium risk due to potential herb-drug interactions. Suggested approach: acknowledge respectfully, clarify Eastaura does not replace medical treatment, offer to coordinate with her integrative medicine practitioner, focus retreat on lifestyle and stress reduction components only.",
    status: "pending",
    createdAt: "2026-04-27T12:00:00",
    details: "HRT + menopause-related sleep issues",
  },
  {
    id: "task_007",
    type: "followup_email_approval",
    priority: "low",
    relatedObject: "David Park — Lead",
    relatedObjectId: "lead_004",
    aiRecommendation: "Nurture sequence email #1: budget-friendly alternatives, payment plan information, and long-term value framing. Tone is supportive, not pushy. Includes social proof from similar budget-conscious guests.",
    status: "pending",
    createdAt: "2026-04-25T16:30:00",
    details: "Nurture email for budget-constrained lead",
  },
];

// ─── NOTIFICATIONS ───
export const notifications: Notification[] = [
  {
    id: "notif_001",
    type: "new_lead",
    title: "New lead: Elena Rossi from Italy",
    message: "Submitted intake form via YouTube Shorts. Goals: Whole-Person Balance, Sleep Reset. AI flagged HIGH RISK — heart condition and BP medication detected.",
    status: "pending",
    createdAt: "2026-04-27T09:30:00",
    read: false,
    relatedId: "lead_003",
  },
  {
    id: "notif_002",
    type: "high_risk_alert",
    title: "High-risk lead requires review",
    message: "Elena Rossi (lead_003) has been flagged for medical boundary review. Heart arrhythmia and blood pressure medication reported.",
    status: "sent",
    createdAt: "2026-04-27T09:35:00",
    read: false,
    relatedId: "lead_003",
  },
  {
    id: "notif_003",
    type: "followup_reminder",
    title: "Follow-up due: Marcus Weber",
    message: "Proposal sent 3 days ago. No response yet. Suggested action: gentle follow-up email or LinkedIn message.",
    status: "pending",
    createdAt: "2026-04-27T08:00:00",
    read: false,
    relatedId: "lead_006",
  },
  {
    id: "notif_004",
    type: "daily_brief",
    title: "Daily Brief — April 27, 2026",
    message: "3 new leads, 2 high-intent, 1 high-risk. 5 pending review tasks. 4 content drafts awaiting approval. 2 follow-ups due today.",
    status: "sent",
    createdAt: "2026-04-27T07:00:00",
    read: true,
    relatedId: "dashboard",
  },
  {
    id: "notif_005",
    type: "failed_email",
    title: "Failed email: Anna Kowalski consultation reminder",
    message: "Email bounced for anna.k@wellness.pl. Consultation scheduled for Apr 29. Immediate manual outreach recommended.",
    status: "failed",
    createdAt: "2026-04-27T08:00:00",
    read: false,
    relatedId: "lead_005",
  },
  {
    id: "notif_006",
    type: "failed_ai_task",
    title: "AI task failed: Content compliance check",
    message: "Compliance check for 'Stress Recovery Is Not a Vacation' failed due to API timeout. Manual review required before publish.",
    status: "failed",
    createdAt: "2026-04-26T11:05:00",
    read: true,
    relatedId: "content_003",
  },
  {
    id: "notif_007",
    type: "new_lead",
    title: "New lead: Sarah Mitchell from United States",
    message: "Submitted intake form via Instagram Reels. Goals: Sleep Reset, Stress Recovery. AI scored intent 92/100. LOW risk.",
    status: "sent",
    createdAt: "2026-04-26T14:00:00",
    read: true,
    relatedId: "lead_001",
  },
  {
    id: "notif_008",
    type: "followup_reminder",
    title: "Follow-up due: Yuki Tanaka dietary question",
    message: "Yuki asked about pescatarian meal options 8 hours ago. Response not yet sent.",
    status: "pending",
    createdAt: "2026-04-27T10:00:00",
    read: false,
    relatedId: "lead_007",
  },
];

// ─── SKILL FILES ───
export const skillFiles: SkillFile[] = [
  {
    id: "skill_001",
    name: "Brand Voice",
    category: "Foundation",
    updatedAt: "2026-04-20",
    content: `## Eastaura Brand Voice

### Core Tone
- Calm, grounded, and quietly confident
- Never urgent, never salesy
- Speak as a practitioner, not a marketer
- Use sensory language: texture, temperature, rhythm, silence

### What We Say
- "Your body knows how to recover. We create the conditions."
- "Five days of structured rest, not five days of treatments."
- "TCM is a system of balance, not a prescription for cure."

### What We Never Say
- "Cure", "heal", "fix", "treat" (medical claims)
- "Guaranteed results"
- "Doctor-approved" (unless literally true and documented)
- Discount language, urgency scarcity

### Audience Personas
1. Burned-out executive (35-50, US/EU/Asia)
2. Wellness-curious professional (30-45, global)
3. Post-transition seeker (45-60, life change moment)

### Language Rules
- English: British or neutral international English
- Avoid wellness jargon unless explained
- Use concrete specifics over abstract benefits`,
  },
  {
    id: "skill_002",
    name: "Medical Boundary",
    category: "Compliance",
    updatedAt: "2026-04-18",
    content: `## Medical Boundary Policy

### Principle
Eastaura provides wellness experiences. We do not provide medical diagnosis, treatment, or advice.

### Red Flag Conditions (Require Review)
- Heart conditions, arrhythmia, hypertension on medication
- Diabetes on insulin
- Pregnancy
- Active cancer treatment
- Post-surgical (within 6 months)
- Severe mental health conditions

### Approved Language
- "Support your body's natural balance"
- "Create conditions for recovery"
- "Complement your existing health regimen"
- "Not a substitute for professional medical care"

### Forbidden Language
- "Treat", "cure", "heal", "fix"
- "Will reduce blood pressure"
- "Cures insomnia"
- "Alternative to medication"

### Process
1. AI flags medical keywords in intake
2. Human reviews flagged leads within 4 hours
3. If high risk: empathetic decline + referral suggestion
4. If medium risk: modified offer (non-medical components only)
5. Document all decisions`,
  },
  {
    id: "skill_003",
    name: "Content Strategy",
    category: "Marketing",
    updatedAt: "2026-04-15",
    content: `## Eastaura Content Strategy

### Goal
Attract high-intent, high-budget overseas clients through trust-based content.

### Pillars
1. **Education** — TCM explained simply
2. **Experience** — POV/immersive content
3. **Trust** — Transparency, founder story, boundaries
4. **Proof** — Guest journeys (with permission, anonymous)

### Channel Mix
- Instagram Reels: 40% (primary discovery)
- TikTok: 20% (younger audience, brand awareness)
- YouTube Shorts: 15% (SEO, longer attention)
- LinkedIn: 15% (executive audience, trust-building)
- Newsletter: 7% (nurture, conversion)
- Blog: 3% (SEO, deep education)

### Content Rules
- 80% value, 20% offer
- Every piece must answer: "Why should I trust Eastaura with my recovery?"
- No before/after health claims
- All guest content is experience-focused, never medical
- CTA always leads to intake form or discovery call`,
  },
  {
    id: "skill_004",
    name: "Short Video Script Rules",
    category: "Marketing",
    updatedAt: "2026-04-22",
    content: `## Short Video Script Rules

### Format
- 20-40 seconds for experience clips
- 60 seconds max for educational content
- 3-second hook rule: viewer must know value in 3s

### Structure
1. Hook (0-3s): Visual + text that stops scroll
2. Context (3-10s): Establish setting/mood
3. Core (10-25s): Deliver promise from hook
4. CTA (25-30s): Single clear action

### Visual Style
- No stock footage
- Real Eastaura spaces, real practitioners
- Natural light preferred
- Slow, intentional pacing
- Sound design: ambient, no music or very minimal

### Compliance Checks
- Script must pass medical boundary scan
- No health claims in text overlays
- CTA cannot promise outcomes
- If showing guest: signed release on file

### POV Series Guidelines
- Always framed as experience, not testimonial
- Never show guest faces without consent
- Focus on spaces, rituals, sensory details
- "You" language: invites imagination, not expectation`,
  },
  {
    id: "skill_005",
    name: "Lead Review Rules",
    category: "Operations",
    updatedAt: "2026-04-25",
    content: `## Lead Review Rules

### Scoring
- Intent Score (0-100): Based on goal clarity, timeline specificity, budget fit
- Risk Level: low / medium / high based on medical flags

### Auto-Actions
- Intent > 80 + Risk LOW → Auto-draft follow-up email
- Intent > 80 + Risk MEDIUM → Flag for human review
- Intent 50-80 + Risk LOW → Add to nurture sequence
- Intent < 50 → Archive with quarterly re-engagement
- Risk HIGH → Hold, notify founder within 2 hours

### Follow-Up Timing
- New qualified lead: within 4 hours
- Post-consultation: within 24 hours
- Proposal sent: follow-up at 3 days, 7 days, 14 days
- Nurture: weekly touch for 8 weeks, then monthly

### Data Entry
- Always log source attribution (campaign, content, channel, UTM)
- Tag with primary goals for segmentation
- Note budget range for offer matching
- Record all interactions in timeline`,
  },
  {
    id: "skill_006",
    name: "Follow-up Email Templates",
    category: "Operations",
    updatedAt: "2026-04-21",
    content: `## Follow-up Email Templates

### Template: New Qualified Lead
Subject: Your Eastaura intake — next steps

Hi {{name}},

Thank you for sharing your goals with us. Based on what you described — {{primary_goals}} — Eastaura could be a meaningful fit.

A few questions to make sure we're the right choice:
{{custom_questions}}

If this resonates, the next step is a 20-minute video consultation where we discuss your timeline and what the 5-day structure would look like for your situation.

No pressure. Just clarity.

[Book Consultation]

Warmly,
{{sender_name}}
Eastaura

---

### Template: Post-Consultation
Subject: Your Eastaura proposal

Hi {{name}},

Thank you for the conversation yesterday. I appreciated your honesty about {{noted_concern}}.

Based on our discussion, I've prepared a personalized 5-day protocol:
{{proposal_summary}}

The investment: {{price_range}}
Available dates: {{available_dates}}

Take your time reviewing. I'll check in next week if I haven't heard from you.

[View Full Proposal]

Warmly,
{{sender_name}}

---

### Template: Nurture (Budget Not Ready)
Subject: No rush — Eastaura will be here

Hi {{name}},

I understand the timing isn't right. That's completely fine.

In the meantime, I'll send you a short monthly note with:
- One practical TCM tip you can try at home
- A glimpse of what's happening at Eastaura
- Early access when we open new seasonal dates

No obligation. Unsubscribe anytime.

Warmly,
{{sender_name}}`,
  },
  {
    id: "skill_007",
    name: "Notification Priority Rules",
    category: "Operations",
    updatedAt: "2026-04-19",
    content: `## Notification Priority Rules

### Urgent (Immediate)
- High-risk lead flagged
- Failed email to scheduled consultation guest
- Failed AI task blocking publish
- Security or privacy incident

### High (Within 2 hours)
- New high-intent lead
- Content compliance flagged
- Follow-up overdue by >24 hours
- Guest question unanswered >12 hours

### Medium (Within 4 hours)
- New medium-intent lead
- Script approval needed
- Daily brief generation
- System maintenance window

### Low (Within 24 hours)
- Weekly reports
- Content performance summaries
- Nurture sequence status
- Non-urgent task completions

### Routing
- Urgent/High: In-app + email + Feishu
- Medium: In-app + email
- Low: In-app digest only

### Quiet Hours
- 22:00 - 07:00 China time: Urgent only
- Respect lead timezone for email sends`,
  },
  {
    id: "skill_008",
    name: "Scale Operations",
    category: "Growth",
    updatedAt: "2026-04-10",
    content: `## Scale Operations Playbook

### Current Capacity
- Max 8 guests per week
- 2 practitioners full-time
- Founder handles all sales + review

### Scale Triggers
- Lead volume > 20 qualified/week for 4 weeks
- Consultation booking rate > 60%
- Conversion rate > 25%

### Scale Options
1. **Add Practitioner** — Hire TCM practitioner with English fluency
2. **Batch Scheduling** — Fixed weekly arrival days (Mon/Wed)
3. **Assistant Layer** — Virtual assistant for scheduling + basic email
4. **Group Component** — Optional (not mandatory) group element for efficiency

### Maintain Quality
- Never exceed 12 guests/week
- Founder still reviews every lead
- AI handles draft, human approves all outbound
- Keep consultation personal, never templated

### Metrics to Watch
- Guest satisfaction score (target: > 4.8/5)
- Referral rate (target: > 30%)
- Staff burnout indicators
- Lead quality at scale (don't sacrifice fit for volume)`,
  },
];

// ─── DASHBOARD DATA ───
export const dashboardStats = {
  newLeadsToday: 3,
  highIntentLeads: 2,
  highRiskLeads: 1,
  pendingReviewTasks: 5,
  contentDraftsWaiting: 4,
  followUpsDueToday: 2,
  weeklyPublished: 12,
  formConversionRate: "4.8%",
  aiTimeSaved: "6.5h",
};

export const funnelData: FunnelStage[] = [
  { stage: "Content Published", count: 18420, percentage: 100 },
  { stage: "Website Visits", count: 1280, percentage: 6.9 },
  { stage: "Intake Started", count: 426, percentage: 33.3 },
  { stage: "Leads Submitted", count: 72, percentage: 16.9 },
  { stage: "Consultations Booked", count: 18, percentage: 25.0 },
];

export const dailyBrief = {
  date: "April 27, 2026",
  items: [
    "3 new leads overnight — 2 high intent, 1 flagged for medical review",
    "5 review tasks pending your approval before noon",
    "Anna Kowalski consultation in 2 days — email bounced, needs manual outreach",
    "Weekly content performance: POV series driving 42% of form starts",
    "AI time saved today: 6.5 hours. Focus on consultation prep and high-risk reviews.",
  ],
};

export const recentAiSummaries = [
  {
    id: "summary_001",
    leadName: "Sarah Mitchell",
    summary: "High-intent US lead. Sleep + stress goals. Concerns: language, acupuncture safety. Budget fit. No medical flags. Suggested: video consultation link.",
    timestamp: "2 hours ago",
  },
  {
    id: "summary_002",
    leadName: "Elena Rossi",
    summary: "Italian lead. High risk flagged — heart arrhythmia + BP medication. Intent is there but medical boundary review REQUIRED before any contact.",
    timestamp: "1 hour ago",
  },
  {
    id: "summary_003",
    leadName: "Olivia Brown",
    summary: "Australian health professional. Menopause-related sleep issues. On HRT. Medium risk. Needs sensitive framing around medical boundary.",
    timestamp: "6 hours ago",
  },
];

export const topContent = [
  { title: "POV: Arrive in China", clicks: "8.7%", leadRate: "4.3%", channel: "Instagram Reels" },
  { title: "Why Eastaura Doesn't Promise Cures", clicks: "6.2%", leadRate: "6.8%", channel: "LinkedIn" },
  { title: "Sleep Reset Explained", clicks: "5.1%", leadRate: "5.6%", channel: "YouTube Shorts" },
  { title: "No Chinese Required", clicks: "4.0%", leadRate: "3.2%", channel: "Instagram Reels" },
];

export const channelPerformance = [
  { channel: "Instagram Reels", contentCount: 12, clicks: 182, clickRate: "42.7%", leads: 9, leadRate: "50.0%", highIntent: 4, suggestion: "Continue POV experience content" },
  { channel: "TikTok", contentCount: 16, clicks: 156, clickRate: "36.6%", leads: 6, leadRate: "33.3%", highIntent: 2, suggestion: "Test stronger hooks in first 1s" },
  { channel: "YouTube Shorts", contentCount: 10, clicks: 64, clickRate: "15.0%", leads: 2, leadRate: "11.1%", highIntent: 1, suggestion: "SEO-optimized titles needed" },
  { channel: "LinkedIn", contentCount: 6, clicks: 18, clickRate: "4.2%", leads: 1, leadRate: "5.6%", highIntent: 0, suggestion: "Longer-form thought leadership" },
  { channel: "Newsletter", contentCount: 4, clicks: 6, clickRate: "1.4%", leads: 0, leadRate: "0.0%", highIntent: 0, suggestion: "Optimize subject lines and CTAs" },
];
