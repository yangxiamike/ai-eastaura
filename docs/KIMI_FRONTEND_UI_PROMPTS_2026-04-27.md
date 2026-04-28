# Kimi Frontend UI Prompts Archive

归档日期：2026-04-27

用途：保存给 Kimi 生成 Eastaura 第一版前端原型的两个完整 prompt。第一版让 Kimi 负责生成可运行、可点击的前端骨架；后续由 Codex 在项目中整理结构、接入数据表、Supabase、AI Agent、Skill 文件、通知和真实表单提交。

## 总体判断

- Website 不是单页 landing page，而是一个小型完整官网前端原型。
- Workbench 是内部操作系统前端原型，不是公开营销页。
- 两者统一使用 `Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui style components + lucide-react`。
- Kimi 第一轮只做静态前端、mock data、路由和基础交互，不接数据库、认证、真实 API、AI、邮件或支付。

## Website Prompt

```text
Build a production-quality frontend prototype for Eastaura, a China-based TCM wellness retreat brand for overseas clients seeking stress recovery, sleep reset, and whole-person balance.

This should be a small complete website prototype, not only a single landing page.

Important positioning:
Eastaura is not a hospital, not a medical treatment platform, not an online wellness coach brand, and not a mass tourism agency.
Eastaura is a premium concierge-style wellness retreat service that helps overseas clients experience carefully curated TCM-informed wellness programs in China, with translation support, safety screening, clear boundaries, and human guidance.

Core value proposition:
A China-based TCM wellness retreat for stress recovery, sleep reset, and whole-person balance.

Primary visual direction:
Use the feeling of luxury retreat / boutique retreat websites.
The website should feel like an editorial travel and premium retreat experience:
- immersive photography
- generous spacing
- elegant typography
- calm storytelling
- slow-travel atmosphere
- refined service presentation
- high trust and high ticket value

Secondary structural reference:
Use the clarity of premium wellness service templates such as Mentara / Harmoni / Serenya:
- clear service sections
- FAQ
- safety explanation
- blog / insights
- intake flow
- trust-building blocks
- conversion-ready CTAs

Do not copy any specific website. Use these only as inspiration.

Avoid:
- generic spa salon layout
- yoga studio cliches
- therapist website feeling
- online wellness coach branding
- mystical oriental design
- red/gold tourist China styling
- medical tourism hype
- hospital or clinic-heavy interface
- cheap tour package feeling
- dark cinematic fashion-site look that hurts readability
- overly beige one-note palette
- purple SaaS gradients
- abstract SVG hero illustrations

Brand tone:
Calm, trustworthy, premium, warm, transparent, restorative, culturally grounded, and human.
It should feel like quiet luxury wellness + editorial travel + professional concierge service.

Target audience:
Overseas professionals aged 35-60 who feel stressed, burned out, sleep-deprived, mentally overloaded, physically depleted, or unable to recover through ordinary vacations.
They are curious about a China-based wellness reset but may worry about safety, language barriers, medical boundaries, and whether TCM is understandable or credible.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui style components if useful
- lucide-react icons
- Static frontend prototype only
- Use mock data
- Do not connect to database
- Do not implement real API calls
- Do not implement authentication
- Do not implement payments
- Keep code clean and componentized
- Desktop and mobile responsive
- Generate runnable frontend code, not just a design description

Required pages/routes:
1. /
Homepage / main landing page

2. /program
5-day TCM Wellness Reset program page

3. /safety
Safety, FAQ, and medical boundary page

4. /insights
Blog / insights list page

5. /insights/[slug]
Blog / insights article detail page

6. /intake
Client intake form page

7. /thank-you
Form submission success page

Navigation:
- Program
- Safety
- Insights
- Start Intake

Homepage layout direction:
1. Full-bleed editorial hero
Use real-feeling China wellness / retreat / calm travel imagery.
Brand name Eastaura should be the main first-viewport signal.
Include the value proposition:
"A China-based TCM wellness retreat for stress recovery, sleep reset, and whole-person balance."
Primary CTA: Start Your Intake
Secondary CTA: Explore the Program

2. Pain translation section
Explain stress, poor sleep, fatigue, burnout, chronic tension, and low recovery in Western-friendly language.
Do not use "sub-health" as the main public-facing phrase.

3. Program preview
Introduce the 5-day / 4-night TCM Wellness Reset in China.
Show a calm itinerary snapshot, not a packed tourist schedule.

4. Why China / why TCM-informed wellness
Explain source, culture, qualified local partners, translation support, human guidance, and curated experience.

5. Safety and boundaries
Clearly explain:
- This is a wellness experience
- It is not emergency medical care
- It does not diagnose or treat disease
- Medical services, if any, are provided only by qualified local partners
- Human review is required before accepting a client

6. How it works
Use a clear flow:
Read the program
Submit intake
Human review
Video consultation
Curated itinerary
Arrival and guided experience

7. Who it is for / who it is not for
For:
- stressed professionals
- sleep-deprived founders/executives
- people seeking a slower recovery-oriented travel experience
- people curious about TCM-informed wellness with translation support

Not for:
- urgent medical conditions
- people seeking guaranteed treatment results
- people who need emergency care
- people unwilling to complete safety screening

8. Trust signals
Include:
- Translation support
- Qualified local partners
- Safety screening
- Privacy
- Human review
- Clear non-medical positioning
- Concierge-style coordination

9. Featured insights / blog previews
Show 3 article previews.

10. Final CTA
Invite users to start intake.

Program page requirements:
Create a polished page for:
5-day TCM Wellness Reset

Include:
- Overview
- What is included
- What is not included
- Sample day-by-day flow
- Ideal clients
- Not suitable for
- Translation and concierge support
- Safety screening
- Pricing placeholder:
  Pilot range $2,500-$3,000
- CTA to /intake

Sample day-by-day flow:
Day 1: Arrival, check-in, orientation, rest
Day 2: Translator-supported TCM-informed wellness consultation and gentle recovery plan
Day 3: Bodywork / breath / tea / rest-focused experience
Day 4: Slow cultural wellness day and integration
Day 5: Summary, follow-up suggestions, departure

Safety page requirements:
Create a clear safety, FAQ, and medical boundary page.

Include:
- Non-medical disclaimer
- What Eastaura is
- What Eastaura is not
- Risk screening explanation
- High-risk situations requiring doctor consultation
- Privacy and data handling notes
- FAQ
- No cure / treatment guarantees
- CTA to intake or program page

High-risk situations:
- pregnancy
- recent surgery
- serious cardiovascular condition
- anticoagulant medication
- severe allergy
- immune suppression
- currently seeking treatment for a diagnosed disease
- urgent or unstable symptoms

Insights page requirements:
Create a polished blog / insights list page with 3-6 realistic article previews.

Example article topics:
- What Is a TCM Wellness Retreat?
- Stress Recovery Is Not the Same as a Vacation
- Is Eastaura a Medical Treatment Program?
- What Happens During a TCM-Informed Wellness Consultation?
- Why Sleep Reset Needs Rhythm, Not Just Rest
- How We Screen Wellness Travelers Before Arrival

Insight detail page requirements:
Create a reusable article detail template with:
- Article title
- Category
- Reading time
- Published date
- Rich editorial content
- Related articles
- CTA to Safety or Intake
Use mock article data and dynamic route structure.

Intake page requirements:
Create a polished client intake form UI.

Fields:
- Full name
- Email
- Country
- Phone or WhatsApp
- Age range
- Planned travel window
- Travel party
- Primary goals:
  stress recovery, sleep reset, energy restoration, digestion, chronic tension, general wellness
- Budget range
- Health/risk self-report checkboxes:
  pregnancy
  recent surgery
  serious cardiovascular condition
  anticoagulant medication
  severe allergy
  immune suppression
  currently seeking treatment for diagnosed disease
  none of the above
- Free message
- Privacy consent checkbox
- Non-medical wellness consent checkbox
- Submit button

The form does not need real backend submission.
On submit, route or link to /thank-you.

Thank You page requirements:
Show that the intake has been received.

Explain:
- The team will review the intake within 1-2 business days
- This is not emergency medical care
- Clients with urgent symptoms should contact local medical services
- Link back to Safety and Insights
- Optional next step: read the program or wait for human review

Visual design requirements:
- Use calm premium colors:
  warm white, soft stone, deep ink, muted jade/sage, subtle warm gold accents
- Do not make the palette one-note beige
- Avoid heavy gradients
- Avoid purple SaaS aesthetics
- Avoid mystical red/gold tourist cliches
- Use real-feeling wellness/travel imagery placeholders
- Do not use abstract SVG hero illustrations
- Use generous spacing, strong typography, and clear hierarchy
- Cards should have subtle borders and max 8px radius
- Do not put cards inside cards
- Do not use decorative blobs, orbs, or heavy gradients
- Do not use lorem ipsum
- Make the site feel credible for a high-ticket wellness concierge service
- English UI copy
- Include realistic Eastaura sample copy

Photography / image direction:
Use placeholders that feel like:
- quiet arrival in China
- calm retreat space
- tea, breath, bodywork, rest
- understated Chinese wellness environment
- slow travel, soft natural light, human guidance
Avoid:
- hospital imagery
- stock spa cliches
- overly staged yoga poses
- tourist landmark cliches
- dark, blurry, generic luxury imagery

Interaction requirements:
- All navigation links should work
- CTA buttons should route to the correct pages
- Intake form submit should route to /thank-you
- Blog cards should link to article detail pages
- Use mock data and placeholder functions only
- The output should be easy for another developer to connect later to Supabase, OpenAI API, Resend, Feishu webhook, and Vercel

Code quality requirements:
- Use a clean folder structure
- Use reusable components
- Put mock data in separate files where appropriate
- Keep components readable
- Avoid over-engineering
- Make it easy to later add:
  Supabase database
  Intake API
  email notifications
  AI lead summary
  admin Workbench
  blog CMS or markdown content
```

