# OpenClaw / Hermes Marketing Skills Research

> 2026-04-27 调研。目标是梳理内容生成、营销增长相关 skill，并提炼可借鉴的 prompt / instruction 结构。以下为公开资料摘要，不直接复制第三方 prompt 到生产环境。

## 内容生成 / 营销 Skill 分类

1. 市场与受众研究：ICP、persona、竞品、趋势、关键词、痛点。
2. 品牌与定位：brand voice、messaging、value proposition、tagline。
3. 内容策略：topic ideation、editorial calendar、campaign planning、funnel mapping。
4. 长文内容：blog、SEO article、newsletter、case study、thought leadership。
5. 短内容与社媒：X、LinkedIn、Instagram、TikTok/Reels、threads、平台改写。
6. 广告与转化文案：landing page、ad copy、CTA、email sequence、cold outreach。
7. SEO / 搜索增长：keyword、SERP intent、meta tags、content brief、CTR。
8. 视频 / 图像创意：video script、storyboard、image prompt、infographic、meme。
9. 发布、复用与分发：repurposing、cross-platform adaptation、posting schedule。
10. 审核与优化：brand compliance、legal/safety review、A/B variants、performance recap。

## OpenClaw 相关 Skills

| 类别 | Skill | 用途 | Prompt / 指令结构摘要 | 原文 |
| --- | --- | --- | --- | --- |
| 品牌与声音 | `brand-voice-profile` | 访谈用户、分析样本，生成品牌声音 profile | 收集样本 -> 访谈 -> 提炼 tone / vocabulary / rules -> 输出 `brand-voice/profile.json` | [SKILL.md](https://raw.githubusercontent.com/openclaw/skills/main/skills/dimitripantzos/brand-voice-profile/SKILL.md) |
| 品牌与声音 | `sovereign-brand-voice-writer` | 按品牌声音生成 tweets、threads、newsletter、blog、video script | 读取 `config/brand-voice.json` -> 判断内容类型 -> 按品牌声音生成 -> 保持语气一致 | [SKILL.md](https://raw.githubusercontent.com/openclaw/skills/main/skills/ryudi84/sovereign-brand-voice-writer/SKILL.md) |
| 通用内容生产 | `content-generation` | 文章、博客、社媒、营销文案、报告、产品描述 | 受众分析 -> 目标定义 -> 研究 -> 提纲 -> 起草 -> 编辑 -> SEO/平台优化 -> QA | [SKILL.md](https://raw.githubusercontent.com/openclaw/skills/main/skills/tobisamaa/content-generation/SKILL.md) |
| 长文 / 博客 | `blog-writer` | 按作者风格写 800-1500 字博客 | 读取 style guide/examples -> 选题/结构 -> 起草 -> 编辑 -> 可沉淀样本库/发布到 Notion | [SKILL.md](https://raw.githubusercontent.com/openclaw/skills/main/skills/tomstools11/blog-writer/SKILL.md) |
| 转化文案 | `reef-copywriting` | landing page、产品页、广告、CTA、销售文案 | Use/Don't use -> PAS/AIDA/FAB/BAB/4Ps/Star-Story-Solution -> landing page section -> CTA guide -> copy rules | [SKILL.md](https://raw.githubusercontent.com/openclaw/skills/main/skills/staybased/reef-copywriting/SKILL.md) |
| SEO / 元信息 | `meta-tags-optimizer` | title、meta description、OG/Twitter Card、CTR | 页面信息收集 -> title/meta/OG/Twitter 生成 -> EEAT/CTR 检查 -> A/B 建议 | [SKILL.md](https://github.com/openclaw/skills/blob/main/skills/aaron-he-zhu/meta-tags-optimizer/SKILL.md) |
| B2C 短视频增长 | `b2c-marketing` | TikTok/Instagram organic growth、短视频测试、转化 | 账号创建 -> 7 天养号 -> 内容市场匹配 -> 100 format 测试 -> trend riding -> views-to-customers -> scale -> Post Bridge 发布 | [SKILL.md](https://raw.githubusercontent.com/openclaw/skills/main/skills/jackfriks/b2c-marketing/SKILL.md) |
| 冷启动外联 | `cold-outreach` | 冷邮件、LinkedIn DM、SMS、多触点序列 | ICP-first -> personalized opener -> value-first ask -> PAS/BAB/AIDA/one-liner -> deliverability checklist -> sequence | [SKILL.md](https://raw.githubusercontent.com/openclaw/skills/main/skills/staybased/cold-outreach/SKILL.md) |
| Lead Magnet | `lead-magnets` | checklist、template、calculator、quiz、mini-course、webinar | 窄问题 -> 5 分钟价值 -> trust signal -> awareness stage -> free-to-paid conversion architecture | [SKILL.md](https://raw.githubusercontent.com/openclaw/skills/main/skills/staybased/lead-magnets/SKILL.md) |
| PMM / GTM | `marketing-strategy-pmm` | 定位、ICP、竞品、battlecard、launch、sales enablement | April Dunford 定位 -> ICP -> competitive intelligence -> launch checklist -> sales enablement -> international GTM | [SKILL.md](https://raw.githubusercontent.com/openclaw/skills/main/skills/alirezarezvani/marketing-strategy-pmm/SKILL.md) |
| 内容复用 | `content-remix-studio` | 把视频/博客/播客拆成 TikTok、X、LinkedIn、IG、SEO blog、newsletter | 核心 insight / quote / moment 提取 -> 多平台格式重写 -> 内容包输出 | [索引页](https://clawskills.sh/skills/akhmittra-content-remix-studio) |
| 社媒发布 | `simplified-social-media` | 多平台发帖、排程、分析 | API 连接 -> 发帖/排程 -> 分析反馈 | [索引页](https://clawskills.sh/skills/jacksimplified-simplified-social-media) |
| 趋势研究 | `content-research` | 近 7 天趋势内容、Reddit/X/Discord/LinkedIn 角度 | 趋势搜索 -> 平台角度拆分 -> 选题建议 | [索引页](https://clawskills.sh/skills/hazy2go-content-research) |

OpenClaw 还在第三方分类页中出现了广告、品牌视觉、声誉管理、归因/CRM 类候选，如 `meta-ads-report`、`adwhiz`、`brand-guidelines`、`review-reply`、`attribution-engine`、`posthog` 等，但本轮没有核验到所有原始 prompt，不能按“可复用 prompt”处理。分类来源：[awesome-openclaw-skills marketing-and-sales](https://github.com/VoltAgent/awesome-openclaw-skills/blob/main/categories/marketing-and-sales.md)。

## Hermes Agent 相关 Skills

| 类别 | Skill | 用途 | Prompt / 指令结构摘要 | 原文 |
| --- | --- | --- | --- | --- |
| 内容复用 | `youtube-content` | YouTube transcript 转章节、摘要、X thread、博客、引用 | helper script 拉 transcript -> 选择输出格式 -> 验证/分块 -> 转换 -> 复核 -> error handling | [SKILL.md](https://github.com/NousResearch/hermes-agent/blob/main/skills/media/youtube-content/SKILL.md) |
| 社媒运营 | `xurl` | X/Twitter 发帖、回复、引用、搜索、timeline、媒体上传、DM | secret safety -> 安装/认证 -> quick reference -> posting/search/engagement/media workflow -> 写操作前确认 | [SKILL.md](https://github.com/NousResearch/hermes-agent/blob/main/skills/social-media/xurl/SKILL.md) |
| 视觉内容 | `baoyu-infographic` | 从文本/URL/主题生成信息图 | 内容分析 -> 结构化 -> 推荐 layout x style -> clarify -> 组装 prompt -> image generation -> 输出报告 | [SKILL.md](https://raw.githubusercontent.com/NousResearch/hermes-agent/main/skills/creative/baoyu-infographic/SKILL.md) |
| 视觉内容 | `baoyu-comic` | 生成知识漫画、教育漫画、教程漫画 | 内容分析 -> 风格确认 -> storyboard / characters -> prompt 文件 -> image generation -> review | [SKILL.md](https://raw.githubusercontent.com/NousResearch/hermes-agent/main/skills/creative/baoyu-comic/SKILL.md) |
| Meme | `meme-generation` | 用模板和 Pillow 生成 meme PNG | 识别梗 -> 选模板 -> 写短 caption -> 渲染 -> 可读性检查 | [SKILL.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/creative/meme-generation/SKILL.md) |
| Web / 品牌设计 | `popular-web-designs` | 复用真实网站设计系统生成 HTML/CSS | 选 design template -> 加载 token/component specs -> 生成 HTML -> 浏览器视觉验证 | [SKILL.md](https://raw.githubusercontent.com/NousResearch/hermes-agent/main/skills/creative/popular-web-designs/SKILL.md) |
| Pitch / 销售材料 | `powerpoint` | 创建、读取、编辑 `.pptx`，做 pitch deck | quick reference -> 读取/编辑/从零创建 -> 设计原则 -> QA 修复循环 | [SKILL.md](https://github.com/NousResearch/hermes-agent/blob/main/skills/productivity/powerpoint/SKILL.md) |
| 内容监测 | `blogwatcher` | 监控博客/RSS/Atom 新文章 | 安装 -> add/import/scan/read -> env vars -> 示例输出 -> notes | [SKILL.md](https://github.com/NousResearch/hermes-agent/blob/main/skills/research/blogwatcher/SKILL.md) |
| 竞品/域名情报 | `domain-intel` | 被动域名 OSINT、子域名、SSL、WHOIS、DNS | helper script -> command map -> 数据源限制 -> 输出结构 | [SKILL.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/research/domain-intel/SKILL.md) |

Hermes 官方 Skills Hub 显示有 `Copywriting 4`、`Social Media 7` 分类，但本轮未能从公开静态页面完整展开 copywriting skill 原文；SEO、paid ads、增长实验类也未找到官方 bundled/optional 中明确对应的 skill。来源：[Hermes Skills Hub](https://hermes-agent.nousresearch.com/docs/skills/)、[skills catalog](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/reference/skills-catalog.md)、[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)。

## Prompt 结构模式总结

### OpenClaw 更像营销 playbook

- 通常以 `Use when / Don't use when / Edge cases` 定义触发边界。
- 会内置具体营销框架，例如 PAS、AIDA、FAB、BAB、4Ps、April Dunford positioning、短视频 hook 公式。
- 强调业务结果：CTA、conversion、download、views-to-customers、lead magnet、GTM。
- 适合借鉴为 Eastaura 的获客策略、短视频脚本、转化文案、cold outreach、lead magnet skills。

### Hermes 更像可执行 agent 操作手册

- 通常以 prerequisites、commands、workflow、output、QA、error handling 组织。
- 对 API / CLI 类 skill 会强调 secret safety、读写分离、写操作确认。
- 视觉生成类很重视中间产物：analysis、structured content、style/layout 选择、prompt 文件、最终图片。
- 适合借鉴为 Eastaura 的内容工作台操作流、图像/信息图 prompt、社媒发布工具、素材复用 pipeline。

## 对 Eastaura 的优先改造建议

1. `brand_voice_profile_v0_1`：先沉淀 Eastaura 的英文品牌声音、禁用词、医疗边界和信任表达。
2. `content_strategy_v0_1`：结合 PMM/GTM、ICP、内容漏斗和合规边界生成选题池。
3. `short_video_script_v0_1`：借鉴 `b2c-marketing` 的账号阶段、hook、CTA 和 performance log，但重写为康养/非诊疗内容。
4. `landing_copy_v0_1`：借鉴 `reef-copywriting` 的框架，但加入医疗广告、安全边界和高客单信任证据。
5. `content_repurpose_v0_1`：把一篇 insight / 客户 FAQ / 视频 transcript 拆成 X、LinkedIn、newsletter、short video、blog。
6. `visual_prompt_v0_1`：借鉴 Hermes 的 infographic/comic 流程，先结构化内容，再选 layout/style，再生成图像 prompt。
7. `cold_outreach_v0_1`：只用于 B2B 合作方/渠道外联，不直接对个人健康用户做冒进销售。
8. `review_compliance_v0_1`：所有营销内容发布前检查医疗 claims、夸大承诺、客户隐私、AI 生成素材披露。

## 风险

- OpenClaw / ClawHub 是开放 registry，部分 skill 来自社区，不能默认可信；只应借鉴结构和方法。
- 第三方 skill 的营销案例常偏 SaaS、App 或开发者产品，Eastaura 涉及健康/中医/跨境旅行，必须重写合规边界。
- Hermes 的社媒发布能力偏工具调用，真实账号写操作必须保持人工确认和 token 安全。
- 对外内容不能直接复用第三方 prompt 原文，应转化为 Eastaura 自有 skill 资产。
