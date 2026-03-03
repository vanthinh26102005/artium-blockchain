# Comment Style

This guide documents how we add comments for readability and sectioning.

## 1. Principles
- Comments explain structure, not obvious code.
- Prefer short, lowercase labels.
- Add blank lines between major sections.

## 2. Component Sections (logic)
Use the standard markers in components:

```ts
// -- state --
// -- derived --
// -- handlers --
// -- render --
```

## 3. JSX Section Comments (render)
Use JSX comments to label visual blocks:

```tsx
return (
  <section className="space-y-6">
    {/* header */}
    <Header />

    {/* content */}
    <div className="grid gap-4">
      {items.map((item) => (
        <Card key={item.id} item={item} />
      ))}
    </div>
  </section>
)
```

If a conditional branch needs a comment, wrap the branch with a fragment:

```tsx
{isOpen ? (
  <>
    {/* modal */}
    <Modal />
  </>
) : null}
```

## 4. Spacing
Insert a blank line:
- between major JSX blocks (header/content/footer)
- between large logical chunks inside the render

## 5. Avoid
- Redundant comments ("render button")
- Inline JSX block comments that break readability
