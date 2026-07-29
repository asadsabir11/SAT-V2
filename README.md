# The Digital Tutor Global SAT® Prep

Affordable, cohort-based SAT® prep for students in emerging markets. The product is the accountability layer around free content: weekly live classes, a 24/7 AI tutor, original mocks, regional study groups, human-tutor escalation — and **weekly parent progress reports**, the differentiator competitors lack.

## Markets

Launch: Pakistan, Bangladesh, Nigeria. Secondary: Indonesia, Malaysia, South Korea. Sponsored access: Haiti. Expansion includes Vietnam, Nepal, Ghana, Kenya, Philippines, Egypt, Sri Lanka, India, and Morocco.

## Stack and features

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Neon Postgres, Vercel
- Server-side JWT auth (`sat_auth` HttpOnly cookie) with `student`, `parent`, and `founder` roles
- Student area: dashboard, diagnostic, quizzes, lectures, live sessions, discussion, AI tutor
- **Parent reporting system**: per-skill analytics, weekly report pipeline (draft → founder approval → email + WhatsApp), role-gated `/parent` portal with server-side RBAC (a parent sees only their linked child), `/sample-report` marketing page
- Admin area (`/admin`): leads, students, access control, sessions, attendance, homework, quizzes, question bank, lectures, analytics, parent links, report review/sending
- Emails via Resend; optional n8n webhooks; every integration degrades safely when its env var is empty

## Local setup

```bash
npm install
cp .env.example .env.local   # empty values are fine — the app runs in mock/fallback mode
npm run dev
```

Open `http://localhost:3000`. Use `npm run lint` and `npm run build` before deployment. Without `POSTGRES_URL` the site renders and DB-backed API routes return errors on use; with it, tables are created on demand.

## Weekly parent reports

1. A Vercel cron (`vercel.json`, Fridays 06:00 UTC) calls `/api/cron/weekly-reports`, which aggregates each student's real attendance/homework/practice/score data for the week and pre-writes an AI narrative (template fallback if `OPENAI_API_KEY` is unset). Requires `CRON_SECRET` and `COHORT_START_DATE`.
2. The founder reviews drafts in `/admin/reports`, edits the coach note and the single parent action, and approves.
3. Sending delivers a summary email (Resend) plus a `wa.me` link pre-filled with the WhatsApp message; both link into the parent portal for the full report. Reports never invent data — missing signals show as "not recorded".

## Payments

Pricing CTAs use the Stripe payment-link pattern: if `NEXT_PUBLIC_STRIPE_FOUNDER_COHORT_PAYMENT_LINK` / `NEXT_PUBLIC_STRIPE_PREMIUM_PAYMENT_LINK` / `NEXT_PUBLIC_SPONSORED_STUDENT_DONATION_LINK` are set, buttons open them; otherwise they fall back to `/register?plan=…`. No checkout code to maintain — create the links in the Stripe dashboard and set the env vars in Vercel.

## Environment variables

See `.env.example` for the full annotated list: database (`POSTGRES_URL`), auth (`JWT_SECRET`, `ADMIN_SECRET`), AI (`OPENAI_API_KEY`), email (`RESEND_API_KEY`, `ADMIN_EMAIL`), storage (`BLOB_READ_WRITE_TOKEN`), payments, community links (`NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL`, `NEXT_PUBLIC_TELEGRAM_COMMUNITY_URL`), contact addresses, weekly-report cron (`CRON_SECRET`, `COHORT_START_DATE`), and optional analytics IDs.

## Legal

SAT® is a trademark registered by the College Board, which is not affiliated with and does not endorse The Digital Tutor. This project does not guarantee score improvement and must use only original or properly licensed material.
