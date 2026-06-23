# The Digital Tutor Global SAT® Prep

A 30–45 day validation MVP for affordable SAT® accountability in global markets. It combines conversion pages, lead capture, a founder cohort offer, an AI tutor demo, mock dashboards, and launch documentation without overbuilding a full LMS.

## Markets

Launch: Pakistan, Bangladesh, Nigeria. Secondary: Indonesia, Malaysia, South Korea. Sponsored access: Haiti. Expansion includes Vietnam, Nepal, Ghana, Kenya, Philippines, Egypt, Sri Lanka, India, and Morocco.

## Stack and features

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- Responsive landing and cohort conversion pages
- Student, parent webinar, partner, and contact forms
- Optional n8n webhook delivery with safe local fallback
- Optional OpenAI-compatible tutor route with a useful mock fallback
- Mock student/admin dashboards and materials library
- Vercel-ready; no database, paid service, auth, or payment code required

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Use `npm run lint` and `npm run build` before deployment.

## Routes

`/`, `/founder-cohort`, `/register`, `/diagnostic`, `/ai-tutor`, `/parent-webinar`, `/partners`, `/dashboard`, `/admin`, `/materials`, `/contact`.

## AI tutor and n8n

The tutor returns a high-quality mock coaching response without configuration. Add `OPENAI_API_KEY` to enable the OpenAI chat completion call. Add any `N8N_*_WEBHOOK_URL` value to deliver the corresponding form or tutor log. Missing webhooks are logged server-side as mocked submissions.

## Deployment

Import the repository into Vercel, add needed environment variables, and deploy. The app has no external persistence requirement. Before a production launch, add admin/student authentication, rate limiting, durable lead storage, monitoring, and real payment links.

## Legal

SAT® is a trademark registered by the College Board, which is not affiliated with and does not endorse The Digital Tutor. This project does not guarantee score improvement and must use only original or properly licensed material.

Development branch: `feature/lean-sat-prep-mvp`.
