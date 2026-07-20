# RegSentinel AI 🛡

> **Agentic Compliance Co-Pilot for DORA & the EU AI Act**  
> Deutsche Bank Global Hackathon 2026 · Track: Risk & Compliance  
> Theme: *Powering the European Champion of the Future of AI*

---

## What is RegSentinel AI?

RegSentinel AI is an agentic compliance platform that solves the **dual-framework intersection problem** no RegTech tool addresses today:

A single AI system used in credit decisioning is simultaneously:
- A **DORA-critical ICT asset** (Art. 5–44, Digital Operational Resilience Act)
- A **high-risk AI Act system** (Art. 6, Annex III, EU Artificial Intelligence Act)

No single tool manages this intersection. RegSentinel does.

---

## Live Demo

Three agentic flows powered by **Claude Sonnet 4.6**:

| Flow | Capability | What it does |
|------|-----------|--------------|
| 🔍 Flow 1 | EU AI Act Classifier | Auto-classifies any AI system by risk tier (High / Limited / Minimal / Prohibited) with required controls |
| 🛡 Flow 2 | DORA ICT Risk Mapper | Maps ICT assets across all 5 DORA resilience pillars with RAG status and remediation actions |
| ⚡ Flow 3 | Dual-Framework Overlap Engine | Detects when one system is in scope for both DORA and the AI Act — generates unified remediation plan |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    INPUT LAYER                          │
│  ServiceNow CMDB · AI Registry · BaFin/EBA/ECB Feeds   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                 AGENTIC AI ENGINE                       │
│  DORA Risk Mapper · AI Act Classifier · Overlap Engine  │
│           Powered by Claude Sonnet 4.6                  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    OUTPUT LAYER                         │
│  Compliance Dashboard · ServiceNow Write-back           │
│  Regulatory Reports (XML/JSON) · Audit Trail            │
└─────────────────────────────────────────────────────────┘
```

**Sovereign architecture:** Azure EU Regions (Frankfurt/Amsterdam) · No data egress outside EU · AI Act Article 10 compliant

---

## Files

| File | Description |
|------|-------------|
| `RegSentinel_Prototype.jsx` | Static prototype — standalone demo, no external dependencies |
| `RegSentinel_Dynamic.jsx` | Full dynamic version with Mock API layer, CMDB integration, live webhook incident feed, and ServiceNow write-back |

---

## Running Locally

Both files are React components (`.jsx`). To run:

```bash
# Using Vite
npm create vite@latest regsentinel -- --template react
cd regsentinel
cp RegSentinel_Dynamic.jsx src/App.jsx
npm install
npm run dev
```

> **Note:** The Claude API is called client-side in this prototype. For production, proxy through a backend to protect your API key.

---

## Dynamic Integration Map

```
ServiceNow CMDB ──────────► Asset dropdown (Flow 1, 2, 3)
AI Governance Registry ───► AI system list (Flow 1)
BaFin / EBA / ECB API ───► Regulatory feed panel
Azure Monitor / SWIFT ───► Live webhook incident feed
                                    │
                                    ▼
                         ⚡ Auto-trigger Overlap Engine
                                    │
                                    ▼
                         ServiceNow Write-back
                         (remediation tasks, tickets)
```

### To connect real systems (replace 4 lines):
```js
// CMDB
const assets = await fetch('https://yourinstance.service-now.com/api/now/table/cmdb_ci');

// AI Registry
const aiSystems = await fetch('https://db-ai-registry.internal/api/systems');

// Regulatory feed
const feed = await fetch('https://www.bafin.de/api/regulatory-updates');

// Write-back
await fetch('https://yourinstance.service-now.com/api/now/table/task', {
  method: 'POST',
  body: JSON.stringify(result)
});
```

---

## Business Case

| Horizon | Timeline | Value |
|---------|----------|-------|
| Internal deployment | 0–12 months | ~€80M compliance cost avoided |
| European platform (license to EU banks) | 12–24 months | €25M+ licensing revenue |
| Regulator co-creation (BaFin, ECB, EBA) | 24–36 months | €200M+ TAM |

---

## Regulatory Coverage

**DORA** — Art. 5-10 (ICT Risk), Art. 17-23 (Incident Reporting), Art. 25-39 (Resilience Testing), Art. 28-44 (Third-Party Risk)

**EU AI Act** — Art. 6 (High-Risk Classification), Art. 10 (Data Governance), Art. 12 (Record-Keeping), Art. 13-14 (Transparency & Human Oversight)

---

## Team

Built at the **Deutsche Bank Global Hackathon 2026**  
Track: Risk & Compliance  
Theme: Powering the European Champion of the Future of AI

---

## Closing

> *Europe doesn't need to import AI compliance. It needs to build it.*  
> RegSentinel AI is Deutsche Bank's answer to that challenge.
