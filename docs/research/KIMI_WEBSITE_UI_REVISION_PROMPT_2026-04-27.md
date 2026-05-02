# Kimi Website UI Revision Prompt

归档日期：2026-04-27

用途：保存本轮对 Kimi 生成的 Eastaura Website UI 的检查结果、21st.dev 组件风格参考，以及可直接发给 Kimi 做下一轮修改的整合 prompt。

## 本轮检查结论

检查地址：`https://m55sxklrr6ome.ok.kimi.link/`

Browser Use 插件在本机初始化失败，报错为插件 app-server/Node fetch 无法启动。本轮改用网页抓取、Chrome headless 截图和 HTML/CSS 检查完成判断。截图已保存：

- `docs/assets/kimi-website-home.png`
- `docs/assets/kimi-website-mobile.png`
- `docs/assets/kimi-website-program.png`
- `docs/assets/kimi-website-intake.png`
- `docs/assets/21st-hero-category.png`
- `docs/assets/21st-shadcnspace.png`

### 当前 Kimi 技术栈判断

当前 Kimi 输出是 Next.js 站点，不是普通 React SPA。判断依据：

- HTML 中包含 `/_next/static/chunks/...`、`data-nimg="fill"`、Next font module class。
- 页面 title 和 meta 由 Next 输出。
- 使用了 Tailwind utility class、lucide icon SVG、Next Image 风格图片输出。

与项目目标技术栈基本一致：Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui style components + lucide-react。

但当前部署结果存在严重路由问题：

- `/` 首页返回 200。
- `/program/`、`/safety/`、`/insights/`、`/intake/`、`/thank-you/` 均返回 404。
- 首页导航和 CTA 链接指向这些 404 页面，所以不是一个完整官网原型。

### 当前 UI 主要问题

1. Hero 可读性失败  
   首屏图片本身可以用，但遮罩、文字颜色和按钮颜色没有配合好。页面使用了 `text-warm-white`、`bg-warm-white`、`bg-warm-white/90` 等 class，但生成的 CSS 中没有这些 class 或变量，导致首屏文字和按钮在深色图片上呈黑色/低对比状态。

2. 导航 CTA 文案不可见  
   桌面端右上角 CTA 显示为黑色圆角块，但文字几乎不可见，影响转化入口。

3. 移动端首屏溢出  
   移动端文案横向截断，CTA 堆叠和居中表现粗糙，首屏像“缩小的桌面端”，不是重新设计过的移动端。

4. 组件过于基础  
   首页后续区块虽然信息完整，但大多是普通网格卡片、普通列表、普通 CTA。缺少 premium concierge / editorial travel 的层次、节奏、图文关系和可信细节。

5. 缺少高客单价信任结构  
   目前有安全边界文案，但缺少更强的“为什么可以信任”的视觉表达，例如审核流程、服务边界、翻译陪同、合作方资质、隐私处理、人工 review 等模块化证明。

6. 缺少真实官网完整度  
   必需页面没有生成，尤其是 Program、Safety、Insights、Intake。当前只能算首页草稿，不符合上一轮 prompt 要求的小型完整官网。

## 21st.dev 风格参考

参考来源：

- 21st 官方文档说明其是 AI-powered UI builder 和 React/Tailwind 组件、screens、themes 社区库。
- `https://21st.dev/community/components/s/hero`：Hero Components for React & Next.js，页面显示有大量 React/Tailwind hero 组件。
- `https://21st.dev/community/components/s/landing-page`：Landing Page Components for React & Next.js。
- `https://21st.dev/community/components/s/call-to-action`：Call to action Components for React & Next.js。
- `https://21st.dev/community/components/s/testimonials`：Testimonials Components for React & Next.js。
- `https://21st.dev/community/shadcnspace`：ShadcnSpace，生产级 shadcn UI blocks、components、templates。

适合 Eastaura 借鉴的组件方向：

1. Luxury boutique full-image hero  
   不采用 21st 中的多图组 hero。当前 Kimi 首页“大图满屏 + 居中品牌文案”的布局方向是对的，更接近 luxury boutique retreat；下一轮只优化背景图片质感、遮罩、文字对比、CTA 可读性和底部信任条。

2. Landing page / Bento Grid  
   用 bento-style trust grid 替换普通 3 列/4 列卡片，让 Safety、Translation、Human Review、Qualified Partners、Privacy、Concierge Coordination 更像高端服务系统。

