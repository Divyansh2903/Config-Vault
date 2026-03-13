# ConfigVault

A secure, team-oriented configuration and secrets manager built with Next.js. Manage environment variables across projects and environments with encryption, role-based access control, audit logging, and secure secret sharing.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma 7
- **Auth:** In-house cookie-based auth (email/password) backed by Neon/Postgres
- **Encryption:** AES-256-GCM for secret values
- **Styling:** Tailwind CSS 4, shadcn/ui components

## Features

- **Multi-project support** — organize configs across separate projects
- **Environment management** — Development, Staging, Production (and custom)
- **Secret encryption** — AES-256-GCM encryption at rest for sensitive values
- **Role-based access** — Owner, Editor, and Viewer roles with granular permissions
- **Secret reveal control** — per-member permissions for revealing and sharing secrets
- **Secure sharing** — time-limited, view-limited share links for individual secrets
- **Environment readiness** — warnings when required config entries are missing
- **Config import/export** — bulk import from `.env` files
- **Secret rotation tracking** — track when secrets were last rotated
- **Audit logging** — full trail of who did what and when
- **Config duplication** — copy entries between environments

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 9+
- A [Supabase](https://supabase.com/) project (free tier works)
- PostgreSQL (provided by Supabase, or run locally)

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <your-repo-url> configvault
cd configvault
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in every value in `.env`. See `.env.example` for descriptions.

### 3. Generate an encryption key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output as `ENCRYPTION_MASTER_KEY` in your `.env` file. **Keep this key safe** — losing it means encrypted secrets cannot be recovered.

### 4. Push the database schema

```bash
npx prisma db push
```

### 5. Seed the database

```bash
npx prisma db seed
```

This creates sample projects, environments, config entries, audit logs, and share links. See [Seed Accounts](#seed-accounts) below.

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed Accounts

The seed script creates three Profile records with deterministic UUIDs. Because authentication is handled by Supabase, **you must create matching auth users separately** — either through the app's register flow or in the Supabase dashboard.

| Name           | Email               | Role (E-Commerce) | Role (Dashboard) |
| -------------- | ------------------- | ------------------ | ---------------- |
| Alice Owner    | alice@example.com   | Owner              | Owner            |
| Bob Editor     | bob@example.com     | Editor             | Editor           |
| Charlie Viewer | charlie@example.com | Viewer             | —                |

After registering, update the Profile `id` in the database to match the seed UUIDs, or re-run the seed after updating the UUIDs in `prisma/seed.ts` to match the Supabase user IDs.

## Project Structure

```
my-app/
├── app/
│   ├── (auth)/              # Login & registration pages
│   ├── (dashboard)/         # Authenticated dashboard
│   │   ├── dashboard/       # Home / overview
│   │   ├── projects/        # Project list, detail, settings
│   │   │   └── [projectId]/
│   │   │       ├── environments/[envId]/  # Config entry management
│   │   │       ├── members/               # Member management
│   │   │       ├── audit/                 # Audit log viewer
│   │   │       └── settings/              # Project settings
│   │   └── profile/         # User profile
│   ├── (marketing)/         # Public pages
│   ├── api/                 # API routes
│   └── share/               # Public share-link viewer
├── components/
│   ├── audit/               # Audit log components
│   ├── config/              # Config entry table, dialogs, badges
│   ├── layout/              # Sidebar, theme toggle, empty states
│   ├── members/             # Member management components
│   ├── projects/            # Project cards, environment cards
│   └── ui/                  # shadcn/ui primitives
├── hooks/                   # Custom React hooks
├── lib/
│   ├── audit/               # Audit logging utilities
│   ├── auth/                # Auth helpers
│   ├── db/                  # Prisma client singleton
│   ├── permissions/         # RBAC permission checks
│   ├── security/            # Encryption (AES-256-GCM)
│   ├── supabase/            # Supabase client helpers
│   └── validations/         # Zod schemas
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script
├── types/                   # Shared TypeScript types
├── middleware.ts             # Supabase auth middleware
├── prisma.config.ts          # Prisma 7 config
└── package.json
```

## Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `pnpm dev`             | Start development server             |
| `pnpm build`           | Build for production                 |
| `pnpm start`           | Start production server              |
| `pnpm lint`            | Run ESLint                           |
| `npx prisma db push`   | Push schema to database              |
| `npx prisma db seed`   | Run the seed script                  |
| `npx prisma studio`    | Open Prisma Studio (database GUI)    |
| `npx prisma generate`  | Regenerate Prisma Client             |

## License

MIT
