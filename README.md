# PawX.ai - Crypto KOL Marketing Tool

AI-powered KOL (Key Opinion Leader) marketing tool for crypto & web3 marketers. Discover, analyze, and engage with Twitter KOLs across different ecosystems.

## Features

- **KOL Directory** - Browse 30+ crypto KOLs with multi-dimensional filtering (language, ecosystem, user type)
- **KOL Detail Drawer** - View detailed profiles, stats, and recent tweets
- **AI Interaction** - Auto-reply to KOL tweets with AI-generated responses matching your writing style
- **Style Analysis** - Analyze your Twitter handle to generate a personalized reply style profile
- **BD Outreach** - Create and manage cold outreach campaigns with template variables
- **Campaign Management** - Track outreach progress with draft/sending/completed statuses
- **Dark/Light Theme** - Full theme support across all pages
- **Responsive Design** - Works on mobile, tablet, and desktop

## Tech Stack

- **React 19** + **TypeScript** - UI with type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - Type-safe file-based routing
- **TailwindCSS v4** - Utility-first styling
- **shadcn/ui** - Accessible component library (Badge, Card, Avatar, Sheet, Dialog, Tabs, etc.)
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 20.19.0+ or Bun 1.0+

### Installation

```bash
git clone <repository-url>
cd React-Vite-Tanstack-Starter-Template
bun install
```

### Development

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
bun run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── kol/                   # KOL directory components
│   │   ├── kol-card.tsx       # KOL profile card
│   │   ├── kol-grid.tsx       # Responsive card grid
│   │   ├── kol-filter-bar.tsx # Multi-select filter chips
│   │   ├── kol-detail-drawer.tsx # Detail drawer/sheet
│   │   └── category-summary.tsx  # AI summary panel
│   ├── interact/              # Interaction page components
│   │   ├── kol-selector.tsx   # Selected KOLs sidebar
│   │   ├── style-analyzer.tsx # Style analysis input
│   │   ├── interaction-feed.tsx # Tweet + reply feed
│   │   └── reply-preview.tsx  # Reply preview card
│   ├── outreach/              # Outreach page components
│   │   ├── outreach-form.tsx  # Template editor
│   │   ├── target-search.tsx  # Target filter/search
│   │   └── campaign-list.tsx  # Campaign management
│   ├── logo.tsx               # PawX.ai paw mascot logo
│   ├── tag-badge.tsx          # Reusable tag badge
│   ├── mobile-nav.tsx         # Mobile navigation
│   ├── theme-provider.tsx     # Theme context
│   └── theme-toggle.tsx       # Dark/light toggle
├── data/
│   ├── kols.ts                # Mock KOL data (32 entries)
│   ├── tags.ts                # Tag constants
│   └── tweets.ts              # Mock tweets & summaries
├── hooks/
│   └── use-kol-filter.ts      # Filter state management
├── types/
│   └── index.ts               # TypeScript interfaces
├── routes/
│   ├── __root.tsx             # Root layout with PawX.ai nav
│   ├── index.tsx              # KOL Directory page
│   ├── interact.tsx           # KOL Interaction page
│   └── outreach.tsx           # BD Outreach page
├── lib/
│   └── utils.ts               # Utility functions
└── main.tsx                   # App entry point
```

## Pages

### KOL Directory (`/`)
Browse and filter KOLs by language, ecosystem, and user type. Click cards for detailed profiles. Select KOLs for interaction or outreach.

### Interact (`/interact`)
Manage auto-replies to selected KOLs. Analyze your writing style and view the interaction feed with AI-generated replies.

### Outreach (`/outreach`)
Create BD outreach campaigns with customizable message templates and variable interpolation. Track campaign progress.

## License

MIT License