3. ShadcnSpace Button with Icon / Shine Hover  
   用克制的 icon button、hover highlight、arrow circle 替换现在呆板的纯色按钮。注意 Eastaura 不要炫光、霓虹或过强动画。

4. ShadcnSpace Accordion / Accordion Multi Level  
   用于 Safety FAQ、Who it is for / not for、Program included / not included。比普通长列表更适合解释边界和降低焦虑。

5. ShadcnSpace Radio Group with Plan Cards / Field / Input Group / Textarea with characters left  
   用于 Intake 表单，让目标、预算、风险自评变成更清楚的卡片式选择，而不是普通 checkbox 堆叠。

6. Hover Blog Card / Image Testimonial Grid  
   用于 Insights 卡片和非虚构 trust proof。不要编造用户评价，可改成 founder note、partner vetting note、safety note、sample journey card。

不适合 Eastaura 的 21st 风格：

- shader、aurora、sparkles、cybercore、galaxy、dark SaaS、heavy gradient、3D hero。
- 过度动效、游戏化按钮、强紫蓝科技感。
- 伪 testimonial 或看起来像 SaaS/AI 工具站的组件。

## 可保存的组件替换 Prompt

### 1. Editorial Retreat Hero

```text
Keep the current hero layout direction, but refine it into an editorial luxury boutique retreat hero.

Keep the full-bleed single large background image as the first viewport background. Do not replace it with a multi-image collage, product mockup, app-style hero, or card-heavy hero. Use a real-feeling luxury boutique retreat / quiet Chinese wellness courtyard / understated resort image with soft natural light.

Add a reliable dark-to-warm overlay that guarantees white text readability. Do not use undefined Tailwind classes such as text-warm-white unless the token is explicitly defined.

Hero layout:
- Brand name Eastaura is the dominant first-viewport signal.
- H1 / main copy must be readable on desktop and mobile.
- Add a small eyebrow: China-based TCM wellness retreat.
- Primary CTA: Start Your Intake, with visible label and arrow icon.
- Secondary CTA: Explore the Program, outlined or ghost style with visible contrast.
- Add a bottom trust rail over or just below the hero: Translation support, Human review, Safety screening, Qualified partners.
- Leave a small hint of the next section visible below the fold.

Visual tone:
quiet luxury, editorial travel, calm wellness, premium concierge. Avoid dark SaaS, neon, purple gradients, mystical oriental styling, red/gold tourist styling, and generic spa cliches.
```

### 2. Bento Trust Grid

```text
Replace the plain trust/safety cards with a premium bento-style trust grid inspired by high-quality React/Tailwind landing page components.

Cards should vary in size and hierarchy:
- Human Review: largest card, explain that every intake is reviewed by a person before acceptance.
- Safety Screening: checklist style with restrained iconography.
- Translation Support: image or transcript-style visual showing bilingual guidance.
- Qualified Local Partners: partner vetting card, no fake logos.
- Clear Non-Medical Boundary: warning/clarity card, calm and transparent.
- Privacy Protected: compact card with data handling note.

Use subtle borders, soft shadows, warm white background, sage accents, restrained gold details, and max 8px card radius. Do not put cards inside cards. Avoid glassmorphism unless very subtle.
```

### 3. Program Timeline + Image Gallery

```text
Redesign the 5-day program preview and /program page as a calm itinerary timeline with editorial image cards.

Use a left/right or vertical timeline:
- Day 1 Arrival, check-in, orientation, rest
- Day 2 Translator-supported TCM-informed wellness consultation
- Day 3 Bodywork / breath / tea / rest-focused experience
- Day 4 Slow cultural wellness day and integration
- Day 5 Summary, follow-up suggestions, departure

Pair the timeline with 3-5 image cards that feel like quiet arrival, tea/rest, consultation with translator, retreat room, slow cultural wellness. Avoid tourist landmark cliches and stock spa poses.

Add clear sections for included, not included, ideal clients, not suitable for, pilot price range $2,500-$3,000, and CTA to /intake.
```

### 4. Intake Form Upgrade

