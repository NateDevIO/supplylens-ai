# SupplyLens AI — Build SOP for Claude Code

## Project Overview

**SupplyLens AI** is a GenAI-powered supply chain disruption scenario planner. It's a portfolio piece for a WWT Associate Creative Technologist interview, targeting WWT's "Advanced Operational Intelligence" offering within their SC&E Digital team.

**Core concept:** A conversational UI where a supply chain manager describes a disruption scenario in natural language (e.g., "A hurricane just hit the coast of Florida. How does this impact our Q3 deliveries?"), and the app analyzes a mock dataset to identify affected shipments, visualize impacts on an interactive map, recommend mitigations, and estimate financial impact.

**This is NOT a generic chatbot.** It is a domain-specific, visual, decision-support tool. The AI responses should feel like a senior logistics analyst briefing you, not a general-purpose assistant.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Anthropic Claude API via Vercel AI SDK (`ai` + `@ai-sdk/anthropic`)
- **Map:** Leaflet with React Leaflet (`react-leaflet`)
- **Charts:** Recharts
- **Deployment:** Vercel
- **Package Manager:** npm

---

## Project Structure

```
supplylens-ai/
├── app/
│   ├── layout.tsx              # Root layout with metadata, fonts
│   ├── page.tsx                # Main app page
│   ├── globals.css             # Tailwind + custom styles
│   └── api/
│       └── chat/
│           └── route.ts        # Claude API streaming endpoint
├── components/
│   ├── ChatPanel.tsx           # Conversational input/output panel
│   ├── MessageBubble.tsx       # Individual message rendering
│   ├── MapView.tsx             # Leaflet map with disruption overlays
│   ├── ImpactDashboard.tsx     # KPI cards + charts sidebar
│   ├── ScenarioCard.tsx        # Preset scenario quick-select buttons
│   ├── ShipmentTable.tsx       # Affected shipments detail table
│   ├── ExportBriefing.tsx      # "Export Client Briefing" button/modal
│   └── AppShell.tsx            # Top-level layout (split panels)
├── lib/
│   ├── mock-data.ts            # All mock supply chain data
│   ├── analysis.ts             # Functions to filter/analyze shipments by scenario
│   ├── system-prompt.ts        # Claude system prompt for domain expertise
│   └── types.ts                # TypeScript interfaces
├── public/
│   └── logo.svg                # SupplyLens AI logo (simple, clean)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local                  # ANTHROPIC_API_KEY
```

---

## UI Layout

The app uses a **split-panel layout** (not a full-screen chat):

```
┌──────────────────────────────────────────────────────────────┐
│  SupplyLens AI                              [Export Briefing] │
├────────────────────────────┬─────────────────────────────────┤
│                            │                                 │
│     INTERACTIVE MAP        │      CHAT PANEL                 │
│     (Leaflet)              │                                 │
│                            │   [Scenario presets row]        │
│  - Global view of routes   │                                 │
│  - Color-coded shipments   │   AI: "Welcome. I'm monitoring │
│  - Disruption zone overlay │   347 active shipments across   │
│  - Click shipment = detail │   12 routes. What scenario      │
│                            │   would you like to analyze?"   │
│                            │                                 │
│                            │   User: "Hurricane approaching  │
│                            │   Gulf Coast..."                │
│                            │                                 │
│                            │   AI: [structured analysis]     │
│                            │                                 │
├────────────────────────────┤   [input box]                   │
│  IMPACT DASHBOARD          │                                 │
│  - Revenue at risk: $2.4M  │                                 │
│  - Shipments affected: 23  │                                 │
│  - Avg delay: 4.2 days     │                                 │
│  - Alt routes available: 3 │                                 │
└────────────────────────────┴─────────────────────────────────┘
```

**Responsive behavior:** On mobile, stack vertically: Map → Dashboard → Chat.

**Color palette:** Professional/enterprise. Dark navy sidebar, white/light gray main areas, accent colors for status (green=on-track, amber=at-risk, red=disrupted). Think "Bloomberg terminal meets modern SaaS."

---

## Mock Data Specification

Create realistic mock data in `lib/mock-data.ts`. This is critical — the data needs to feel real, not lorem-ipsum-ish.

### Shipments (40-50 records)