## Workbench Prompt

```text
Build a production-quality frontend prototype for the internal Eastaura Workbench.

Eastaura is a China-based TCM wellness retreat brand for overseas clients seeking stress recovery, sleep reset, and whole-person balance.

This Workbench is the internal operating system for the founder. It manages content marketing, inbound leads, AI review tasks, follow-ups, notifications, and business knowledge files.

This is not a public marketing website. It should feel like a calm, premium, efficient operator dashboard.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui style components if useful
- lucide-react icons
- Static frontend prototype only
- Use mock data
- Do not connect to database
- Do not implement real API calls
- Do not implement authentication
- Keep code clean and componentized
- Desktop-first, but responsive enough for tablet/mobile
- Use English UI labels
- Generate runnable frontend code, not just a design description

Core navigation:
- Dashboard
- Content Studio
- Leads
- Review Tasks
- Notifications
- Skills & Templates
- Settings

Recommended route structure:
- /workbench
- /workbench/content
- /workbench/leads
- /workbench/leads/[id]
- /workbench/review-tasks
- /workbench/notifications
- /workbench/skills
- /workbench/settings

Brand / UI tone:
Calm, premium, operational, trustworthy, focused.
Avoid flashy gradients, huge hero sections, decorative SaaS clutter, and generic AI dashboard gimmicks.
The interface should feel like a real daily workbench for a solo founder running an international wellness business.

Dashboard screen:
Show:
- Today's new leads
- High-intent leads
- High-risk leads
- Pending review tasks
- Content drafts waiting for approval
- Follow-ups due today
- Recent AI summaries
- Daily brief panel
- Small funnel snapshot:
  Content published -> Website visits -> Intake started -> Leads submitted -> Consultations booked

Content Studio screen:
Show:
- Topic bank
- Short-video script drafts
- LinkedIn post drafts
- Channel:
  TikTok, Instagram Reels, YouTube Shorts, LinkedIn, Newsletter, Blog
- Campaign
- CTA
- Compliance status
- Publish status
- Source code, such as tiktok_sleep_reset_001
- Performance notes
- Button to create new content draft
- Table or kanban-style sections are acceptable, but keep it practical

Leads CRM screen:
Show a lead list with:
- Name
- Country
- Primary goals
- Source
- Campaign
- Status
- Risk level
- Intent score
- Last activity
- Next action

Lead Detail screen:
Show:
- Intake details
- AI summary
- Risk notes
- Intent score
- Recommended next step
- Follow-up notes
- Status timeline
- Draft follow-up email
- Source attribution:
  campaign, content item, channel, UTM/source code
- Buttons:
  Mark Qualified, Book Consultation, Send Follow-up Draft, Mark Not Fit

Review Tasks screen:
Show AI-generated items requiring human approval:
- Lead risk review
- Follow-up email approval
- Content compliance check
- Script approval
- Notification priority review
Each task should show:
- Priority
- Related object
- AI recommendation
- Status
- Approve / Edit / Reject actions

Notifications screen:
Show:
- New lead alerts
- High-risk alerts
- Follow-up reminders
- Daily brief items
- Failed email alerts
- Failed AI task alerts
Include notification status:
pending, sent, failed, skipped

Skills & Templates screen:
Show editable business knowledge files:
- Brand Voice
- Medical Boundary
- Content Strategy
- Short Video Script Rules
- Lead Review Rules
- Follow-up Email Templates
- Notification Priority Rules
- Scale Operations
Use a file-list + editor-preview layout.
It does not need to actually save.

Settings screen:
Show:
- Admin profile
- Notification email
- Feishu webhook placeholder
- Daily brief time
- AI provider placeholder
- Intake form settings
- Privacy/safety toggles

Design requirements:
- Left sidebar navigation
- Top bar with search, current date, and quick action button
- Dense but readable dashboard layout
- Use tables, filters, status chips, compact panels, tabs, and clear empty states
- Use lucide-react icons inside buttons
- Cards max 8px radius
- Do not put cards inside cards
- Do not use decorative blobs, orbs, or heavy gradients
- Use calm premium colors: warm white, soft gray, deep ink, muted jade/sage, restrained gold accents
- Include realistic Eastaura sample data
- Make it feel like a real operating system, not a concept mockup

Interaction requirements:
- All sidebar navigation links should work
- Lead rows should link to lead detail pages
- Review task action buttons can update mock state locally or show a clear placeholder interaction
- Filters can be visual-only or mock interactive
- Skills file selection should update the editor preview
- Use mock data and placeholder functions only
- The output should be easy for another developer to connect later to Supabase, OpenAI API, Resend, Feishu webhook, and Vercel
```

## 后续接入原则

Kimi 生成代码后，Codex 后续接手重点：

1. 统一项目结构，避免 Website 和 Workbench 形成两套孤立代码。
2. 抽离共享品牌 token、布局组件、mock data 和业务类型。
3. 接入 Supabase 数据表和 RLS。
4. 接入 Intake API、邮件通知和飞书提醒。
5. 接入 AI Agent、Skill 文件、`ai_runs` 和 `review_tasks`。
6. 做最小必要验证：路由、表单、后台列表、AI 生成结果保存、通知记录。
