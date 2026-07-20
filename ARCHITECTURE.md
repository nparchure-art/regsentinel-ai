# RegSentinel AI — Integration Architecture

## Full System Diagram

```mermaid
flowchart TD
    subgraph INPUTS["🔌 Input Layer — Live Data Sources"]
        A1[ServiceNow CMDB\nICT Asset Registry]
        A2[DB AI Governance\nRegistry]
        A3[BaFin · EBA · ECB\nRegulatory Feed]
        A4[Azure Monitor\nSWIFT Alliance\nML Ops Webhooks]
    end

    subgraph ENGINE["🧠 RegSentinel AI Engine — Claude Sonnet 4.6"]
        B1["🔍 Flow 1\nEU AI Act Classifier\n— Risk tier classification\n— Controls checklist\n— Conformity assessment"]
        B2["🛡 Flow 2\nDORA ICT Risk Mapper\n— 5-pillar RAG assessment\n— Gap detection\n— Remediation plan"]
        B3["⚡ Flow 3\nDual-Framework Overlap Engine\n— Intersection detection\n— Unified remediation\n— Single owner assignment"]
        B4["📝 Incident Narrative\nGenerator\n— BaFin XML format\n— ECB JSON format\n— Auto-submission"]
    end

    subgraph OUTPUTS["📤 Output Layer — Write-back & Reporting"]
        C1[ServiceNow Tasks\nRemediation workflows]
        C2[AI Governance Portal\nCompliance status update]
        C3[Regulatory Reports\nBaFin · ECB · EBA]
        C4[Immutable Audit Trail\nAzure Blob Storage]
        C5[Teams · Jira Alerts\nCISO · ITAO notifications]
    end

    A1 -->|REST API| B2
    A1 -->|REST API| B3
    A2 -->|REST API| B1
    A3 -->|Webhook| B1
    A3 -->|Webhook| B2
    A4 -->|Webhook| B3
    A4 -->|Webhook| B4

    B1 -->|Write-back| C2
    B2 -->|Create task| C1
    B3 -->|Alert| C5
    B4 -->|Submit| C3
    B1 & B2 & B3 & B4 -->|Log| C4
```

## Data Flow for Overlap Detection (Key Differentiator)

```mermaid
sequenceDiagram
    participant SW as ServiceNow
    participant RS as RegSentinel AI
    participant CL as Claude Sonnet 4.6
    participant GP as AI Gov Portal
    participant BF as BaFin API

    SW->>RS: Incident webhook (P1/P2)
    RS->>SW: Fetch full asset metadata
    SW-->>RS: Asset: type, owner, vendor, history
    RS->>CL: "Is this asset in scope for DORA AND AI Act?"
    CL-->>RS: JSON: {doraInScope, aiActInScope, overlap, unifiedPlan}
    alt Overlap detected
        RS->>SW: Create unified remediation task
        RS->>GP: Update AI system compliance status
        RS->>BF: Draft incident narrative (if P1)
        RS->>RS: Write to immutable audit trail
    else No overlap
        RS->>SW: Create standard DORA task
    end
```

## Sovereign Architecture

```
┌─────────────────────────────────────────────┐
│           AZURE EU REGION                   │
│     Frankfurt (Primary) · Amsterdam (DR)    │
│                                             │
│  ┌──────────────┐  ┌───────────────────┐   │
│  │ RegSentinel  │  │  Claude Sonnet    │   │
│  │   Frontend   │  │  4.6 API (EU)     │   │
│  └──────┬───────┘  └────────┬──────────┘   │
│         │                   │              │
│  ┌──────▼───────────────────▼──────────┐   │
│  │        ServiceNow · CMDB · Logs     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ✅ No data egress outside EU               │
│  ✅ AI Act Article 10 compliant             │
│  ✅ DORA Art. 30 third-party controls       │
└─────────────────────────────────────────────┘
```

## Production Integration Checklist

- [ ] ServiceNow CMDB REST API credentials configured
- [ ] AI Governance Registry endpoint registered
- [ ] BaFin regulatory feed subscription active  
- [ ] Azure Monitor webhook → RegSentinel endpoint
- [ ] SWIFT Alliance alert feed connected
- [ ] Immutable audit log (Azure Blob, WORM policy) provisioned
- [ ] BaFin sandbox reporting credentials obtained
- [ ] CISO / ITAO Teams webhook configured
