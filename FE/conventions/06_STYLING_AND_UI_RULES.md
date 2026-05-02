# Styling & UI Rules

## 1. Framework: Tailwind CSS
-   Primary styling engine.
-   **Classes:** Used directly in `className`.
-   **Utilities:** `classnames` library is mandatory for conditional classes.

**Example:**
```tsx
<div className={classNames(
  'grid gap-4',
  viewMode === 'grid' && 'grid-cols-2',
  viewMode === 'list' && 'grid-cols-1'
)}>
```

## 2. UI Primitives (`@shared/components/ui`)
-   Do **not** build raw HTML buttons/inputs if possible.
-   Use the "Atomic" components from `src/@shared/components/ui`.
-   These components likely follow **Radix UI** patterns (Headless accessible primitives styled with Tailwind).

**Commonly Used:**
-   `Card`
-   `Button`
-   `Text`, `Heading`
-   `Checkbox`, `DropdownMenu`
-   `Tooltip`

## 3. Colors & Spacing
-   **Backgrounds:** `bg-[#FDFDFD]` (Off-white), `bg-[#F5F5F5]` (Light Gray for image containers).
-   **Text:** `text-[#191414]` (Black), `text-[#898788]` (Gray/Muted).
-   **Borders:** `border-black/10` (Subtle borders).
-   **Rounding:** `rounded-lg`, `rounded-full`, `rounded-3xl` (Large rounding for containers).

## 4. Responsive Design
-   **Mobile First:** Write base classes for mobile, then `lg:` or `md:` for desktop.
-   **Grid System:**
    -   List View: `grid-cols-1`
    -   Grid View: `grid-cols-2 lg:grid-cols-5`

## 5. Icons
-   Library: `@heroicons/react` (Outline and Solid variants).
-   Sizing: `size-4`, `size-5` (Tailwind sizing classes).