```typescript
interface Shipment {
  id: string;                    // e.g., "SHP-2024-0847"
  clientName: string;            // e.g., "Midwest Health Systems"
  origin: Location;
  destination: Location;
  currentLocation: Location;
  status: "in-transit" | "staging" | "testing" | "shipped" | "delayed";
  cargoType: string;             // e.g., "Network Infrastructure", "Server Rack", "Storage Array"
  cargoDescription: string;      // e.g., "48x Cisco Catalyst 9300 switches + cabling kits"
  value: number;                 // USD value
  weight: number;                // lbs
  routeType: "ground" | "air" | "ocean" | "multimodal";
  carrier: string;               // e.g., "XPO Logistics", "FedEx Freight"
  estimatedDelivery: string;     // ISO date
  integrationCenter: string;     // "St. Louis" | "Amsterdam" | "Singapore"
  waypoints: Location[];         // Route waypoints for map polylines
  priority: "standard" | "expedited" | "critical";
  projectId: string;             // e.g., "PRJ-MHS-2024-Q3"
}

interface Location {
  lat: number;
  lng: number;
  label: string;                 // City/facility name
}
```

### Key Data Requirements

- **Geographic spread:** Shipments across US domestic, transatlantic, and Asia-Pacific routes
- **Cluster some shipments through Florida/Gulf Coast** (for hurricane scenario)
- **Cluster some through Suez Canal region** (for geopolitical scenario)
- **Cluster some through West Coast ports** (for port congestion scenario)
- **Include WWT's actual integration center cities:** St. Louis MO, Amsterdam NL, Singapore
- **Client names:** Use realistic but fictional enterprise names (e.g., "Pacific Northwest Medical Group", "Great Lakes Financial Corp", "Southeastern University System")
- **Cargo types** should reflect WWT's business: data center hardware, networking equipment, security appliances, AV/collaboration systems
- **Values:** Range from $50K to $5M per shipment
- **Mix of statuses:** ~60% in-transit, 15% staging, 10% testing, 10% shipped, 5% delayed

### Disruption Scenarios (Pre-built)

```typescript
interface DisruptionScenario {
  id: string;
  name: string;
  description: string;
  affectedRegion: {
    center: Location;
    radiusKm: number;
  };
  affectedRouteSegments: string[];  // route identifiers
  severityMultiplier: number;       // 1.0-3.0 (affects delay/cost calcs)
  estimatedDelayDays: number;
  alternativeRoutes: AlternativeRoute[];
}
```

Pre-build these scenarios (the AI should also be able to handle freeform ones):

1. **"Hurricane approaching Gulf Coast"** — Affects FL, LA, TX ports and ground routes
2. **"Suez Canal blockage"** — Affects Europe-Asia ocean shipments
3. **"West Coast port congestion"** — Affects LA/Long Beach inbound containers
4. **"Severe winter storm — Midwest"** — Affects ground routes through Chicago, St. Louis hub
5. **"Semiconductor shortage escalation"** — Not geographic; affects specific cargo types

---

## API Route: `/api/chat/route.ts`

Use Vercel AI SDK with streaming.

### System Prompt (Critical — This Is What Makes It Not a Generic Chatbot)

Store in `lib/system-prompt.ts`:

```typescript
export const SYSTEM_PROMPT = `You are SupplyLens AI, an advanced supply chain intelligence analyst for an enterprise technology integration company similar to World Wide Technology (WWT).

You have access to a live dataset of active shipments, routes, and integration center operations. When the user describes a scenario or asks a question, you analyze the data and provide structured, actionable intelligence.

YOUR PERSONALITY:
- You are a senior logistics analyst, not a generic assistant
- Be direct, precise, and data-driven
- Use specific numbers from the dataset
- Frame everything in terms of business impact (revenue at risk, SLA violations, client satisfaction)
- Proactively suggest mitigations — don't just report problems
- Reference specific shipment IDs, client names, and routes

RESPONSE FORMAT:
When analyzing a disruption scenario, structure your response as:

1. **Situation Assessment** — 2-3 sentence summary of the threat
2. **Affected Shipments** — List the specific shipments impacted with IDs, clients, values
3. **Financial Impact** — Total revenue at risk, potential SLA penalties
4. **Recommended Actions** — Prioritized list of mitigations (reroute, expedite, notify client, etc.)
5. **Timeline** — Expected delay range and recovery timeline

When the user asks follow-up questions, maintain context of the active scenario.

