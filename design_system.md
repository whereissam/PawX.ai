# PawX Soft UI Design System v2 — Creamy Professional

> **Style**: Soft 3D / Neumorphism — Refined Cream
> **Stack**: React 19 + Vite + Tailwind CSS v4 + shadcn/ui (CVA + Radix)
> **Last updated**: 2026-02-22

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

PawX Soft UI v2 uses **neumorphism** with a **creamy professional palette** — elements appear extruded from or pressed into a warm-neutral background. The effect comes from **dual-directional shadows** (light highlight + dark shadow) with significantly reduced intensity for a refined, high-end feel.

**Core Principles:**

- **Creamy canvas** — everything lives on a soft off-white/beige (#F5F2ED). No pure white, no vivid colors for backgrounds.
- **Shadow over border** — separation comes from subtle light/shadow, not borders. Optional glass-edge borders (`1px solid rgba(255,255,255,0.4)`) add polish.
- **Raised vs Inset** — two states: raised (floating, clickable) and inset (recessed, input wells).
- **Dark slate accent** — primary actions use `#334155` (slate-700), with the original PawX orange (`#E57D18`) reserved only for logo and key highlights.
- **Breathe** — generous padding and spacing. Elements need air to cast their shadows.
- **Bold typography** — in this soft palette, headings use `font-bold` or `font-black` for structural clarity.

---

## 2) Brand & Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#F5F2ED` | Page background — warm off-white, like cashmere |
| `--surface` | `#F5F2ED` | Raised element faces (cards, buttons) — same as bg for neumorphism |
| `--surface-2` | `#EBE7E0` | Inset/recessed areas (inputs, wells) — slightly deeper cream |
| `--accent` | `#334155` | Primary CTA — deep blue-slate, professional and authoritative |
| `--text` | `#1E293B` | Primary text — dark blue-gray, never pure black |
| `--text-soft` | `#64748B` | Secondary/muted text — medium slate |
| `--white` | `#FFFFFF` | Overlay text on accent backgrounds |
| `--highlight` | `#E57D18` | Reserved for logo and critical highlights only |

### Semantic Mapping to shadcn Variables

| shadcn variable | PawX v2 value | Notes |
|---|---|---|
| `--background` | `#F5F2ED` | Warm cream background |
| `--foreground` | `#1E293B` | Dark slate text |
| `--card` | `#F5F2ED` | Same as background (neumorphic) |
| `--card-foreground` | `#1E293B` | Same as foreground |
| `--primary` | `#334155` | Deep slate — the new professional accent |
| `--primary-foreground` | `#FFFFFF` | White on slate |
| `--secondary` | `#EBE7E0` | Surface variant (cream) |
| `--secondary-foreground` | `#1E293B` | Text on secondary |
| `--muted` | `#EBE7E0` | Inset/recessed color |
| `--muted-foreground` | `#64748B` | Soft text |
| `--accent` | `#334155` | Same as primary |
| `--accent-foreground` | `#FFFFFF` | White on accent |
| `--border` | `rgba(255,255,255,0.4)` | Glass-edge border (optional, subtle) |
| `--input` | `rgba(255,255,255,0.4)` | Subtle input edge |
| `--ring` | `rgba(51,65,85,0.15)` | Focus ring — slate glow |
| `--destructive` | `#DC2626` | Error red |
| `--destructive-foreground` | `#FFFFFF` | White on error |

---

## 3) Shadow System (Core)

This is the heart of neumorphism. Shadows are **significantly reduced** from v1 for a refined, professional look.

### Shadow Color Tokens

```
--shadow-dark:   rgba(201, 193, 181, 0.4)   /* warm neutral — bottom-right */
--shadow-light:  rgba(255, 255, 255, 0.9)    /* clean highlight — top-left */
```

### Shadow Presets

| Preset | CSS Value | Usage |
|---|---|---|
| `--shadow-raised` | `8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light)` | Default elevated state (cards, buttons) |
| `--shadow-raised-hover` | `12px 12px 20px var(--shadow-dark), -12px -12px 20px var(--shadow-light)` | Hover — shadow deepens slightly |
| `--shadow-raised-sm` | `4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light)` | Small elements (badges, chips) |
| `--shadow-inset` | `inset 6px 6px 12px var(--shadow-dark), inset -6px -6px 12px var(--shadow-light)` | Pressed/input state |
| `--shadow-ring` | `0 0 0 3px rgba(51,65,85,0.15)` | Focus indicator — slate glow |

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

### Border Radius (Tightened from v1)

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `10px` | Small elements (badges, chips) |
| `--radius-md` | `12px` | Default (buttons, inputs) |
| `--radius-lg` | `20px` | Cards, panels |
| `--radius-xl` | `28px` | Large containers, hero sections |

> **Note**: Radii are reduced from v1 (14/18/26/34px → 10/12/20/28px) for a more refined, less "bubbly" feel.

---

## 5) Typography

| Style | Properties | Usage |
|---|---|---|
| Title | `font-weight: 800; letter-spacing: -0.02em` | Page headings, card titles |
| Subtitle | `font-weight: 700; letter-spacing: -0.01em` | Section headers |
| Body | `font-weight: 400; letter-spacing: 0` | Default text |
| Caption | `font-weight: 500; color: var(--text-soft)` | Muted labels, timestamps |
| Mono | `font-family: var(--font-mono); font-weight: 500` | Numbers, metrics |

**Bold headings are critical** in this soft palette. Without strong typographic weight, the UI appears blurry and lacks structure.

**Font Stack**: Keep the existing `--font-sans`. No font change required.

---

## 6) CSS Variables — `src/index.css`

```css
:root {
  /* ── PawX Brand — Creamy Professional v2 ── */
  --bg: #F5F2ED;
  --surface: #F5F2ED;
  --surface-2: #EBE7E0;

  /* ── Shadow Colors (neutral-warm) ── */
  --shadow-dark: rgba(201, 193, 181, 0.4);
  --shadow-light: rgba(255, 255, 255, 0.9);

  /* ── shadcn compat (mapped to PawX v2) ── */
  --background: #F5F2ED;
  --foreground: #1E293B;
  --card: #F5F2ED;
  --card-foreground: #1E293B;
  --popover: #F5F2ED;
  --popover-foreground: #1E293B;
  --primary: #334155;
  --primary-foreground: #FFFFFF;
  --secondary: #EBE7E0;
  --secondary-foreground: #1E293B;
  --muted: #EBE7E0;
  --muted-foreground: #64748B;
  --accent: #334155;
  --accent-foreground: #FFFFFF;
  --destructive: #DC2626;
  --destructive-foreground: #FFFFFF;
  --border: rgba(255, 255, 255, 0.4);
  --input: rgba(255, 255, 255, 0.4);
  --ring: rgba(51, 65, 85, 0.15);
  --radius: 12px;
}

html, body {
  background: var(--bg);
  color: var(--foreground);
}
```

---

## 7) Tailwind v4 Theme Integration

```css
@theme inline {
  /* ── Fonts (unchanged) ── */
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* ── Radius (tightened) ── */
  --radius-sm: 10px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;

  /* ── Colors ── */
  --color-bg: #F5F2ED;
  --color-surface: #F5F2ED;
  --color-surface-2: #EBE7E0;
  --color-accent: #334155;
  --color-text: #1E293B;
  --color-text-soft: #64748B;

  /* ── shadcn compat colors ── */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  /* ... (all shadcn mappings) ... */

  /* ── Shadows (refined, subtler) ── */
  --shadow-raised: 8px 8px 16px rgba(201, 193, 181, 0.4),
                   -8px -8px 16px rgba(255, 255, 255, 0.9);
  --shadow-raised-hover: 12px 12px 20px rgba(201, 193, 181, 0.4),
                         -12px -12px 20px rgba(255, 255, 255, 0.9);
  --shadow-raised-sm: 4px 4px 10px rgba(201, 193, 181, 0.4),
                      -4px -4px 10px rgba(255, 255, 255, 0.9);
  --shadow-inset: inset 6px 6px 12px rgba(201, 193, 181, 0.4),
                  inset -6px -6px 12px rgba(255, 255, 255, 0.9);
}
```

---

## 8) Utility Classes — `src/styles/pawx.css`

Optional helper classes for repeated neumorphic patterns.

```css
/* ── PawX Utility Classes v2 ── */

.px-raised {
  background: var(--surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-raised);
  border: 1px solid rgba(255, 255, 255, 0.4); /* glass edge */
}

.px-raised-hover:hover {
  box-shadow: var(--shadow-raised-hover);
  transform: translateY(-1px);
}

.px-inset {
  background: var(--surface-2);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-inset);
  border: none;
}

.px-focus:focus-visible {
  outline: none;
  box-shadow: var(--shadow-raised), var(--shadow-ring);
}

.px-pressed:active {
  box-shadow: var(--shadow-inset);
  transform: translateY(0);
}

.px-transition {
  transition: box-shadow 180ms ease,
              transform 180ms ease,
              background 180ms ease;
}

.px-glass-border {
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.px-title {
  font-weight: 800;
  letter-spacing: -0.02em;
}

.px-muted {
  color: var(--text-soft);
}
```

---

## 9) Component Specs

### Button

```tsx
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-bold tracking-tight",
    "border border-white/40 cursor-pointer",
    "transition-all duration-200 ease-out",
    "bg-surface rounded-[var(--radius-md)]",
    "shadow-raised",
    "hover:shadow-raised-hover hover:-translate-y-px",
    "active:shadow-neu-inset active:translate-y-0",
    "focus-visible:outline-none focus-visible:shadow-raised-focus",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-surface text-foreground",
        ghost: "bg-transparent shadow-none border-0 hover:bg-surface/50 hover:shadow-raised-sm",
        link: "bg-transparent shadow-none border-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 px-3.5 py-1.5 text-xs",
        lg: "h-12 px-7 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
```

### Card

```tsx
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-surface rounded-[var(--radius-lg)] shadow-raised",
      "border border-white/40",
      "transition-shadow duration-200",
      className
    )}
    {...props}
  />
))
```

### Input

```tsx
const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full",
      "bg-surface-2 rounded-[var(--radius-md)]",
      "shadow-neu-inset border-0",
      "px-4 py-2.5 text-sm text-foreground",
      "placeholder:text-muted-foreground",
      "transition-shadow duration-200",
      "focus-visible:outline-none focus-visible:shadow-inset-focus",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
))
```

### Badge / Chip

```tsx
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "rounded-[var(--radius-sm)] border border-white/30",
    "px-3 py-1 text-xs font-semibold",
    "transition-all duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary shadow-raised-sm text-primary-foreground",
        secondary: "bg-surface shadow-raised-sm text-foreground",
        outline: "bg-transparent shadow-none text-foreground border border-foreground/10",
      },
    },
    defaultVariants: { variant: "default" },
  }
)
```

### Tabs / Nav

```tsx
<TabsList className="bg-surface-2 shadow-neu-inset rounded-[var(--radius-lg)] p-1.5 flex gap-1">
  <TabsTrigger
    className={cn(
      "rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold",
      "text-muted-foreground transition-all duration-200",
      "data-[state=active]:bg-surface data-[state=active]:shadow-raised-sm",
      "data-[state=active]:text-foreground",
      "hover:text-foreground"
    )}
  />
</TabsList>
```

### Dialog / Sheet

```tsx
<DialogOverlay className="bg-[rgba(30,41,59,0.3)] backdrop-blur-sm" />
<DialogContent
  className={cn(
    "bg-surface rounded-[var(--radius-xl)] shadow-raised border border-white/40",
    "p-6"
  )}
/>
```

---

## 10) Layout Rules

### Page Structure

```
┌─────────────────────────────────────────────┐
│  bg (#F5F2ED) — full viewport               │
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

1. **Background is always `--bg` (#F5F2ED)**. No pure white or gray sections.
2. **Container**: `max-width: 1100px; margin: 0 auto; padding: 32px`
3. **Element spacing**: use fixed tokens (12/16/20/28px). Avoid arbitrary values.
4. **Glass-edge borders optional**: `border: 1px solid rgba(255,255,255,0.4)` adds subtle polish.
5. **No dividers**: use vertical spacing (`gap-5`, `gap-6`) instead of `<Separator />`.
6. **Minimum gap between raised elements**: `16px` — shadows need breathing room.
7. **Cards don't nest** — avoid putting a raised card inside another raised card.

---

## 11) Icon Guidelines

- Use **Lucide React** (already installed).
- Style: solid fill or `strokeWidth={2.5}` for bolder look.
- Colors: `text-foreground` for default, `text-primary` for active/CTA, `text-muted-foreground` for muted.
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

- Use `shadow-raised` / `shadow-neu-inset` for all visual hierarchy
- Keep generous padding (min 12px on small elements, 20px on cards)
- Use `text-foreground` for body, `text-muted-foreground` for secondary info
- Maintain warm-neutral cream palette throughout
- Use `font-bold` or `font-extrabold` on headings — essential for structure in soft palettes
- Add glass-edge borders (`border border-white/40`) for extra polish
- Reserve the original orange (#E57D18) strictly for logo and key highlights
- Test hover/active states — they're the key to making it feel tactile

### Don't

- Use the old amber/orange colors (#F6B53A, #F8BE4A) as backgrounds
- Use `--primary` (dark slate) for large background areas — it's for buttons and accents only
- Put text directly on `--bg` without sufficient contrast
- Mix flat design cards with neumorphic cards
- Use `drop-shadow` (it doesn't support inset)
- Nest raised elements inside other raised elements
- Use small border-radius (`rounded-md` at 6px is too sharp for neumorphism)
- Use large, heavy shadows — keep them subtle and refined

---

## 14) Migration Checklist (v1 → v2)

### Phase 1: Foundation

- [x] **Update `src/index.css`** — replace amber tokens with cream palette
- [x] **Update `@theme inline`** — new shadow/radius/color values
- [x] **Update `design_system.md`** — document v2 decisions

### Phase 2: Color Audit

- [ ] Search for any hardcoded `#F6B53A`, `#F8BE4A`, `#F2AA2F`, `#E57D18` and replace
- [ ] Update shadow colors from `rgba(150, 83, 16, ...)` to `rgba(201, 193, 181, ...)`
- [ ] Update `--ring` from orange to slate glow
- [ ] Verify `--border` and `--input` use glass-edge values

### Phase 3: Component Updates

- [ ] **Button** — update to use new slate primary
- [ ] **Card** — add optional glass-edge border
- [ ] **Input** — verify inset shadows use new tokens
- [ ] **Badge** — update primary variant to slate
- [ ] **Tabs** — verify inset well uses new shadow tokens

### Phase 4: Polish

- [ ] Verify all headings use `font-bold` or heavier
- [ ] Test responsive — shadows scale well on mobile
- [ ] Audit all `cn()` calls for leftover v1 classes

---

## Appendix: Quick Reference Card

```
RAISED:   bg-surface  rounded-lg  shadow-raised  border border-white/40
INSET:    bg-surface-2  rounded-md  shadow-neu-inset  border-0
HOVER:    hover:shadow-raised-hover  hover:-translate-y-px
ACTIVE:   active:shadow-neu-inset  active:translate-y-0
FOCUS:    focus-visible:shadow-raised-focus
CHIP:     bg-surface  rounded-sm  shadow-raised-sm  border border-white/30
TEXT:     text-foreground  (primary)  |  text-muted-foreground  (muted)
BG:       bg-bg  (page)  |  bg-surface  (element)  |  bg-surface-2  (well)
ACCENT:   bg-primary text-primary-foreground  (slate buttons)
```

## Appendix: v1 vs v2 Comparison

| Aspect | v1 (Amber) | v2 (Creamy Professional) |
|---|---|---|
| Background | `#F6B53A` (vivid gold) | `#F5F2ED` (warm cream) |
| Primary | `#E57D18` (orange) | `#334155` (dark slate) |
| Text | `#2F3B4A` | `#1E293B` (deeper) |
| Muted text | `rgba(47,59,74,0.72)` | `#64748B` (clearer) |
| Shadow dark | `rgba(150,83,16,0.32)` | `rgba(201,193,181,0.4)` |
| Shadow light | `rgba(255,232,170,0.92)` | `rgba(255,255,255,0.9)` |
| Raised shadow | `12px 12px 26px` | `8px 8px 16px` (tighter) |
| Radius base | `18px` | `12px` (more refined) |
| Border | `transparent` | `rgba(255,255,255,0.4)` (glass edge) |
| Feel | Playful, toy-like | Professional, high-end |
