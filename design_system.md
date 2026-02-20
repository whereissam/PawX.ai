# PawX Soft UI Design System v1

> **Style**: Soft 3D / Neumorphism
> **Stack**: React 19 + Vite + Tailwind CSS v4 + shadcn/ui (CVA + Radix)
> **Last updated**: 2026-02-20

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Brand & Color Tokens](#2-brand--color-tokens)
3. [Shadow System (Core)](#3-shadow-system-core)
4. [Spacing & Radius Tokens](#4-spacing--radius-tokens)
5. [Typography](#5-typography)
6. [CSS Variables — `src/index.css`](#6-css-variables--srcindexcss)
7. [Tailwind v4 Theme Integration](#7-tailwind-v4-theme-integration)
8. [Utility Classes — `src/styles/pawx.css`](#8-utility-classes--srcstylespawxcss)
9. [Component Specs](#9-component-specs)
   - [Button](#button)
   - [Card](#card)
   - [Input](#input)
   - [Badge / Chip](#badge--chip)
   - [Tabs / Nav](#tabs--nav)
   - [Dialog / Sheet](#dialog--sheet)
10. [Layout Rules](#10-layout-rules)
11. [Icon Guidelines](#11-icon-guidelines)
12. [Motion & Transitions](#12-motion--transitions)
13. [Do's and Don'ts](#13-dos-and-donts)
14. [Migration Checklist](#14-migration-checklist)

---

## 1) Design Philosophy

PawX Soft UI uses **neumorphism** — elements appear extruded from or pressed into a single-color background. The effect comes from **dual-directional shadows** (light highlight + dark shadow) rather than borders or flat color blocks.

**Core Principles:**

- **One background, one world** — everything lives on `--bg`. No white sections, no gray panels.
- **Shadow over border** — separation comes from light/shadow, not `border`. Remove all `border-*` from components.
- **Raised vs Inset** — two states: raised (floating, clickable) and inset (recessed, input wells).
- **Warm palette** — golden amber background with same-hue shadows. Never use cool grays.
- **Breathe** — generous padding and spacing. Elements need air to cast their shadows.

---

## 2) Brand & Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#F6B53A` | Page background, the "canvas" |
| `--surface` | `#F8BE4A` | Raised element faces (cards, buttons) |
| `--surface-2` | `#F2AA2F` | Inset/recessed areas (inputs, wells) |
| `--accent` | `#E57D18` | CTA highlights, paw icon, active states |
| `--text` | `#2F3B4A` | Primary text (dark gray-blue, avoid pure black) |
| `--text-soft` | `rgba(47,59,74,0.72)` | Secondary/muted text |
| `--white` | `#FFFFFF` | Overlay text on accent backgrounds |

### Semantic Mapping to shadcn Variables

The existing shadcn variables are remapped:

| shadcn variable | PawX value | Notes |
|---|---|---|
| `--background` | `#F6B53A` | Was near-white, now golden |
| `--foreground` | `#2F3B4A` | Dark text on golden bg |
| `--card` | `#F8BE4A` | Surface color |
| `--card-foreground` | `#2F3B4A` | Same as foreground |
| `--primary` | `#E57D18` | Accent orange |
| `--primary-foreground` | `#FFFFFF` | White on accent |
| `--secondary` | `#F8BE4A` | Surface variant |
| `--secondary-foreground` | `#2F3B4A` | Text on surface |
| `--muted` | `#F2AA2F` | Inset/recessed color |
| `--muted-foreground` | `rgba(47,59,74,0.72)` | Soft text |
| `--accent` | `#E57D18` | Same as primary |
| `--accent-foreground` | `#FFFFFF` | White on accent |
| `--border` | `transparent` | **No borders** — use shadow |
| `--input` | `transparent` | Input borders removed |
| `--ring` | `rgba(229,125,24,0.22)` | Focus ring glow |
| `--destructive` | `#C0392B` | Error red |
| `--destructive-foreground` | `#FFFFFF` | White on error |

---

## 3) Shadow System (Core)

This is the heart of neumorphism. Every visual element uses one of these shadow presets.

### Shadow Color Tokens

```
--shadow-dark:   rgba(150, 83, 16, 0.32)    /* warm dark — bottom-right */
--shadow-light:  rgba(255, 232, 170, 0.92)   /* warm highlight — top-left */
```

### Shadow Presets

| Preset | CSS Value | Usage |
|---|---|---|
| `--shadow-raised` | `12px 12px 26px var(--shadow-dark), -12px -12px 26px var(--shadow-light)` | Default elevated state (cards, buttons) |
| `--shadow-raised-hover` | `16px 16px 34px rgba(150,83,16,0.36), -16px -16px 34px rgba(255,232,170,0.96)` | Hover — shadow deepens |
| `--shadow-raised-sm` | `6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light)` | Small elements (badges, chips) |
| `--shadow-inset` | `inset 10px 10px 20px rgba(150,83,16,0.28), inset -10px -10px 20px rgba(255,232,170,0.92)` | Pressed/input state |
| `--shadow-ring` | `0 0 0 4px rgba(229,125,24,0.22)` | Focus indicator |

### State Mapping

```
idle     → --shadow-raised
hover    → --shadow-raised-hover  (shadow deepens + translateY(-1px))
active   → --shadow-inset         (pressed into surface)
focus    → --shadow-raised, --shadow-ring  (combined)
disabled → --shadow-raised at 50% opacity
```

---

## 4) Spacing & Radius Tokens

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `8px` | Tight gaps (icon-to-text) |
| `--space-2` | `12px` | Chip padding, small gaps |
| `--space-3` | `16px` | Default element spacing |
| `--space-4` | `20px` | Card padding, section gaps |
| `--space-5` | `28px` | Large section separation |
| `--space-6` | `32px` | Container padding, page margins |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `14px` | Small elements (badges, chips) |
| `--radius-md` | `18px` | Default (buttons, inputs) |
| `--radius-lg` | `26px` | Cards, panels |
| `--radius-xl` | `34px` | Large containers, hero sections |

> **Note**: Neumorphism needs larger radii than flat UI. The current `0.5rem` base is too small.

---

## 5) Typography

| Style | Properties | Usage |
|---|---|---|
| Title | `font-weight: 900; letter-spacing: -0.02em` | Page headings, card titles |
| Subtitle | `font-weight: 700; letter-spacing: -0.01em` | Section headers |
| Body | `font-weight: 400; letter-spacing: 0` | Default text |
| Caption | `font-weight: 500; color: var(--text-soft)` | Muted labels, timestamps |
| Mono | `font-family: var(--font-mono); font-weight: 500` | Numbers, metrics |

**Font Stack**: Keep the existing `--font-sans`. No font change required.

---

## 6) CSS Variables — `src/index.css`

Replace the `:root` block. The `@theme inline` section stays for Tailwind v4 integration.

```css
:root {
  /* ── PawX Brand ── */
  --bg: #F6B53A;
  --surface: #F8BE4A;
  --surface-2: #F2AA2F;
  --accent: #E57D18;
  --text: #2F3B4A;
  --text-soft: rgba(47, 59, 74, 0.72);

  /* ── Shadow Colors ── */
  --shadow-dark: rgba(150, 83, 16, 0.32);
  --shadow-light: rgba(255, 232, 170, 0.92);

  /* ── Shadow Presets ── */
  --shadow-raised: 12px 12px 26px var(--shadow-dark),
                   -12px -12px 26px var(--shadow-light);
  --shadow-raised-hover: 16px 16px 34px rgba(150, 83, 16, 0.36),
                         -16px -16px 34px rgba(255, 232, 170, 0.96);
  --shadow-raised-sm: 6px 6px 14px var(--shadow-dark),
                      -6px -6px 14px var(--shadow-light);
  --shadow-inset: inset 10px 10px 20px rgba(150, 83, 16, 0.28),
                  inset -10px -10px 20px rgba(255, 232, 170, 0.92);
  --shadow-ring: 0 0 0 4px rgba(229, 125, 24, 0.22);

  /* ── Spacing ── */
  --space-1: 8px;
  --space-2: 12px;
  --space-3: 16px;
  --space-4: 20px;
  --space-5: 28px;
  --space-6: 32px;

  /* ── Radius ── */
  --radius-sm: 14px;
  --radius-md: 18px;
  --radius-lg: 26px;
  --radius-xl: 34px;

  /* ── shadcn compat (mapped to PawX) ── */
  --background: #F6B53A;
  --foreground: #2F3B4A;
  --card: #F8BE4A;
  --card-foreground: #2F3B4A;
  --popover: #F8BE4A;
  --popover-foreground: #2F3B4A;
  --primary: #E57D18;
  --primary-foreground: #FFFFFF;
  --secondary: #F8BE4A;
  --secondary-foreground: #2F3B4A;
  --muted: #F2AA2F;
  --muted-foreground: rgba(47, 59, 74, 0.72);
  --accent: #E57D18;
  --accent-foreground: #FFFFFF;
  --destructive: #C0392B;
  --destructive-foreground: #FFFFFF;
  --border: transparent;
  --input: transparent;
  --ring: rgba(229, 125, 24, 0.22);

  --radius: 18px;
}

html, body {
  background: var(--bg);
  color: var(--text);
}
```

---

## 7) Tailwind v4 Theme Integration

Update the `@theme inline` block in `src/index.css` to register custom tokens with Tailwind v4:

```css
@theme inline {
  /* ── Fonts (unchanged) ── */
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* ── Radius ── */
  --radius-sm: 14px;
  --radius-md: 18px;
  --radius-lg: 26px;
  --radius-xl: 34px;

  /* ── Colors ── */
  --color-bg: #F6B53A;
  --color-surface: #F8BE4A;
  --color-surface-2: #F2AA2F;
  --color-accent: #E57D18;
  --color-text: #2F3B4A;
  --color-text-soft: rgba(47, 59, 74, 0.72);

  /* ── shadcn compat colors ── */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* ── Shadows (Tailwind utility classes) ── */
  --shadow-raised: 12px 12px 26px rgba(150, 83, 16, 0.32),
                   -12px -12px 26px rgba(255, 232, 170, 0.92);
  --shadow-raised-hover: 16px 16px 34px rgba(150, 83, 16, 0.36),
                         -16px -16px 34px rgba(255, 232, 170, 0.96);
  --shadow-raised-sm: 6px 6px 14px rgba(150, 83, 16, 0.32),
                      -6px -6px 14px rgba(255, 232, 170, 0.92);
  --shadow-inset: inset 10px 10px 20px rgba(150, 83, 16, 0.28),
                  inset -10px -10px 20px rgba(255, 232, 170, 0.92);
}
```

### Tailwind Usage After Integration

```jsx
// Raised surface
<div className="bg-surface rounded-lg shadow-raised" />

// Hover effect
<div className="shadow-raised hover:shadow-raised-hover transition-shadow" />

// Inset / pressed
<div className="bg-surface-2 rounded-md shadow-inset" />

// Small raised (chips)
<span className="bg-surface rounded-sm shadow-raised-sm" />

// Custom colors
<p className="text-text" />
<p className="text-text-soft" />
<div className="bg-bg" />
```

---

## 8) Utility Classes — `src/styles/pawx.css`

Optional helper classes for repeated neumorphic patterns. Import after `index.css`.

```css
/* ── PawX Utility Classes ── */

/* Raised surface (card, button default) */
.px-raised {
  background: var(--surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-raised);
  border: none;
}

/* Raised hover effect */
.px-raised-hover:hover {
  box-shadow: var(--shadow-raised-hover);
  transform: translateY(-1px);
}

/* Inset surface (input well, pressed state) */
.px-inset {
  background: var(--surface-2);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-inset);
  border: none;
}

/* Focus ring */
.px-focus:focus-visible {
  outline: none;
  box-shadow: var(--shadow-raised), var(--shadow-ring);
}

/* Pressed state (buttons) */
.px-pressed:active {
  box-shadow: var(--shadow-inset);
  transform: translateY(0);
}

/* Standard transition for neumorphic elements */
.px-transition {
  transition: box-shadow 180ms ease,
              transform 180ms ease,
              background 180ms ease;
}

/* Pop hover (small lift) */
.px-pop:hover {
  transform: translateY(-1px);
}
.px-pop:active {
  transform: translateY(0);
}

/* Title typography */
.px-title {
  font-weight: 900;
  letter-spacing: -0.02em;
}

/* Muted text */
.px-muted {
  color: var(--text-soft);
}
```

---

## 9) Component Specs

All components live in `src/components/ui/`. They use the existing shadcn pattern: **CVA variants + `cn()` utility + `React.forwardRef`**.

### Button

**States**: raised → hover (deeper shadow + lift) → active (inset) → focus (raised + ring)

```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-bold tracking-tight",
    "border-0 cursor-pointer",
    "transition-all duration-200 ease-out",
    "bg-surface rounded-[var(--radius-md)]",
    "shadow-raised",
    "hover:shadow-raised-hover hover:-translate-y-px",
    "active:shadow-inset active:translate-y-0",
    "focus-visible:outline-none focus-visible:shadow-[var(--shadow-raised),var(--shadow-ring)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-surface text-text",
        primary: "bg-accent text-white shadow-raised hover:shadow-raised-hover",
        ghost: "bg-transparent shadow-none hover:bg-surface/50 hover:shadow-raised-sm",
        link: "bg-transparent shadow-none text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 px-3.5 py-1.5 text-xs",
        lg: "h-12 px-7 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Card

**Always raised**. No border. Generous padding.

```tsx
// src/components/ui/card.tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-surface rounded-[var(--radius-lg)] shadow-raised border-0",
        "transition-shadow duration-200",
        className
      )}
      {...props}
    />
  )
)

const CardHeader = /* ... */ cn("flex flex-col gap-1.5 p-5")
const CardContent = /* ... */ cn("px-5 pb-5")
const CardFooter = /* ... */ cn("flex items-center px-5 pb-5")
```

### Input

**Inset well**. No border. Focus adds ring.

```tsx
// src/components/ui/input.tsx
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full",
        "bg-surface-2 rounded-[var(--radius-md)]",
        "shadow-inset border-0",
        "px-4 py-2.5 text-sm text-text",
        "placeholder:text-text-soft",
        "transition-shadow duration-200",
        "focus-visible:outline-none",
        "focus-visible:shadow-[var(--shadow-inset),var(--shadow-ring)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
```

### Badge / Chip

**Small raised element**. Uses `shadow-raised-sm`.

```tsx
// src/components/ui/badge.tsx
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "rounded-[var(--radius-sm)] border-0",
    "px-3 py-1 text-xs font-semibold",
    "transition-all duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-surface shadow-raised-sm text-text",
        primary: "bg-accent shadow-raised-sm text-white",
        secondary: "bg-surface shadow-raised-sm text-text-soft",
        outline: "bg-transparent shadow-none text-text border border-text/10",
      },
    },
    defaultVariants: { variant: "default" },
  }
)
```

### Tabs / Nav

Tab list = inset well. Active tab = raised within the well.

```tsx
// Conceptual structure
<TabsList className="bg-surface-2 shadow-inset rounded-[var(--radius-lg)] p-1.5 flex gap-1">
  <TabsTrigger
    className={cn(
      "rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold",
      "text-text-soft transition-all duration-200",
      "data-[state=active]:bg-surface data-[state=active]:shadow-raised-sm",
      "data-[state=active]:text-text",
      "hover:text-text"
    )}
  />
</TabsList>
```

### Dialog / Sheet

Overlay content uses raised surface. Backdrop adds warm tint.

```tsx
// Dialog overlay
<DialogOverlay className="bg-[rgba(47,59,74,0.4)] backdrop-blur-sm" />

// Dialog content
<DialogContent
  className={cn(
    "bg-surface rounded-[var(--radius-xl)] shadow-raised border-0",
    "p-6"
  )}
/>
```

---

## 10) Layout Rules

These rules ensure the entire site feels cohesive with the neumorphic style.

### Page Structure

```
┌─────────────────────────────────────────────┐
│  bg (#F6B53A) — full viewport               │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  container (max-w-5xl, mx-auto, p-8)  │  │
│  │                                       │  │
│  │  ┌─────────┐  ┌─────────┐            │  │
│  │  │ Card    │  │ Card    │  ← raised  │  │
│  │  │ (raised)│  │ (raised)│            │  │
│  │  └─────────┘  └─────────┘            │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │ Input well          ← inset    │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Rules

1. **Background is always `--bg`**. Never use white/gray sections.
2. **Container**: `max-width: 1100px; margin: 0 auto; padding: 32px`
3. **Element spacing**: use fixed tokens (12/16/20/28px). Avoid arbitrary values.
4. **No borders**: use shadow + spacing to separate elements. Remove all `border` classes.
5. **No dividers**: use vertical spacing (`gap-5`, `gap-6`) instead of `<Separator />`.
6. **Minimum gap between raised elements**: `16px` — shadows need breathing room.
7. **Cards don't nest** — avoid putting a raised card inside another raised card.

---

## 11) Icon Guidelines

- Use **Lucide React** (already installed).
- Style: solid fill or `strokeWidth={2.5}` for bolder look.
- Colors: `text-text` for default, `text-accent` for active/CTA, `text-text-soft` for muted.
- Size: `size-4` (16px) inline, `size-5` (20px) in buttons, `size-6` (24px) standalone.
- Never use colored icon backgrounds — icons float directly on the surface.

---

## 12) Motion & Transitions

| Property | Duration | Easing | Usage |
|---|---|---|---|
| `box-shadow` | `180ms` | `ease-out` | Shadow state changes |
| `transform` | `180ms` | `ease-out` | Hover lift / press |
| `background` | `180ms` | `ease-out` | Color transitions |
| `opacity` | `150ms` | `ease-in-out` | Fade in/out |

**Standard transition class**: `transition-all duration-200 ease-out`

**Avoid**: `scale()` transforms (doesn't fit neumorphic style), spring animations, bounce effects.

---

## 13) Do's and Don'ts

### Do

- Use `shadow-raised` / `shadow-inset` for all visual hierarchy
- Keep generous padding (min 12px on small elements, 20px on cards)
- Use `--text` for body, `--text-soft` for secondary info
- Maintain warm amber palette throughout
- Use `rounded-[var(--radius-md)]` or higher (soft, pillowy corners)
- Test hover/active states — they're the key to making it feel tactile

### Don't

- Add `border` to any neumorphic element
- Use white or gray backgrounds for sections
- Mix flat design cards with neumorphic cards
- Use `drop-shadow` (it doesn't support inset)
- Put text directly on `--bg` without a surface — readability suffers
- Nest raised elements inside other raised elements
- Use small border-radius (`rounded-md` at 6px is too sharp)
- Use `--shadow-raised` on elements smaller than 32px — use `--shadow-raised-sm`

---

## 14) Migration Checklist

Ordered by visual impact. Steps 1-3 transform 80% of the UI.

### Phase 1: Foundation (highest impact)

- [ ] **Update `src/index.css`** — replace `:root` variables with PawX tokens (Section 6)
- [ ] **Update `@theme inline`** — register PawX colors/shadows/radius in Tailwind v4 (Section 7)
- [ ] **Set body background** — `html, body { background: var(--bg); color: var(--text); }`

### Phase 2: Core Components

- [ ] **Button** (`src/components/ui/button.tsx`) — replace CVA variants with neumorphic shadows
- [ ] **Card** (`src/components/ui/card.tsx`) — remove `border`, add `shadow-raised`
- [ ] **Input** (`src/components/ui/input.tsx`) — switch to `shadow-inset` + `bg-surface-2`
- [ ] **Badge** (`src/components/ui/badge.tsx`) — remove `border`, add `shadow-raised-sm`

### Phase 3: Layout & Chrome

- [ ] **Navbar** — raised surface with `shadow-raised`
- [ ] **Tabs** — inset well for tab list, raised for active tab
- [ ] **Dialog/Sheet** — warm overlay, raised content panel
- [ ] **Remove all `border-*` classes** across the app (global find-replace)
- [ ] **Remove `<Separator />`** usage, replace with spacing

### Phase 4: Polish

- [ ] **Tag/Chip components** — `shadow-raised-sm` + `rounded-[var(--radius-sm)]`
- [ ] **Scroll areas** — style scrollbar thumb as raised element (optional)
- [ ] **Focus states** — ensure all interactive elements use `shadow-ring`
- [ ] **Test responsive** — shadows may need smaller values on mobile (TBD)
- [ ] **Delete unused** `tailwind.config.js` hsl color mappings (now handled by `@theme inline`)

### Phase 5: Cleanup

- [ ] Remove `.dark` theme block (neumorphism doesn't support dark mode out of the box)
- [ ] Remove unused shadcn variables (sidebar-*, chart-*)
- [ ] Audit all `cn()` calls for leftover flat-design classes
- [ ] Verify no `border-input`, `border-border`, or `bg-background` references remain

---

## Appendix: Quick Reference Card

```
RAISED:   bg-surface  rounded-lg  shadow-raised  border-0
INSET:    bg-surface-2  rounded-md  shadow-inset  border-0
HOVER:    hover:shadow-raised-hover  hover:-translate-y-px
ACTIVE:   active:shadow-inset  active:translate-y-0
FOCUS:    focus-visible:shadow-[var(--shadow-raised),var(--shadow-ring)]
CHIP:     bg-surface  rounded-sm  shadow-raised-sm  border-0
TEXT:     text-text  (primary)  |  text-text-soft  (muted)
BG:       bg-bg  (page)  |  bg-surface  (element)  |  bg-surface-2  (well)
```
