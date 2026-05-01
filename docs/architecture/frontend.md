# Frontend Architecture

## Overview

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui patterns.

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| State | Zustand (client), TanStack React Query (server) |
| Forms | React Hook Form + Zod |
| Components | Radix UI primitives via shadcn/ui |

## Project Structure

```
FE/artium-web/src/
├── @domains/     # Business logic by domain (artwork, auth, orders, etc.)
│   └── [domain]/
│       ├── hooks/      # Domain-specific hooks (camelCase)
│       ├── components/ # Domain components
│       └── utils/     # Domain utilities
├── @shared/      # Reusable components, hooks, utilities
│   ├── components/ui/  # UI primitives (kebab-case)
│   ├── hooks/         # Shared hooks
│   └── utils/         # Shared utilities (cn() helper)
└── pages/        # Next.js pages (thin, SSR/session only)
```

## Conventions

- Use `cn()` for Tailwind class merging
- Use `createUseQuery` wrapper for TanStack React Query
- Absolute imports: `@shared/`, `@domains/`
- No `useSWR` for new features
