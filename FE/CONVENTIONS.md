# Artium Web - Coding Conventions & Architecture

## 1. Project Identity

- **Framework:** Next.js (Pages Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (primary), SCSS (global/legacy), `shadcn/ui` (component library)
- **State Management:**
  - **Client State:** Redux
  - **Server State:** TanStack React Query (Preferred for new code) / SWR (Legacy)
- **Architecture:** Domain-Driven Design (DDD) inspired structure.

## 2. Folder & Module Structure Rules

The project follows a strict DDD-like separation between "Domains" (business logic), "Shared" (reusable core), and "Pages" (routing/glue).

### `src/@domains/*`
Contains all business logic, grouped by domain entity.
*   **Structure:** `src/@domains/[domainName]/`
*   **Contents:**
    *   `hooks/`: Data fetching and domain logic hooks (e.g., `useGetUserDetails`).
    *   `forms/`: Domain-specific forms.
    *   `modals/`: Domain-specific modals.
    *   `types/`: Domain-specific type definitions (if not in shared).
*   **Example:** `src/@domains/user/hooks/useGetUserDetails`

### `src/@shared/*`
Contains universally reusable code.
*   `@shared/components/ui/`: Atomic UI components (shadcn/ui based).
*   `@shared/components/layout/`: Layout wrappers.
*   `@shared/hooks/`: Generic hooks (not domain-specific).
*   `@shared/utils/`: Helper functions.
*   `@shared/apis/`: API definition layers.
*   `@shared/states/`: Global Jotai atoms.

### `src/pages/*`
Contains the actual implementation of page views.
*   **Purpose:** Keeps logic out of the root `pages/` directory.
*   **Example:** `src/pages/public/HomepageV2.tsx`

### `pages/*`
Next.js routing root.
*   **Rule:** These files should be **thin wrappers**.
*   **Responsibility:** server-side props fetching (SSR), session checks, and rendering a view component from `@src/pages`.
*   **Example:** `pages/index.tsx` imports `HomepageV2` from `@src/pages`.

## 3. Naming Conventions

*   **Files & Folders:**
    *   **React Components:** `PascalCase` (e.g., `PublicLayoutV2.tsx`, `HomepageV2.tsx`).
    *   **UI Components (shared/ui):** `kebab-case` (e.g., `button.tsx`, `alert-dialog.tsx`).
    *   **Hooks:** `camelCase` starting with `use` (e.g., `useGetUserDetails`).
    *   **Utilities/Functions:** `camelCase`.
*   **Domains:** `camelCase` (e.g., `user`, `artwork`, `chat`).
*   **Types/Interfaces:** `PascalCase`. Prefer naming that matches the entity (e.g., `UserType`).

## 4. Import Rules

Use the configured path aliases in `tsconfig.json`. **Do not use relative paths like `../../` for cross-module imports.**

*   `@domains/*` -> `src/@domains/*`
*   `@shared/*` -> `src/@shared/*`
*   `@src/pages/*` -> `src/pages/*`
*   `contexts/*` -> `shared/contexts/*`
*   `lib/*` -> `shared/lib/*`

## 5. React/Next Patterns

*   **Providers:** Global providers are located in `pages/_app.tsx` and wrapped in `AppProviders`.
*   **Layouts:** Pages should wrap their content in a Layout component (e.g., `PublicLayoutV2`) rather than defining layouts in `_app.tsx` logic.
*   **SSR:** Use `getServerSideProps` in `pages/` only for critical SEO data or session validation. Pass data as props to the view component.

## 6. Styling Conventions

*   **Primary:** **Tailwind CSS**. Use utility classes for layout, spacing, colors, and typography.
*   **Component Variants:** Use `class-variance-authority` (cva) for creating component variants (seen in `@shared/components/ui`).
*   **Class Merging:** ALWAYS use the `cn` utility (from `@shared/lib/utils`) when accepting custom `className` props to ensure Tailwind classes merge correctly.
*   **Legacy:** Avoid adding new global SCSS.

**Example (Button):**
```tsx
const buttonVariants = cva("...", { variants: { ... } })
export const Button = ({ className, variant, ...props }) => (
  <button className={cn(buttonVariants({ variant, className }))} {...props} />
)
```

## 7. Data Fetching & State

### Data Fetching (New Standard)
*   **Library:** **TanStack React Query** (via `@shared/utils/reactQuery` wrapper).
*   **Pattern:** Create a custom hook using `createUseQuery`.
*   **Files:** Located in `@domains/[domain]/hooks/[useHookName]`.
*   **Structure:** Export `queryKey`, `queryFn`, and the hook itself.

**Example Pattern:**
```ts
import { createUseQuery } from '@shared/utils/reactQuery'
import { setUserStateCallback } from '@shared/states/UserState'

export const queryKey = ['getUserDetails']
export const queryFn = (params) => userApis.getUserDetails(params)
// Sync to Jotai
export const setStateCallback = (get, set, res) => {
  setUserStateCallback(get, set, { user: res.data })
}

export default createUseQuery({ queryKey, queryFn, setStateCallback })
```

### Legacy Data Fetching
*   Many existing files use `useSWR` or `useSWRInfinite`.
*   **Convention:** Use the React Query pattern for *new* features. Refactor to React Query when significantly touching legacy SWR hooks.

### State Management
*   **Jotai:** Used for cross-component client state.
*   **Sync:** Fetched data is often synced to Jotai atoms via `setStateCallback` in the query hook.

## 8. TypeScript Standards

*   **Strict Mode:** Enabled.
*   **Type Definitions:**
    *   Shared types in `@shared/types`.
    *   Domain-specific types in `@domains/[domain]/types` (or collocated if private).
*   **Explicit Types:** explicit return types for functions are preferred but not strictly enforced if inference is obvious.
*   **`any`:** Avoid `any`. Use `unknown` or specific types. (Note: The repo has `no-explicit-any: off` in ESLint, but we should strive for type safety in new code).

## 9. "Do / Don't" Checklist

1.  **DO** put business logic in `src/@domains`.
2.  **DO** keep root `pages/` files empty of logic (just imports/SSR).
3.  **DO** use `createUseQuery` for new data fetching.
4.  **DO** use `cn()` to merge Tailwind classes.
5.  **DO** use absolute imports (`@shared`, `@domains`).
6.  **DO** define Jotai atoms in `@shared/states` or domain files.
7.  **DO** name UI components in `kebab-case` inside `@shared/components/ui`.
8.  **DON'T** use `useSWR` for new features (use React Query wrapper).
9.  **DON'T** put complex UI components in `src/pages`. Move them to `@domains` or `@shared/components`.
10. **DON'T** use relative paths deeper than one level (`../`).
11. **DON'T** mix direct `useQuery` usage without the wrapper (unless necessary for advanced cases).
12. **DON'T** create new global SCSS files.
13. **DON'T** ignore lint warnings.
14. **DO** verify your changes with `npm run type-check` (or `tsc --noemit`).
15. **DO** follow the existing pattern of `export const queryKey` in hooks for cache invalidation.
