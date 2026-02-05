# MED‑MNG — AI Rules & Tech Stack

This document defines the core stack and the rules for choosing libraries across the project to keep the codebase consistent, secure, and maintainable.

## Tech stack (overview)

- React 18 + TypeScript + Vite for a fast, type‑safe SPA foundation
- React Router for routing (all routes are defined in src/App.tsx)
- Tailwind CSS + shadcn/ui + Radix UI primitives for design system driven UI
- Supabase (client + Edge Functions + RLS) for data, auth, storage, and serverless logic
- TanStack Query for server state, caching, and request lifecycle
- Zod for runtime validation and strong typing at boundaries
- Lucide React for icons (single, consistent icon set)
- Vitest + Testing Library for unit tests; Playwright for E2E; axe for a11y checks
- Sonner/shadcn toast for UX feedback; Sentry for monitoring (optional)

---

## Library usage rules

### UI & Styling
- Use shadcn/ui components for all UI primitives (Button, Card, Dialog, Tabs, etc.).
- Use Tailwind CSS utility classes for layout and spacing; avoid custom CSS unless strictly necessary.
- Do not hardcode colors. Use semantic tokens and component variants (see ESLint rule: custom/no-hardcoded-colors).
- Use Radix UI primitives only to extend shadcn/ui where needed; do not mix other UI kits.

### Icons
- Use lucide-react for all icons; do not add other icon libraries.
- Keep consistent sizing (e.g., h-4 w-4 or h-5 w-5) and rely on currentColor for color.

### Routing
- Define and keep routes in src/App.tsx (required).
- Prefer lazy() + Suspense for non-critical routes and large pages to optimize initial load.

### Data fetching & APIs
- Use the Supabase JS client for data, auth, storage, and Edge Functions invocation.
- All third‑party APIs (OpenAI, Suno, etc.) must be called via Supabase Edge Functions. Never expose API keys in the browser.
  - For OpenAI: invoke the openai-chat and openai-image Edge Functions; do not import openai directly in the frontend.
  - For music: invoke generate-music and music-status; do not call Suno from the client.
- Use TanStack Query for server-state management (fetch, cache, revalidate). Do not put server state into Zustand or React Context.
- Axios may be used only for internal endpoints when the Supabase client is not applicable (prefer Supabase).

### Forms & validation
- Use react-hook-form for forms; use @hookform/resolvers with zod for schema validation.
- Keep schemas in a colocated file or under src/schemas; export shared types from src/types where helpful.

### State management
- Prefer React local state and Context for simple UI state.
- Use TanStack Query for server state.
- Optional: Use Zustand for complex local UI state that spans multiple components; do not store server state in Zustand.

### Notifications & toasts
- Use Sonner for transient toasts (success/error/info).
- Use shadcn/ui toast for contextual, action-oriented notifications (e.g., undo, retry).
- Avoid native alert/confirm in the app UI.

### Dates, charts, animations & media
- Dates: use date-fns for formatting and manipulation; keep all date logic timezone-safe.
- Charts: use Recharts for visualizations; no additional chart libs.
- Animations: use Framer Motion where needed; keep animations subtle and accessible.
- Audio/Media: use project components (e.g., SecureAudioPlayer) and streaming-only rules; never expose direct download links unless explicitly allowed.

### Testing
- Unit/integration: use Vitest + @testing-library/react; write tests colocated or under src/tests.
- E2E: use Playwright tests under tests/e2e; prefer @axe-core/playwright for accessibility checks.
- Do not introduce Jest for new tests (Vitest is the default).

### Auth, security & secrets
- Never embed secrets in frontend code; use Supabase Edge Functions for secure operations.
- Respect RLS policies; read/write via Supabase client with the authenticated session.
- Rate limiting and security headers are enforced server-side; do not bypass Edge Function middlewares.

### Internationalization & accessibility
- Use the existing LanguageContext and locales under src/locales for i18n text.
- Follow accessibility best practices (labels, roles, keyboard interactions); leverage Radix and shadcn accessibility defaults.
- Add accessibility tests with axe for new complex UI components.

### Performance & PWA
- Use lazy loading for heavy routes/components; keep critical path lean.
- Use TanStack Query caching thoughtfully (staleTime/gcTime).
- Prefer optimized images (next-gen formats where applicable).
- Follow vite-plugin-pwa configuration for offline support where applicable.

### Code style, structure & naming
- Place new components in src/components/, pages in src/pages/, hooks in src/hooks/.
- Create a new file for each new component or hook; keep files focused and under ~100 lines when possible.
- Use TypeScript everywhere; no any (prefer strict typed helpers as in src/types/global.ts).
- Follow the existing ESLint/Prettier configuration and the custom rule for color tokens.
- Avoid adding new dependencies without clear justification; prefer the approved stack above.