# SupplyLens AI

A GenAI-powered supply chain disruption scenario planner. Describe a disruption — hurricanes, port congestion, trade conflicts — and get real-time intelligence on affected shipments, financial impact, alternative routes, and recommended mitigations.

![SupplyLens AI](https://img.shields.io/badge/Next.js-16-black) ![Claude](https://img.shields.io/badge/Claude-Sonnet-blueviolet) ![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- **Conversational AI analysis** — Describe any supply chain disruption in natural language and get structured, actionable intelligence powered by Claude
- **Interactive map** — Leaflet-based global view with shipment markers, route polylines, disruption zone overlays, and animated affected routes
- **Real-time dashboard** — KPI cards with animated counters, bar/pie charts breaking down impact by integration center and cargo type
- **5 preset scenarios** — Gulf Coast Hurricane, Suez Canal Blockage, West Coast Port Congestion, Midwest Winter Storm, Semiconductor Shortage
- **45 realistic mock shipments** — ~$44M in-transit value across global routes with realistic clients, cargo types, and delivery timelines
- **Export briefing** — Generate a print-ready disruption report with affected shipments, client impact, and KPI summary
- **Demo mode** — Full walkthrough without an API key so anyone can see the app in action
- **Dark/light mode** — Persisted preference with system detection; map tiles swap between CARTO Voyager and Dark Matter
- **Responsive** — Desktop split-panel layout with mobile tab switcher

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| AI | Claude via Vercel AI SDK + @ai-sdk/anthropic |
| Mapping | Leaflet + React Leaflet (OpenStreetMap/CARTO tiles) |
| Charts | Recharts |
| Styling | Tailwind CSS 4 |
| Testing | Vitest + Testing Library |

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/) (optional — demo mode works without one)

### Install and run

```bash
npm install
```

Create a `.env.local` file:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run test suite (69 tests) |
| `npm run test:watch` | Run tests in watch mode |

## Architecture

```
app/
  page.tsx              # Main SPA entry — nav, layout, state management
  layout.tsx            # Root layout, fonts, metadata, OG image
  api/chat/route.ts     # POST endpoint — streams Claude responses (rate-limited)
  opengraph-image.tsx   # Dynamic OG image generation

components/
  AppShell.tsx          # CSS Grid layout (map+dashboard | chat)
  ChatPanel.tsx         # Conversational interface with scenario presets
  MapView.tsx           # Leaflet map with markers, routes, disruption zones
  ImpactDashboard.tsx   # KPI cards + Recharts visualizations
  ShipmentTable.tsx     # Sortable affected shipments detail view
  ExportBriefing.tsx    # Print-ready disruption report generator
  WelcomeOverlay.tsx    # Landing splash with Get Started / Watch Demo
  MessageBubble.tsx     # Chat message rendering with markdown
  ScenarioCard.tsx      # Preset scenario buttons
  ErrorBoundary.tsx     # Graceful error handling

lib/
  mock-data.ts          # 45 shipments + 5 scenario definitions
  system-prompt.ts      # Dynamic Claude system prompt with dataset injection
  parse-impact.ts       # Extracts structured JSON from AI responses
  analysis.ts           # KPI computation, haversine distance, formatting
  context.tsx           # React Context + useReducer for global state
  demo-response.ts      # Pre-baked demo response (no API key needed)
  types.ts              # TypeScript interfaces
  __tests__/            # 5 test suites
```

## How It Works

1. User describes a disruption scenario or selects a preset
2. The message is sent to `/api/chat` with the full shipment dataset embedded in the system prompt
3. Claude analyzes the scenario against the dataset and returns a structured response with an `<<<IMPACT_DATA>>>` JSON block
4. The frontend parses the impact data to dynamically update the map (zoom, disruption zone, route highlighting) and dashboard (scenario KPIs, charts)
5. Follow-up questions maintain full conversation context

## Deploy

Deploy to Vercel and set the `ANTHROPIC_API_KEY` environment variable:

```bash
vercel deploy
```

No database or additional API keys needed — map tiles use free OpenStreetMap/CARTO layers.

## License

MIT