```text
Redesign the intake form as a premium multi-section form, not a plain long form.

Use shadcn-style Field, Input Group, Radio Group cards, Checkbox cards, Select, Textarea with character count, and a sticky review/next-step panel on desktop.

Sections:
1. Contact and travel basics
2. Recovery goals as selectable cards
3. Budget and travel window
4. Health/risk self-report as serious checkbox cards
5. Consent and non-medical boundary

Important:
- Make mobile layout first-class.
- Use visible labels and helper text.
- Keep the tone calm and trustworthy.
- On submit, route to /thank-you. No real backend needed.
- Do not collect unnecessary medical detail beyond the requested risk checkboxes and free message.
```

### 5. Insights + Proof Cards

```text
Replace generic article cards with editorial hover blog cards.

Each card should include:
- Real-feeling image thumbnail
- Category
- Title
- One-sentence summary
- Reading time
- Clear hover state

Use topics already defined:
- What Is a TCM Wellness Retreat?
- Stress Recovery Is Not the Same as a Vacation
- Is Eastaura a Medical Treatment Program?
- What Happens During a TCM-Informed Wellness Consultation?
- Why Sleep Reset Needs Rhythm, Not Just Rest?
- How We Screen Wellness Travelers Before Arrival

Do not create fake user testimonials. If adding proof cards, use transparent proof types: safety note, founder note, sample journey, partner vetting process, translation support note.
```

### 6. FAQ / Boundary Accordion

```text
Use an accordion-style FAQ for the /safety page and homepage safety preview.

Required topics:
- What Eastaura is
- What Eastaura is not
- This is not emergency medical care
- No diagnosis, cure, or treatment guarantees
- How risk screening works
- High-risk situations requiring doctor consultation
- How translation support works
- Privacy and data handling

Accordion styling should be quiet, clear, premium, and accessible. Avoid tiny gray text. Each answer should be direct and non-defensive.
```

## 给 Kimi 的整合 Prompt

