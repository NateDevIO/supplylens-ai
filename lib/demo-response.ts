/**
 * Pre-baked demo response for the "Midwest Winter Storm" scenario.
 * Used when no API key is available or when the user clicks "Watch Demo".
 * This lets portfolio visitors see the app in action without needing a key.
 */

export const DEMO_SCENARIO_ID = "midwest-winter-storm";

export const DEMO_PROMPT = "A severe winter storm system is moving through the Midwest, bringing heavy snow, ice, and dangerously cold temperatures. Major highways including I-70 and I-44 are expected to be affected. How will this impact our active shipments and what steps should we take?";

export const DEMO_RESPONSE = `## Situation Assessment

A severe winter storm system targeting the Midwest corridor poses an immediate threat to our operations. With heavy snow and ice expected across I-70 and I-44 — two critical arteries for our St. Louis integration center — we have **7 active shipments** with **$3.9M in cargo** directly in the storm path, including critical deliveries scheduled within the next 72 hours.

## Affected Shipments

- **SHP-2024-0832** (Midwest Health Systems): $430K UPS systems, currently in Bloomington IL — **CRITICAL priority, due 10/27**
- **SHP-2024-0833** (Great Lakes Financial): $340K security appliances, currently in Chicago — due 10/28
- **SHP-2024-0834** (Rocky Mountain Energy): $780K server chassis, currently in Ames IA — due 10/30
- **SHP-2024-0835** (Commonwealth Retail): $650K collaboration systems, currently in Indianapolis — due 10/31
- **SHP-2024-0836** (Midwest Health Systems): $890K network refresh, staging in St. Louis — due 11/15
- **SHP-2024-0837** (Great Lakes Financial): $215K cooling units, staging in St. Louis — due 11/18
- **SHP-2024-0831** (Heartland Insurance): $560K spine switches, currently in Columbus OH — due 10/29

## Financial Impact

Total revenue at risk: **$3.865M**. SLA penalties could reach $190K for the 3 critical/expedited shipments. Midwest Health Systems has two affected shipments totaling $1.32M.

## Recommended Actions

**IMMEDIATE**: Expedite SHP-2024-0832 (UPS systems) — reroute south via Louisville to avoid storm center

**Proactively notify** Midwest Health Systems and Great Lakes Financial of potential delays

**Reroute eastbound** — SHP-2024-0833 and SHP-2024-0831 via Pittsburgh/Columbus southern routes

**Secure staging** — Move SHP-2024-0836 and SHP-2024-0837 from St. Louis to covered facilities

**Deploy alternative carriers** for time-sensitive deliveries post-storm

## Alternative Routes

- **SHP-2024-0832 (Bloomington IL to St. Louis)**: Reroute south via I-55 to Memphis, then north on I-55 to St. Louis, bypassing the I-70 ice zone. +1 day, ~15% cost increase, ground transport. **Viable — recommended.**
- **SHP-2024-0833 (Chicago to St. Louis)**: Divert to I-65 south through Indianapolis, then I-64 west to St. Louis. +1-2 days, ~12% cost increase. **Viable.**
- **SHP-2024-0834 (Ames IA to St. Louis)**: Hold in Ames until storm passes (est. 48-72 hrs), or reroute via I-35 south to Kansas City, then I-70 east. Holding is lower risk. +2-3 days. **Hold recommended.**
- **SHP-2024-0831 (Columbus OH)**: Route via I-71 south to Cincinnati, then I-64 west, avoiding I-70 entirely. +1 day, ~10% cost increase. **Viable.**

## Timeline

Expected delays: 2-4 days for ground shipments. Recovery operations can begin 24-48 hours post-storm passage. Critical shipments may require air freight to meet SLAs.

<<<IMPACT_DATA>>>
{
  "affectedShipmentIds": ["SHP-2024-0831", "SHP-2024-0832", "SHP-2024-0833", "SHP-2024-0834", "SHP-2024-0835", "SHP-2024-0836", "SHP-2024-0837"],
  "revenueAtRisk": 3865000,
  "avgDelayDays": 3,
  "alternativeRoutes": 2,
  "disruptionZone": { "center": {"lat": 38.627, "lng": -90.199, "label": "Midwest / St. Louis Corridor"}, "radiusKm": 500 },
  "shipmentStatusUpdates": [
    { "id": "SHP-2024-0832", "newStatus": "delayed", "reason": "Storm path — critical priority reroute initiated" },
    { "id": "SHP-2024-0833", "newStatus": "delayed", "reason": "I-70 ice advisory" },
    { "id": "SHP-2024-0834", "newStatus": "delayed", "reason": "Holding in Ames until storm passes" },
    { "id": "SHP-2024-0835", "newStatus": "delayed", "reason": "Indianapolis ice conditions" },
    { "id": "SHP-2024-0831", "newStatus": "delayed", "reason": "I-70 closure — rerouting via I-71/I-64" },
    { "id": "SHP-2024-0836", "newStatus": "staging", "reason": "Securing staging facility" },
    { "id": "SHP-2024-0837", "newStatus": "staging", "reason": "Securing staging facility" }
  ]
}
<<<END>>>`;