IMPORTANT RULES:
- Always reference specific data points (shipment IDs, dollar amounts, dates)
- If the user's scenario doesn't match the data, still provide a plausible analysis but note which assumptions you're making
- Suggest when a client should be proactively notified vs. when to wait
- Consider cascading effects (if shipment X is delayed, does that affect project Y?)
- Think about integration center capacity — if shipments reroute to St. Louis, can it handle the volume?

CURRENT DATASET:
{datasetJSON}
`;
```

### Route Handler Logic

```typescript
// app/api/chat/route.ts
// 1. Receive messages from client
// 2. Inject current mock data state into system prompt
// 3. Stream response from Claude (claude-sonnet-4-20250514 for speed)
// 4. Parse structured data from response for map/dashboard updates
// 5. Return both the text stream AND structured data for UI updates
```

**Important implementation detail:** The AI response should include structured JSON blocks (fenced with a custom delimiter like `<<<IMPACT_DATA>>>...<<<END>>>`) that the frontend parses to update the map and dashboard. The text portion streams normally for the chat, while the structured data triggers map/chart re-renders.

Example AI response with embedded structured data:

```
## Situation Assessment
A Category 3 hurricane approaching the Gulf Coast will directly impact 23 of your 347 active shipments...

<<<IMPACT_DATA>>>
{
  "affectedShipmentIds": ["SHP-2024-0847", "SHP-2024-0923", ...],
  "revenueAtRisk": 2400000,
  "avgDelayDays": 4.2,
  "alternativeRoutes": 3,
  "disruptionZone": { "center": {"lat": 29.7, "lng": -89.1}, "radiusKm": 400 },
  "shipmentStatusUpdates": [
    { "id": "SHP-2024-0847", "newStatus": "delayed", "reason": "Route through New Orleans blocked" }
  ]
}
<<<END>>>

## Affected Shipments
...
```

---

## Component Specifications

### `AppShell.tsx`
- CSS Grid layout: `grid-cols-[1fr_420px]` on desktop, single column on mobile
- Left column: Map (top 65%) + Impact Dashboard (bottom 35%)
- Right column: Full-height Chat Panel
- Dark top nav bar with logo, app name, and Export button

