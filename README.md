# VBK Platform

Medlemsplatform for **Vandel Brugshundeklub** — klub-feed, 1:1-chat, hold-tilmelding og invite-only onboarding med magic link.

## Tech stack

- **Next.js 16** (App Router) + TypeScript + Tailwind + shadcn/ui
- **Supabase** (Auth, Postgres, Realtime, RLS)
- **Vercel** (hosting)
- **Stripe** (forberedt — betaling aktiveres når nøgler sættes)

## Kom i gang

### 1. Supabase

1. Opret et projekt på [supabase.com](https://supabase.com)
2. Kør SQL fra [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) i SQL Editor
3. Under **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (eller dit domæne)
   - Redirect URLs: `http://localhost:3000/auth/callback`
4. Under **Authentication → Email** — aktiver magic link / OTP (standard Supabase-mail med "Sign in"-link er fint til `/log-ind`)
5. (Valgfrit) Konfigurer **Resend** som SMTP under Project Settings → Auth

### 2. Miljøvariabler

Kopiér `.env.example` til `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SETUP_SECRET=din-hemmelige-setup-nøgle
```

### 3. Første invitation (bootstrap)

```bash
npm run dev
```

```bash
curl -X POST http://localhost:3000/api/setup \
  -H "x-setup-secret: din-hemmelige-setup-nøgle"
```

Åbn `invite_url` fra svaret. **Første bruger bliver automatisk admin.**

### 4. Udvikling

```bash
npm install
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000).

### Medlemslogin (`/log-ind`)

Godkendte medlemmer logger ind med **login-mail (magic link)** eller **e-mail + adgangskode**.

- Første gang: invitationslink → `/invite/[token]` → login-mail → **opret adgangskode** på `/auth/set-password`
- Derefter: `/log-ind` med fanen **Login-mail** eller **Adgangskode**

Kør migration [`004_password_set_at.sql`](supabase/migrations/004_password_set_at.sql) i Supabase SQL Editor.

**Nød-hjælp i udvikling** (ikke i UI):

```bash
npm run dev:invite          # opret invite-link (kræver kørende dev-server)
npm run dev:magic-link -- din@email.dk   # print magic link i terminal
```

## Deploy til Vercel

1. Push til GitHub og importer i Vercel
2. Tilføj alle env-variabler fra `.env.example`
3. Opdater Supabase redirect URLs til `https://www.vandel-brugshundeklub.dk/auth/callback`
4. Tilføj custom domain i Vercel → DNS CNAME til Vercel

## Funktioner

| Område | Beskrivelse |
|--------|-------------|
| Offentlig forside | Marketing, kursushold, om os |
| Invite + login | Invitation til nye; `/log-ind` med e-mail + magic link til eksisterende |
| Klub-feed | Opslag, likes, kommentarer, søgning |
| Chat | 1:1 med realtime (Supabase) |
| Tilmelding | Hold/arrangementer med kapacitet og venteliste |
| Admin | Opret invitationslinks |
| Stripe | Webhook klar — aktiver med `STRIPE_*` env |

## Mappestruktur

```
src/app/(public)/     Offentlige sider
src/app/(member)/     Medlemsområde
src/app/invite/       Invitation
src/app/auth/         Auth callback
supabase/migrations/  Database schema
public/               Logo og billeder
design/               Originale designfiler
```

## Stripe (senere)

Når klubben har Stripe-konto:

1. Sæt `STRIPE_SECRET_KEY` og `STRIPE_WEBHOOK_SECRET`
2. Opret webhook til `/api/webhooks/stripe`
3. Tilføj `stripe_price_id` på betalte events i admin

Betaling via Stripe understøtter MobilePay m.m. i Danmark når det er aktiveret på kontoen.
