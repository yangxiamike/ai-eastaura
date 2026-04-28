# Eastaura Workbench UI v2

## Project

Next.js App Router prototype for the internal Eastaura Workbench. It covers cold-start content operations, POV video scripting, publishing calendar, attribution, leads CRM, review tasks, notifications, skills, settings, and partner assets.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- lucide-react icons

## Local Run

```powershell
npm install
npm run dev -- -H 127.0.0.1 -p 5182
```

Open `http://127.0.0.1:5182/workbench/`.

If port `5182` is already occupied, use another port:

```powershell
npm run dev -- -H 127.0.0.1 -p 5183
```

## Common Commands

```powershell
npm run build
npm run lint
```

Production export uses `dist`; local dev uses `.next` so build output does not overwrite the dev server cache.

## Routes

- `/workbench/`
- `/workbench/content/`
- `/workbench/video-generator/`
- `/workbench/calendar/`
- `/workbench/attribution/`
- `/workbench/leads/`
- `/workbench/leads/[id]/`
- `/workbench/review-tasks/`
- `/workbench/notifications/`
- `/workbench/resources/`
- `/workbench/skills/`
- `/workbench/settings/`