### `MapView.tsx`
- Use React Leaflet with OpenStreetMap tiles (free, no API key needed)
- **Default view:** World view showing all active shipment routes as polylines
- **Shipment markers:** Small circles color-coded by status (green/amber/red)
- **Route polylines:** Thin lines connecting origin → waypoints → destination
- **Disruption overlay:** When a scenario is active, show a red semi-transparent circle over the affected region
- **Affected route highlighting:** Change affected route polylines from gray to pulsing red
- **Click interaction:** Clicking a shipment marker shows a popup with shipment details
- **Dynamic:** Map should update (zoom, highlight) when AI identifies affected shipments
- Use `dynamic(() => import(…), { ssr: false })` for Leaflet (it doesn't support SSR)

### `ChatPanel.tsx`
- Scrollable message history
- Auto-scroll to bottom on new messages
- Input bar fixed at bottom with send button
- **Scenario preset buttons** above the input: Quick-select chips for the 5 pre-built scenarios (e.g., "🌀 Gulf Hurricane", "🚢 Suez Blockage", "⛴️ Port Congestion", "❄️ Winter Storm", "🔧 Parts Shortage")
- Clicking a preset populates the input with a natural language query and auto-sends
- Show typing indicator while streaming
- Messages render markdown (use `react-markdown`)

### `MessageBubble.tsx`
- User messages: Right-aligned, blue background
- AI messages: Left-aligned, white/light gray background
- AI messages should render markdown with proper formatting (headers, bold, lists)
- Parse and hide the `<<<IMPACT_DATA>>>` blocks from visible text (extract for map/dashboard)

### `ImpactDashboard.tsx`
- **Default state** (no active scenario): Show overview KPIs
  - Total active shipments: 347
  - On-track: 312 (green)
  - At-risk: 28 (amber)
  - Delayed: 7 (red)
  - Total in-transit value: $47.2M
- **Active scenario state:** Animate transition to show:
  - Revenue at risk (large number, red)
  - Shipments affected (count)
  - Avg estimated delay
  - Alternative routes available
  - Mini bar chart: shipments affected by integration center
  - Mini donut chart: affected by cargo type

### `ShipmentTable.tsx`
- Hidden by default, slides up as a drawer/modal when user clicks "View affected shipments" or when AI references specific shipments
- Sortable columns: ID, Client, Cargo, Value, Status, ETA, Delay
- Color-coded status badges
- Click row to highlight on map

### `ExportBriefing.tsx`
- Button in top nav: "Export Client Briefing"
- Generates a simple HTML summary (or triggers a print-friendly view) containing:
  - Scenario summary
  - List of affected clients and shipments
  - Recommended actions
  - Timeline
- This is a key differentiator — it shows you think about the end-to-end workflow (analysis → action → communication)

---

## Interaction Flow

### Initial Load
1. Map renders with all shipments plotted globally
2. Dashboard shows default KPIs
3. Chat shows welcome message:

> "Welcome to SupplyLens AI. I'm currently monitoring **347 active shipments** across **12 routes** with a combined value of **$47.2M**. 7 shipments are currently flagged for delays.
>
> Describe a disruption scenario, or select one below to begin analysis."

4. Scenario preset buttons are visible

### Scenario Analysis Flow
1. User types or selects a scenario
2. Chat shows typing indicator, AI streams response
3. As AI response streams in:
   - `<<<IMPACT_DATA>>>` block is parsed
   - Map zooms to affected region, shows disruption overlay, highlights affected routes
   - Dashboard animates from default → scenario KPIs
4. User can ask follow-up questions (e.g., "What about the Midwest Health Systems shipment specifically?", "What if we reroute through Atlanta?", "Which clients should we call first?")
5. Each follow-up can include updated impact data that refreshes the map/dashboard

### Map ↔ Chat Interaction
- Clicking a shipment on the map inserts context into the chat: "Tell me about shipment SHP-2024-0847"
- AI responds with that shipment's specific analysis in context of the active scenario

---

## Design & Polish Details

### Typography
- **Headings:** Inter or Plus Jakarta Sans (clean, modern, enterprise)
- **Body/Data:** Inter
- **Monospace (shipment IDs):** JetBrains Mono or Fira Code

### Visual Style
- Clean, professional, dark top nav with light content areas
- NO playful/startup aesthetics — this should feel like a tool a Fortune 500 logistics team would use
- Subtle animations: KPI number counters, smooth map transitions, fade-in for new messages
- Status colors: `green-500` (on-track), `amber-500` (at-risk), `red-500` (disrupted), `blue-500` (rerouted)

### Loading States
- Map: Skeleton with subtle pulse
- Dashboard: Number counters animate from 0 to value
- Chat: Animated dots typing indicator

---

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
```

That's the only required env variable. No other API keys needed (OpenStreetMap tiles are free).

---

## Build & Deploy

```bash
npm run build        # Should complete with zero errors
npm run dev          # Local development on localhost:3000
vercel deploy        # Deploy to Vercel
```

---

## Definition of Done

The project is complete when:

- [ ] App loads with map showing all shipments globally
- [ ] Default dashboard KPIs display correctly
- [ ] Welcome message appears in chat
- [ ] All 5 scenario preset buttons work and trigger analysis
- [ ] Freeform natural language queries work (streaming)
- [ ] AI responses include specific shipment IDs, values, and client names from the dataset
- [ ] Map updates dynamically: zoom, disruption overlay, route highlighting
- [ ] Dashboard transitions from default to scenario-specific KPIs
- [ ] Clicking a map marker shows shipment details
- [ ] Follow-up questions maintain conversation context
- [ ] Export Briefing generates a summary view
- [ ] Mobile responsive (stacked layout)
- [ ] No TypeScript errors, no console errors
- [ ] Professional visual polish — looks like a real enterprise product

---

## What NOT to Build

- No auth/login (unnecessary for a demo)
- No real database (all mock data in memory)
- No user accounts or persistence
- No complex state management library (React state + context is fine)
- No testing framework (time constraint)
- Don't over-engineer the API layer — one route is enough

---

## Priority Order (If Time Is Limited)

1. **Map + mock data + basic layout** (get something visual fast)
2. **Chat with Claude integration** (core value prop)
3. **Impact data parsing + dashboard updates** (the "wow" factor)
4. **Scenario presets** (makes demo smooth)
5. **Export briefing** (nice to have)
6. **Click interactions between map and chat** (nice to have)
7. **Polish animations** (last)