```text
You previously generated an Eastaura website prototype at:
https://m55sxklrr6ome.ok.kimi.link/

Please revise it into a more polished, complete, production-quality frontend prototype.

Current issues to fix:
1. The current output appears to be a Next.js site, which is good and matches our target stack, but only the homepage works.
   The following routes currently return 404 and must be implemented:
   - /program
   - /safety
   - /insights
   - /insights/[slug]
   - /intake
   - /thank-you

2. Fix the Tailwind token/class issue.
   The current HTML uses classes such as text-warm-white, text-warm-white/80, bg-warm-white, bg-warm-white/90, but the generated CSS does not include these utilities. As a result, hero text and CTA labels render with poor contrast.
   Define the color tokens correctly in Tailwind/CSS, or replace them with generated Tailwind classes. All hero text and buttons must be visibly readable.

3. The current UI feels too plain and card-template-like. Upgrade the component system using high-quality React/Tailwind/shadcn-style patterns inspired by 21st.dev, but adapt them to Eastaura's quiet luxury wellness positioning.

Keep the target stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui style components
- lucide-react icons
- Static frontend prototype only
- Mock data only
- No database
- No authentication
- No payment
- No real API calls

Do not switch to plain React/Vite. If you use components inspired by 21st.dev, implement them directly as local React/TypeScript components in this Next.js App Router project.

Brand direction:
Eastaura is a China-based TCM wellness retreat for stress recovery, sleep reset, and whole-person balance.
It should feel like quiet luxury wellness + editorial travel + professional concierge service.
It must not feel like a generic spa, yoga studio, hospital, tourist agency, SaaS dashboard, or mystical oriental brand.

Visual rules:
- Use warm white, soft stone, deep ink, muted sage/jade, restrained warm gold accents.
- Do not make it one-note beige.
- Avoid purple SaaS gradients, neon, cyber, shader, galaxy, aurora, sparkles, heavy glassmorphism, red/gold tourist styling, and abstract SVG hero illustrations.
- Use real-feeling editorial travel/wellness imagery placeholders.
- Cards max 8px radius.
- No cards inside cards.
- Mobile must be intentionally designed, not just squeezed desktop.

Component upgrades to implement:

1. Editorial Retreat Hero
- Keep the current hero layout: one full-bleed luxury boutique retreat background image, centered brand/value proposition, and two CTAs.
- Do not change it into a 21st-style multi-image hero, SaaS mockup hero, or card-heavy hero.
- Improve the background image quality/direction: luxury boutique retreat, calm Chinese wellness courtyard, soft natural light, understated resort atmosphere.
- Add a reliable readable overlay.
- Brand name Eastaura is the main first-viewport signal.
- Eyebrow: China-based TCM wellness retreat.
- Main value proposition:
  A China-based TCM wellness retreat for stress recovery, sleep reset, and whole-person balance.
- Primary CTA: Start Your Intake, visible label, arrow icon.
- Secondary CTA: Explore the Program.
- Add a bottom trust rail: Translation support, Human review, Safety screening, Qualified partners.
- Leave a hint of the next section visible below the fold.

2. Bento Trust Grid
- Replace plain trust cards with a bento-style section.
- Include Human Review, Safety Screening, Translation Support, Qualified Local Partners, Clear Non-Medical Boundary, Privacy Protected, Concierge Coordination.
- Use varied card sizes, subtle borders, restrained icons, and high-quality spacing.

3. Program Timeline + Image Gallery
- Homepage program preview and /program page should use a calm itinerary timeline.
- Include the 5-day flow:
  Day 1 Arrival, check-in, orientation, rest
  Day 2 Translator-supported TCM-informed wellness consultation
  Day 3 Bodywork / breath / tea / rest-focused experience
  Day 4 Slow cultural wellness day and integration
  Day 5 Summary, follow-up suggestions, departure
- Add included / not included, ideal clients, not suitable for, translation support, safety screening, pilot price range $2,500-$3,000, CTA to /intake.

4. Safety FAQ / Boundary Accordion
- Build /safety as a strong trust page, not a text dump.
- Use accordion sections for:
  What Eastaura is
  What Eastaura is not
  Not emergency medical care
  No diagnosis/cure/treatment guarantees
  Risk screening
  High-risk situations requiring doctor consultation
  Translation support
  Privacy and data handling
- Required high-risk items:
  pregnancy, recent surgery, serious cardiovascular condition, anticoagulant medication, severe allergy, immune suppression, currently seeking treatment for a diagnosed disease, urgent or unstable symptoms.

5. Intake Form Upgrade
- Build /intake as a premium multi-section form.
- Use shadcn-style Field, Input Group, Radio Group cards, Checkbox cards, Select, Textarea with character count, and a sticky next-step/privacy panel on desktop.
- Sections:
  Contact and travel basics
  Recovery goals
  Budget and travel window
  Health/risk self-report
  Consent and non-medical boundary
- Required fields:
  Full name, Email, Country, Phone or WhatsApp, Age range, Planned travel window, Travel party, Primary goals, Budget range, Health/risk self-report checkboxes, Free message, Privacy consent, Non-medical wellness consent.
- Form submit should navigate to /thank-you without a real backend.

6. Insights Cards
- Build /insights and /insights/[slug].
- Use editorial hover blog cards with real-feeling thumbnails, category, reading time, summary, and clear hover states.
- Include 3-6 realistic articles:
  What Is a TCM Wellness Retreat?
  Stress Recovery Is Not the Same as a Vacation
  Is Eastaura a Medical Treatment Program?
  What Happens During a TCM-Informed Wellness Consultation?
  Why Sleep Reset Needs Rhythm, Not Just Rest
  How We Screen Wellness Travelers Before Arrival

7. CTA and buttons
- Replace plain buttons with restrained icon buttons inspired by high-quality shadcn/21st.dev patterns.
- Use arrow icons, subtle hover states, visible focus states, and clear contrast.
- Avoid flashy shine effects unless extremely subtle.

8. Footer and navigation
- All navigation links must work.
- The desktop nav CTA text must be visible.
- Mobile menu must open and provide links to Program, Safety, Insights, Start Intake.
- Add social media icon links in the footer for TikTok, Instagram, and Facebook. Use recognizable icon-style buttons with accessible labels. If real URLs are not provided, use safe placeholder href values such as `#` and do not invent real account URLs.
- Footer links should not point to missing pages unless those pages are implemented or made non-clickable placeholders.

Acceptance criteria:
- /, /program, /safety, /insights, /insights/[slug], /intake, /thank-you all render without 404.
- All primary CTAs route correctly.
- Hero text and nav CTA are readable on desktop and mobile.
- Mobile homepage has no horizontal overflow or text clipping.
- Intake submit routes to /thank-you.
- Footer includes visible TikTok, Instagram, and Facebook icon links on desktop and mobile.
- UI feels premium, editorial, calm, trustworthy, and less template-like.
- No fake testimonials, no medical claims, no cure promises.
- Keep implementation clean, componentized, and easy to connect later to Supabase, OpenAI API, Resend, Feishu webhook, and Vercel.
```
