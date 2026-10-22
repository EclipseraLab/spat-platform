# SPAT Platform

SPAT is a Web3 participation platform focused on daily engagement, crypto quizzes, missions, community activities, and points. This repository is separate from Onchain_Society.

## Stack
- Next.js App Router + TypeScript
- Supabase Auth using SSR cookie handling
- PostgreSQL with Row Level Security

## Implemented in this repository
- Responsive dark navy / electric blue / soft gold dashboard preview
- Email/password sign-up and sign-in routes
- Authenticated dashboard route and sign-out action
- Supabase browser/server clients and session-refresh middleware
- Initial SQL schema for profiles, SP/GP balances, point ledger, check-ins, weekly quiz assignment/answers, missions, reward claims, and admin audit records
- Environment-variable example and ignore rules for secrets

## Setup
1. Confirm the dedicated SPAT Supabase project is accessible to the connected Supabase integration.
2. Apply the SQL migration in supabase/migrations to that verified project.
3. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in local .env.local and Vercel.
4. Run npm install and npm run dev.
5. Configure Supabase Auth redirect URLs for local development and the production domain.

Never expose service-role keys in browser code or commit them to GitHub.

## Important status
The dashboard balances and rankings remain sample values. Check-in, quiz scoring, reward approvals, and game conversion still need trusted server-side functions before production. The SQL migration has been committed but has not yet been applied to a Supabase database. No production deployment has been confirmed. Any future token or airdrop is not guaranteed.
