import { useState, useEffect, useRef } from "react";

// ── DESIGN TOKENS — Light DB Blue Theme ──────────────────────────────────────
const C = {
  bg:       "#EEF4FB",   // page background: cool blue-grey wash
  bgCard:   "#FFFFFF",   // card surface: clean white
  bgMid:    "#DAE8F5",   // subtle inner panels: muted blue
  navy:     "#003E7E",   // DB primary navy
  navyLight:"#0A4F9E",   // hover navy
  gold:     "#B07D1F",   // DB gold — darkened for light bg contrast
  goldLight:"#C8922A",   // gold accent
  teal:     "#006B7A",   // teal — darkened for light bg
  tealLight:"#00869A",
  green:    "#1A6B3C",   // green — darkened for light bg
  red:      "#B91C1C",   // red — darkened for light bg
  amber:    "#B45309",   // amber — darkened for light bg
  purple:   "#6D28D9",
  white:    "#FFFFFF",
  offWhite: "#F0F6FF",
  muted:    "#64748B",
  border:   "#BFCFE3",   // light blue-grey border
  text:     "#1E3A5F",   // dark navy text — readable on white
};

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const APPLICATIONS = {
  "APP-2841": {
    id: "APP-2841", name: "DB Credit Intelligence Platform",
    owner: "Retail Credit Risk", bu: "Private & Commercial Bank",
    classification: "HIGH_RISK_AI", criticality: "CRITICAL",
    functional: {
      description: "An AI-driven platform that automates credit scoring, loan eligibility decisions, and limit assignments for retail and SME customers across the EU. Processes approximately 2.4 million decisions per month.",
      capabilities: ["Automated credit scoring (ML model v3.2)", "Real-time loan eligibility assessment", "Dynamic credit limit assignment", "Adverse action reasoning generation", "Regulatory reporting (CRD V, EBA GL/2020/06)"],
      aiComponents: ["XGBoost scoring model", "SHAP explainability layer", "Bias monitoring module", "Human override workflow"],
    },
    tech: {
      languages: ["Python 3.11", "Java 17", "TypeScript"],
      frameworks: ["FastAPI", "Spring Boot", "React 18"],
      databases: ["PostgreSQL 15", "Redis 7", "Elasticsearch 8"],
      aiStack: ["scikit-learn 1.3", "XGBoost 1.7", "SHAP 0.42", "MLflow 2.8"],
      messaging: ["Apache Kafka 3.5", "IBM MQ 9.3"],
    },
    infra: {
      hosting: "Azure EU (Frankfurt / Amsterdam — dual region active-active)",
      dataResidency: "EU only — no cross-border data transfer",
      availability: "99.95% SLA (Tier 1 critical system)",
      rto: "4 hours", rpo: "15 minutes",
      certifications: ["ISO 27001", "SOC 2 Type II", "PCI-DSS L1"],
    },
    waltz: {
      upstream: [
        { id:"CUS-CORE", name:"Core Customer Data Hub", type:"Database", protocol:"JDBC", data:"Customer KYC, identity, segment", criticality:"CRITICAL" },
        { id:"EXT-BUREAU", name:"Credit Bureau Connector (Schufa / Experian)", type:"API Gateway", protocol:"REST/TLS", data:"External credit scores, payment history", criticality:"CRITICAL" },
        { id:"TXN-HIST", name:"Transaction History Service", type:"Microservice", protocol:"Kafka", data:"12-month transaction patterns", criticality:"HIGH" },
        { id:"PROD-CAT", name:"Product Catalogue Service", type:"Microservice", protocol:"REST", data:"Loan product parameters, interest rates", criticality:"MEDIUM" },
      ],
      downstream: [
        { id:"LOAN-OPS", name:"Loan Origination System", type:"Core Banking", protocol:"IBM MQ", data:"Credit decisions, approved limits", criticality:"CRITICAL" },
        { id:"REG-RPT", name:"Regulatory Reporting Engine", type:"Service", protocol:"REST", data:"EBA-format decision audit logs", criticality:"HIGH" },
        { id:"CUST-NOTIF", name:"Customer Notification Service", type:"Microservice", protocol:"Kafka", data:"Adverse action letters, approval notices", criticality:"MEDIUM" },
        { id:"RISK-DASH", name:"Risk Analytics Dashboard", type:"BI Platform", protocol:"JDBC", data:"Portfolio risk metrics, model performance", criticality:"MEDIUM" },
      ],
    },
    incidents: [
      { id:"INC0084291", severity:"P1", status:"Resolved", date:"2026-06-28", title:"Credit scoring model drift — accuracy below 0.82 threshold", category:"AI Model", doraFlag:true, aiActFlag:true, duration:"4h 22m", affectedUsers:14200 },
      { id:"INC0081034", severity:"P2", status:"Resolved", date:"2026-05-14", title:"SHAP explainability service timeout — adverse action letters delayed", category:"Explainability", doraFlag:true, aiActFlag:true, duration:"1h 48m", affectedUsers:3400 },
      { id:"INC0079512", severity:"P2", status:"Resolved", date:"2026-04-03", title:"Bias monitoring alert — demographic parity breach on age cohort 65+", category:"Bias / Fairness", doraFlag:false, aiActFlag:true, duration:"6h 10m", affectedUsers:890 },
      { id:"INC0076830", severity:"P3", status:"Resolved", date:"2026-03-19", title:"Credit bureau connector (Schufa) connectivity loss — fallback model activated", category:"Third-Party", doraFlag:true, aiActFlag:false, duration:"47m", affectedUsers:0 },
      { id:"INC0074102", severity:"P1", status:"Resolved", date:"2026-02-07", title:"Database failover triggered — 8-minute decision processing outage", category:"Infrastructure", doraFlag:true, aiActFlag:false, duration:"8m", affectedUsers:0 },
    ],
  },
  "APP-1193": {
    id: "APP-1193", name: "AML Transaction Surveillance Engine",
    owner: "Financial Crime Compliance", bu: "Corporate Bank",
    classification: "HIGH_RISK_AI", criticality: "CRITICAL",
    functional: {
      description: "Real-time AI-powered anti-money laundering surveillance that screens all SWIFT, SEPA, and domestic payments for suspicious patterns. Generates STRs (Suspicious Transaction Reports) for regulatory submission.",
      capabilities: ["Real-time transaction screening (≤200ms)", "Pattern recognition across 47 typologies", "Automated STR drafting", "Network graph analysis for entity relationships", "Sanctions list screening (OFAC, EU, UN)"],
      aiComponents: ["Graph Neural Network (GNN) for network analysis", "Anomaly detection ensemble", "NLP-based STR narrative generator", "Human-in-the-loop review queue"],
    },
    tech: {
      languages: ["Python 3.11", "Scala 2.13", "Go 1.21"],
      frameworks: ["Apache Flink", "FastAPI", "gRPC"],
      databases: ["Apache Cassandra", "Neo4j 5.x", "ClickHouse"],
      aiStack: ["PyTorch 2.1", "DGL (Deep Graph Library)", "Hugging Face Transformers"],
      messaging: ["Apache Kafka 3.5", "SWIFT Alliance Gateway"],
    },
    infra: {
      hosting: "Azure EU (Frankfurt — primary, Warsaw — DR)",
      dataResidency: "EU only — data classified SECRET/FIN",
      availability: "99.99% SLA (Tier 0 critical system)",
      rto: "30 minutes", rpo: "Zero (synchronous replication)",
      certifications: ["ISO 27001", "SOC 2 Type II", "SWIFT CSCF v2025"],
    },
    waltz: {
      upstream: [
        { id:"SWIFT-GW", name:"SWIFT Alliance Gateway", type:"Network Gateway", protocol:"SWIFT MT/MX", data:"Cross-border payment messages", criticality:"CRITICAL" },
        { id:"SEPA-PROC", name:"SEPA Payment Processor", type:"Core Banking", protocol:"ISO 20022", data:"SEPA credit transfers, direct debits", criticality:"CRITICAL" },
        { id:"SANC-LIST", name:"Sanctions List Manager", type:"Service", protocol:"REST", data:"OFAC, EU, UN consolidated sanctions", criticality:"CRITICAL" },
        { id:"KYC-STORE", name:"KYC / CDD Data Store", type:"Database", protocol:"JDBC", data:"Customer due diligence profiles", criticality:"HIGH" },
      ],
      downstream: [
        { id:"FIU-RPT", name:"FIU Reporting Portal (BaFin)", type:"Regulatory", protocol:"HTTPS/XML", data:"Suspicious Transaction Reports", criticality:"CRITICAL" },
        { id:"CASE-MGT", name:"Case Management System", type:"Workflow", protocol:"REST", data:"Alert investigations, SAR workflow", criticality:"HIGH" },
        { id:"RISK-SCORE", name:"Enterprise Risk Score Bus", type:"Message Bus", protocol:"Kafka", data:"Entity risk scores, network flags", criticality:"HIGH" },
        { id:"AUDIT-LOG", name:"Immutable Audit Trail (Azure Blob)", type:"Storage", protocol:"Azure SDK", data:"All screening decisions, model outputs", criticality:"CRITICAL" },
      ],
    },
    incidents: [
      { id:"INC0083710", severity:"P1", status:"Resolved", date:"2026-06-15", title:"GNN model inference failure — 23-minute gap in transaction screening", category:"AI Model", doraFlag:true, aiActFlag:true, duration:"23m", affectedUsers:0 },
      { id:"INC0080221", severity:"P2", status:"Open", date:"2026-05-02", title:"False positive rate spike to 34% — analyst queue overflow", category:"AI Model", doraFlag:false, aiActFlag:true, duration:"Ongoing", affectedUsers:47 },
      { id:"INC0077934", severity:"P2", status:"Resolved", date:"2026-03-28", title:"Sanctions list sync failure — 6-hour stale data window", category:"Third-Party", doraFlag:true, aiActFlag:false, duration:"6h 02m", affectedUsers:0 },
      { id:"INC0075503", severity:"P3", status:"Resolved", date:"2026-02-18", title:"BaFin STR submission portal timeout — delayed regulatory filing", category:"Regulatory Reporting", doraFlag:true, aiActFlag:false, duration:"2h 15m", affectedUsers:0 },
    ],
  },
  "APP-3307": {
    id: "APP-3307", name: "Wealth Robo-Adviser (DB Anlageassistent)",
    owner: "Wealth Management", bu: "Private Bank",
    classification: "HIGH_RISK_AI", criticality: "IMPORTANT",
    functional: {
      description: "AI-powered investment advisory platform for Private Banking clients, providing personalised portfolio recommendations, rebalancing signals, and ESG-aligned investment strategies. Manages approximately €4.2B AUM.",
      capabilities: ["Personalised portfolio construction (MiFID II compliant)", "Dynamic rebalancing recommendations", "ESG scoring and impact reporting", "Tax-loss harvesting optimisation", "Client risk profile assessment"],
      aiComponents: ["Mean-variance optimisation engine", "Reinforcement learning rebalancing agent", "NLP suitability assessment", "ESG data aggregation model"],
    },
    tech: {
      languages: ["Python 3.11", "TypeScript", "R 4.3"],
      frameworks: ["FastAPI", "Next.js 14", "Plumber (R)"],
      databases: ["PostgreSQL 15", "InfluxDB", "MongoDB 7"],
      aiStack: ["PyPortfolioOpt", "Stable Baselines 3", "FinBERT"],
      messaging: ["Apache Kafka", "Azure Service Bus"],
    },
    infra: {
      hosting: "Azure EU (Frankfurt — primary)",
      dataResidency: "EU only — MiFID II data retention 5 years",
      availability: "99.9% SLA",
      rto: "8 hours", rpo: "1 hour",
      certifications: ["ISO 27001", "MiFID II Art. 25 compliant"],
    },
    waltz: {
      upstream: [
        { id:"MKT-DATA", name:"Bloomberg Market Data Feed", type:"External Feed", protocol:"Bloomberg API", data:"Real-time prices, fundamentals, ESG scores", criticality:"CRITICAL" },
        { id:"PORT-SVC", name:"Portfolio Management Service", type:"Core Banking", protocol:"FIX 4.4", data:"Current holdings, cash positions", criticality:"CRITICAL" },
        { id:"CLT-PROF", name:"Client Profile & Suitability Store", type:"Database", protocol:"JDBC", data:"Risk tolerance, investment goals, KYC", criticality:"HIGH" },
        { id:"ESG-AGG", name:"ESG Data Aggregator (MSCI/Sustainalytics)", type:"API Gateway", protocol:"REST", data:"ESG ratings, controversy scores", criticality:"MEDIUM" },
      ],
      downstream: [
        { id:"OMS", name:"Order Management System", type:"Core Banking", protocol:"FIX 4.4", data:"Trade orders, rebalancing instructions", criticality:"CRITICAL" },
        { id:"CLIENT-APP", name:"DB Wealth Mobile / Web App", type:"Frontend", protocol:"REST/WebSocket", data:"Recommendations, performance reports", criticality:"HIGH" },
        { id:"COMP-CHK", name:"Compliance Pre-Trade Checker", type:"Service", protocol:"REST", data:"MiFID suitability validation", criticality:"CRITICAL" },
        { id:"PERF-RPT", name:"Performance Reporting Engine", type:"Service", protocol:"REST", data:"Portfolio returns, benchmark comparison", criticality:"MEDIUM" },
      ],
    },
    incidents: [
      { id:"INC0082944", severity:"P2", status:"Resolved", date:"2026-06-05", title:"RL rebalancing agent recommended concentrated position — suitability breach", category:"AI Model", doraFlag:false, aiActFlag:true, duration:"3h 20m", affectedUsers:128 },
      { id:"INC0079001", severity:"P3", status:"Resolved", date:"2026-04-22", title:"Bloomberg feed latency — stale ESG scores used in recommendations", category:"Third-Party", doraFlag:true, aiActFlag:true, duration:"55m", affectedUsers:0 },
      { id:"INC0076210", severity:"P2", status:"Resolved", date:"2026-03-11", title:"MiFID suitability check bypass — 14 orders executed without validation", category:"Compliance", doraFlag:false, aiActFlag:true, duration:"2h 05m", affectedUsers:14 },
    ],
  },
};

// ── CLAUDE API ────────────────────────────────────────────────────────────────
async function callClaude(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,   // increased — regulatory analysis JSON is large
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// Robust JSON extractor — handles fences, trailing truncation, and partial objects
function extractJSON(raw) {
  // Strip markdown fences
  let text = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  // Try direct parse first
  try { return JSON.parse(text); } catch (_) {}

  // Find the outermost { … } block
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in response");
  let depth = 0, end = -1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }

  // Complete object found
  if (end !== -1) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch (_) {}
  }

  // Truncated — attempt surgical repair: close all open braces/arrays/strings
  let fragment = text.slice(start);
  // Remove dangling incomplete string value at the end
  fragment = fragment.replace(/,?\s*"[^"]*$/, "");
  // Count unclosed braces and arrays
  let braces = 0, brackets = 0;
  let inStr = false, escape = false;
  for (const ch of fragment) {
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inStr) { escape = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") braces++;
    else if (ch === "}") braces--;
    else if (ch === "[") brackets++;
    else if (ch === "]") brackets--;
  }
  // Remove trailing comma before closing
  fragment = fragment.replace(/,\s*$/, "");
  // Close open arrays then objects
  fragment += "]".repeat(Math.max(0, brackets)) + "}".repeat(Math.max(0, braces));
  try { return JSON.parse(fragment); } catch (e) {
    throw new Error("Could not parse response even after repair: " + e.message);
  }
}

// ── SHARED UI ─────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = C.gold }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size, border: `2px solid ${C.border}`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.7s linear infinite", verticalAlign: "middle", marginRight: 6 }} />
  );
}

function Badge({ color, children, size = 10 }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 3, background: color + "22", border: `1px solid ${color}66`, color, fontSize: size, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "monospace" }}>
      {children}
    </span>
  );
}

function SectionTag({ children, color = C.gold }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, marginBottom: 6 }}>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ color: C.muted, fontSize: 11, fontFamily: "monospace", minWidth: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ color: C.offWhite, fontSize: 12, fontFamily: mono ? "monospace" : "inherit", lineHeight: 1.5 }}>{value}</span>
    </div>
  );
}

function Card({ children, style = {}, accent }) {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${accent || C.border}`, borderRadius: 8, padding: 20, ...style }}>
      {children}
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{ background: color + "15", border: `1px solid ${color}44`, color, fontSize: 10, fontFamily: "monospace", padding: "2px 8px", borderRadius: 3, marginRight: 5, marginBottom: 4, display: "inline-block" }}>
      {children}
    </span>
  );
}

// ── STEP 1: APPLICATION ID INPUT ─────────────────────────────────────────────
function Step1({ onSelect }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [recent] = useState(Object.keys(APPLICATIONS));

  function handleLookup(id) {
    const val = (id || input).trim().toUpperCase();
    if (!val) { setError("Enter an Application ID"); return; }
    if (!APPLICATIONS[val]) { setError(`No application found for ID "${val}". Try: APP-2841, APP-1193, APP-3307`); return; }
    setError("");
    onSelect(APPLICATIONS[val]);
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 48 }}>
      <SectionTag>Step 1 of 5 — Application Lookup</SectionTag>
      <h2 style={{ color: C.white, fontSize: 28, fontWeight: 800, margin: "6px 0 8px" }}>
        Enter Application ID
      </h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 32, lineHeight: 1.6 }}>
        Enter a DB Application ID to begin the DORA & EU AI Act compliance investigation. The system will retrieve application details, WALTZ data flows, and ServiceNow incident history.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input
          value={input}
          onChange={e => { setInput(e.target.value.toUpperCase()); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleLookup()}
          placeholder="e.g. APP-2841"
          autoFocus
          style={{
            flex: 1, background: C.bgMid, border: `1px solid ${error ? C.red : C.border}`,
            borderRadius: 6, padding: "12px 16px", color: C.white, fontSize: 15,
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, outline: "none",
            transition: "border-color 0.2s",
          }}
        />
        <button
          onClick={() => handleLookup()}
          style={{
            background: C.navy, color: "#FFFFFF", border: "none", borderRadius: 6,
            padding: "12px 28px", fontSize: 13, fontWeight: 800, cursor: "pointer",
            fontFamily: "monospace", letterSpacing: 1, whiteSpace: "nowrap",
          }}
        >
          LOOK UP →
        </button>
      </div>

      {error && (
        <div style={{ color: C.red, fontSize: 12, fontFamily: "monospace", marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <div style={{ color: C.muted, fontSize: 10, fontFamily: "monospace", letterSpacing: 2, marginBottom: 12 }}>
          REGISTERED APPLICATIONS IN SCOPE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recent.map(id => {
            const app = APPLICATIONS[id];
            return (
              <button key={id} onClick={() => { setInput(id); handleLookup(id); }}
                style={{
                  background: C.bgMid, border: `1px solid ${C.border}`, borderRadius: 6,
                  padding: "12px 16px", cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 14, transition: "border-color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <span style={{ color: C.gold, fontFamily: "monospace", fontSize: 12, fontWeight: 700, minWidth: 90 }}>{id}</span>
                <span style={{ color: C.white, fontSize: 13, flex: 1 }}>{app.name}</span>
                <Badge color={C.red}>{app.classification.replace("_", " ")}</Badge>
                <span style={{ color: C.muted, fontSize: 11 }}>{app.bu}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── STEP 2: APPLICATION DETAILS ───────────────────────────────────────────────
function Step2({ app }) {
  const classColor = app.criticality === "CRITICAL" ? C.red : C.amber;

  return (
    <div>
      {/* App header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24, padding: "20px 24px", background: C.navy, borderRadius: 8, border: `1px solid ${C.navy}` }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ color: C.gold, fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{app.id}</span>
            <Badge color={C.red}>HIGH RISK AI</Badge>
            <Badge color={classColor}>{app.criticality}</Badge>
          </div>
          <h2 style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{app.name}</h2>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{app.owner} · {app.bu}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace" }}>AI ACT CLASSIFICATION</div>
          <div style={{ color: "#FCA5A5", fontWeight: 800, fontSize: 13, fontFamily: "monospace" }}>Annex III — High Risk</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {/* Functional */}
        <Card style={{ gridColumn: "1 / -1" }}>
          <SectionTag>Functional Overview</SectionTag>
          <p style={{ color: C.text, fontSize: 13, lineHeight: 1.8, margin: "0 0 16px" }}>{app.functional.description}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={{ color: C.muted, fontSize: 10, fontFamily: "monospace", marginBottom: 8 }}>KEY CAPABILITIES</div>
              {app.functional.capabilities.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: C.text }}>
                  <span style={{ color: C.teal }}>▸</span>{c}
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: C.muted, fontSize: 10, fontFamily: "monospace", marginBottom: 8 }}>AI COMPONENTS (EU AI ACT SCOPE)</div>
              {app.functional.aiComponents.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: C.text }}>
                  <span style={{ color: C.gold }}>◆</span>{c}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Tech stack */}
        <Card>
          <SectionTag>Technology Stack</SectionTag>
          <InfoRow label="Languages" value={app.tech.languages.join(", ")} mono />
          <InfoRow label="Frameworks" value={app.tech.frameworks.join(", ")} mono />
          <InfoRow label="Databases" value={app.tech.databases.join(", ")} mono />
          <InfoRow label="AI / ML Stack" value={app.tech.aiStack.join(", ")} mono />
          <InfoRow label="Messaging" value={app.tech.messaging.join(", ")} mono />
        </Card>

        {/* Infrastructure */}
        <Card style={{ gridColumn: "span 2" }}>
          <SectionTag>Infrastructure Overview</SectionTag>
          <InfoRow label="Hosting" value={app.infra.hosting} />
          <InfoRow label="Data Residency" value={app.infra.dataResidency} />
          <InfoRow label="Availability SLA" value={app.infra.availability} />
          <InfoRow label="RTO / RPO" value={`${app.infra.rto} / ${app.infra.rpo}`} />
          <InfoRow label="Certifications" value={app.infra.certifications.join(" · ")} />
        </Card>
      </div>
    </div>
  );
}

// ── STEP 3: WALTZ DATA FLOWS ──────────────────────────────────────────────────
function Step3({ app }) {
  const critColor = { CRITICAL: C.red, HIGH: C.amber, MEDIUM: C.teal, LOW: C.green };
  const typeIcon = { "Database": "🗄", "API Gateway": "🔌", "Microservice": "⚙", "Core Banking": "🏦", "Service": "📦", "Network Gateway": "📡", "External Feed": "📊", "Frontend": "🖥", "Storage": "💾", "BI Platform": "📈", "Workflow": "📋", "Message Bus": "📨", "Regulatory": "⚖" };

  function FlowCard({ item, dir }) {
    return (
      <div style={{ background: C.bgMid, border: `1px solid ${critColor[item.criticality]}44`, borderRadius: 6, padding: "12px 14px", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 14 }}>{typeIcon[item.type] || "📦"}</span>
          <span style={{ color: C.white, fontWeight: 700, fontSize: 12 }}>{item.name}</span>
          <Badge color={critColor[item.criticality]}>{item.criticality}</Badge>
          <span style={{ marginLeft: "auto", color: C.muted, fontSize: 10, fontFamily: "monospace" }}>{item.id}</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ color: C.muted, fontSize: 10 }}>
            <span style={{ fontFamily: "monospace" }}>TYPE:</span> <span style={{ color: C.text }}>{item.type}</span>
          </div>
          <div style={{ color: C.muted, fontSize: 10 }}>
            <span style={{ fontFamily: "monospace" }}>PROTOCOL:</span> <span style={{ color: C.teal, fontFamily: "monospace" }}>{item.protocol}</span>
          </div>
        </div>
        <div style={{ marginTop: 5, color: C.muted, fontSize: 11 }}>
          <span style={{ fontFamily: "monospace" }}>DATA: </span>{item.data}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div>
          <SectionTag>WALTZ Data Flows</SectionTag>
          <h3 style={{ color: C.white, fontSize: 18, fontWeight: 700, margin: 0 }}>Physical & Logical Data Flow Map — {app.name}</h3>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Badge color={C.teal}>{app.waltz.upstream.length} Upstream</Badge>
          <Badge color={C.gold}>{app.waltz.downstream.length} Downstream</Badge>
        </div>
      </div>

      {/* Visual flow diagram */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "start" }}>
        <div>
          <div style={{ color: C.teal, fontSize: 10, fontFamily: "monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>
            ◀ UPSTREAM — DATA SOURCES
          </div>
          {app.waltz.upstream.map(u => <FlowCard key={u.id} item={u} dir="up" />)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 40, gap: 4 }}>
          <div style={{ background: C.navy, border: `2px solid ${C.goldLight}`, borderRadius: 8, padding: "14px 10px", textAlign: "center", minWidth: 120 }}>
            <div style={{ color: C.goldLight, fontSize: 9, fontFamily: "monospace", fontWeight: 700, marginBottom: 4 }}>DB APP</div>
            <div style={{ color: "#FFFFFF", fontWeight: 800, fontSize: 11 }}>{app.id}</div>
          </div>
          <div style={{ color: C.muted, fontSize: 18 }}>⬌</div>
        </div>

        <div>
          <div style={{ color: C.gold, fontSize: 10, fontFamily: "monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>
            DOWNSTREAM — DATA CONSUMERS ▶
          </div>
          {app.waltz.downstream.map(d => <FlowCard key={d.id} item={d} dir="down" />)}
        </div>
      </div>

      {/* DORA third-party note */}
      {[...app.waltz.upstream, ...app.waltz.downstream].some(f => ["API Gateway", "External Feed", "Network Gateway"].includes(f.type)) && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: C.amber + "12", border: `1px solid ${C.amber}44`, borderRadius: 6, color: C.text, fontSize: 12 }}>
          <span style={{ color: C.amber, fontFamily: "monospace", fontWeight: 700 }}>⚠ DORA Art. 28-44: </span>
          External providers in this flow are subject to DORA third-party ICT risk requirements. Contractual arrangements must include RTO/RPO obligations and exit strategies.
        </div>
      )}
    </div>
  );
}

// ── STEP 4: SERVICENOW INCIDENTS ─────────────────────────────────────────────
function Step4({ app, onSelectIncident }) {
  const sevColor = { P1: C.red, P2: C.amber, P3: C.teal, P4: C.muted };
  const statusColor = { Resolved: C.green, Open: C.red, "In Progress": C.amber };

  return (
    <div>
      <SectionTag>ServiceNow Incident Register</SectionTag>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <h3 style={{ color: C.white, fontSize: 18, fontWeight: 700, margin: 0 }}>
          Incidents — {app.name}
        </h3>
        <Badge color={C.red}>{app.incidents.filter(i => i.severity === "P1").length} P1</Badge>
        <Badge color={C.amber}>{app.incidents.filter(i => i.severity === "P2").length} P2</Badge>
        <span style={{ marginLeft: "auto", color: C.muted, fontSize: 11 }}>Click any incident to analyse against DORA & EU AI Act</span>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 14, padding: "8px 14px", background: C.bgMid, borderRadius: 6, fontSize: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: C.muted }}>
          <Badge color={C.teal}>DORA</Badge> DORA-reportable incident
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: C.muted }}>
          <Badge color={C.gold}>AI ACT</Badge> EU AI Act Article 12 / 62 scope
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {app.incidents.map(inc => (
          <button key={inc.id} onClick={() => onSelectIncident(inc)}
            style={{
              background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 6,
              padding: "14px 18px", cursor: "pointer", textAlign: "left",
              display: "grid", gridTemplateColumns: "100px 80px 1fr auto auto auto",
              alignItems: "center", gap: 12, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = C.bgMid; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bgCard; }}
          >
            <span style={{ color: C.muted, fontFamily: "monospace", fontSize: 11 }}>{inc.id}</span>
            <Badge color={sevColor[inc.severity]}>{inc.severity}</Badge>
            <div>
              <div style={{ color: C.white, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{inc.title}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: C.muted, fontSize: 11 }}>{inc.date}</span>
                <span style={{ color: C.muted, fontSize: 11 }}>·</span>
                <span style={{ color: C.muted, fontSize: 11 }}>{inc.category}</span>
                <span style={{ color: C.muted, fontSize: 11 }}>·</span>
                <span style={{ color: C.muted, fontSize: 11 }}>Duration: {inc.duration}</span>
              </div>
            </div>
            <Badge color={statusColor[inc.status]}>{inc.status}</Badge>
            {inc.doraFlag && <Badge color={C.teal}>DORA</Badge>}
            {inc.aiActFlag && <Badge color={C.gold}>AI ACT</Badge>}
            <span style={{ color: C.gold, fontSize: 16 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── STEP 5: REGULATORY ANALYSIS ───────────────────────────────────────────────
function Step5({ app, incident }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasRun = useRef(false);

  const SYSTEM = `You are RegSentinel AI, Deutsche Bank's expert regulatory compliance analyser for DORA and the EU AI Act.

Given an application profile and a ServiceNow incident, produce a structured regulatory analysis. Respond ONLY with this JSON (no markdown, no preamble):
{
  "executiveSummary": "2-3 sentence plain-English summary of the regulatory exposure this incident creates",
  "doraAnalysis": {
    "inScope": true|false,
    "primaryArticles": ["Art. XX — Title", "Art. YY — Title"],
    "classification": "Major ICT-related incident"|"Significant cyber threat"|"Operational incident"|"Not DORA reportable",
    "reportingObligation": "Describe the specific reporting obligation and timeline e.g. 'Initial notification to BaFin within 4 hours'",
    "gapIdentified": "Key DORA compliance gap this incident reveals",
    "remediationAction": "Specific DORA-required remediation step"
  },
  "aiActAnalysis": {
    "inScope": true|false,
    "primaryArticles": ["Art. XX — Title", "Art. YY — Title"],
    "riskCategory": "Unacceptable"|"High"|"Limited"|"Minimal",
    "obligationTriggered": "Which specific AI Act obligation does this incident trigger",
    "gapIdentified": "Key AI Act compliance gap this incident reveals",
    "remediationAction": "Specific AI Act-required remediation step"
  },
  "combinedRisk": {
    "overlapDetected": true|false,
    "intersectionExplanation": "If both frameworks apply, explain the intersection and why it compounds the risk",
    "overallSeverity": "CRITICAL"|"HIGH"|"MEDIUM"|"LOW",
    "unifiedRemediationPlan": [
      { "priority": 1, "action": "action text", "owner": "role", "framework": "DORA"|"AI Act"|"BOTH", "deadline": "timeframe" },
      { "priority": 2, "action": "action text", "owner": "role", "framework": "DORA"|"AI Act"|"BOTH", "deadline": "timeframe" },
      { "priority": 3, "action": "action text", "owner": "role", "framework": "DORA"|"AI Act"|"BOTH", "deadline": "timeframe" },
      { "priority": 4, "action": "action text", "owner": "role", "framework": "DORA"|"AI Act"|"BOTH", "deadline": "timeframe" }
    ]
  },
  "regulatoryTimeline": [
    { "milestone": "milestone name", "deadline": "timeframe from incident", "framework": "DORA"|"AI Act"|"BOTH", "status": "OVERDUE"|"DUE"|"UPCOMING" }
  ],
  "potentialFinancialExposure": "Describe the regulatory fine exposure with specific reference to DORA Art. 50 or AI Act penalty provisions"
}`;

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    setLoading(true);

    const userMsg = `
APPLICATION: ${app.name} (${app.id})
Classification: ${app.classification}
Business Unit: ${app.bu}
AI Components: ${app.functional.aiComponents.join(", ")}
Infrastructure: ${app.infra.hosting}
Certifications: ${app.infra.certifications.join(", ")}

INCIDENT:
ID: ${incident.id}
Severity: ${incident.severity}
Category: ${incident.category}
Title: ${incident.title}
Duration: ${incident.duration}
Affected Users: ${incident.affectedUsers}
Date: ${incident.date}
Status: ${incident.status}
DORA Flagged: ${incident.doraFlag}
AI Act Flagged: ${incident.aiActFlag}

Provide a detailed DORA and EU AI Act regulatory analysis of this incident.`;

    callClaude(SYSTEM, userMsg)
      .then(raw => {
        try {
          setAnalysis(extractJSON(raw));
        } catch (e) {
          setError("Analysis parsing failed — " + e.message + ". Raw snippet: " + raw.slice(0, 120));
        }
      })
      .catch(e => setError("API call failed: " + e.message + ". Please retry."))
      .finally(() => setLoading(false));
  }, [incident.id]);

  const sevColor = { P1: C.red, P2: C.amber, P3: C.teal };
  const overallColor = { CRITICAL: C.red, HIGH: C.amber, MEDIUM: C.teal, LOW: C.green };
  const fwColor = { DORA: C.teal, "AI Act": C.gold, BOTH: C.red };
  const statusColor = { OVERDUE: C.red, DUE: C.amber, UPCOMING: C.green };

  return (
    <div>
      {/* Incident header */}
      <div style={{ padding: "16px 20px", background: C.bgMid, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Badge color={sevColor[incident.severity]}>{incident.severity}</Badge>
          <span style={{ color: C.gold, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{incident.id}</span>
          {incident.doraFlag && <Badge color={C.teal}>DORA</Badge>}
          {incident.aiActFlag && <Badge color={C.gold}>AI ACT</Badge>}
        </div>
        <div style={{ color: C.white, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{incident.title}</div>
        <div style={{ color: C.muted, fontSize: 11, fontFamily: "monospace" }}>
          {app.name} · {incident.date} · Duration: {incident.duration} · Affected: {incident.affectedUsers.toLocaleString()} users
        </div>
      </div>

      {loading && (
        <div style={{ padding: 48, textAlign: "center" }}>
          <Spinner size={28} />
          <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 12, marginTop: 16 }}>
            RegSentinel AI is analysing this incident against DORA Art. 5–44 and EU AI Act Art. 6–14…
          </div>
        </div>
      )}

      {error && (
        <Card accent={C.red}>
          <div style={{ color: C.red, fontSize: 12, fontFamily: "monospace" }}>{error}</div>
        </Card>
      )}

      {analysis && !loading && (
        <div>
          {/* Executive summary */}
          <Card style={{ marginBottom: 16, borderLeft: `4px solid ${overallColor[analysis.combinedRisk?.overallSeverity] || C.red}` }}>
            <SectionTag>Executive Summary</SectionTag>
            <p style={{ color: C.offWhite, fontSize: 13, lineHeight: 1.8, margin: "0 0 12px" }}>{analysis.executiveSummary}</p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: C.muted, fontSize: 11 }}>Overall Severity:</span>
              <Badge color={overallColor[analysis.combinedRisk?.overallSeverity]}>{analysis.combinedRisk?.overallSeverity}</Badge>
              {analysis.combinedRisk?.overlapDetected && <Badge color={C.red}>⚡ DUAL-FRAMEWORK OVERLAP</Badge>}
            </div>
          </Card>

          {/* DORA + AI Act side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {/* DORA */}
            <Card accent={analysis.doraAnalysis?.inScope ? C.teal : C.border}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Badge color={C.teal}>DORA</Badge>
                <span style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>Digital Operational Resilience Act</span>
                <span style={{ marginLeft: "auto", fontSize: 16 }}>{analysis.doraAnalysis?.inScope ? "✅" : "⬜"}</span>
              </div>
              {analysis.doraAnalysis?.inScope ? (
                <>
                  <InfoRow label="Classification" value={analysis.doraAnalysis.classification} />
                  <InfoRow label="Articles Triggered" value={analysis.doraAnalysis.primaryArticles?.join(", ")} />
                  <InfoRow label="Reporting Obligation" value={analysis.doraAnalysis.reportingObligation} />
                  <div style={{ marginTop: 10, padding: "8px 12px", background: C.red + "10", border: `1px solid ${C.red}44`, borderRadius: 5 }}>
                    <div style={{ color: C.red, fontSize: 9, fontFamily: "monospace", marginBottom: 3 }}>GAP IDENTIFIED</div>
                    <div style={{ color: C.text, fontSize: 11 }}>{analysis.doraAnalysis.gapIdentified}</div>
                  </div>
                  <div style={{ marginTop: 8, padding: "8px 12px", background: C.teal + "10", border: `1px solid ${C.teal}44`, borderRadius: 5 }}>
                    <div style={{ color: C.teal, fontSize: 9, fontFamily: "monospace", marginBottom: 3 }}>REQUIRED ACTION</div>
                    <div style={{ color: C.text, fontSize: 11 }}>{analysis.doraAnalysis.remediationAction}</div>
                  </div>
                </>
              ) : (
                <div style={{ color: C.muted, fontSize: 12 }}>This incident does not trigger DORA reporting obligations.</div>
              )}
            </Card>

            {/* AI Act */}
            <Card accent={analysis.aiActAnalysis?.inScope ? C.gold : C.border}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Badge color={C.gold}>EU AI ACT</Badge>
                <span style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>Artificial Intelligence Act</span>
                <span style={{ marginLeft: "auto", fontSize: 16 }}>{analysis.aiActAnalysis?.inScope ? "✅" : "⬜"}</span>
              </div>
              {analysis.aiActAnalysis?.inScope ? (
                <>
                  <InfoRow label="Risk Category" value={analysis.aiActAnalysis.riskCategory} />
                  <InfoRow label="Articles Triggered" value={analysis.aiActAnalysis.primaryArticles?.join(", ")} />
                  <InfoRow label="Obligation Triggered" value={analysis.aiActAnalysis.obligationTriggered} />
                  <div style={{ marginTop: 10, padding: "8px 12px", background: C.red + "10", border: `1px solid ${C.red}44`, borderRadius: 5 }}>
                    <div style={{ color: C.red, fontSize: 9, fontFamily: "monospace", marginBottom: 3 }}>GAP IDENTIFIED</div>
                    <div style={{ color: C.text, fontSize: 11 }}>{analysis.aiActAnalysis.gapIdentified}</div>
                  </div>
                  <div style={{ marginTop: 8, padding: "8px 12px", background: C.gold + "10", border: `1px solid ${C.gold}44`, borderRadius: 5 }}>
                    <div style={{ color: C.gold, fontSize: 9, fontFamily: "monospace", marginBottom: 3 }}>REQUIRED ACTION</div>
                    <div style={{ color: C.text, fontSize: 11 }}>{analysis.aiActAnalysis.remediationAction}</div>
                  </div>
                </>
              ) : (
                <div style={{ color: C.muted, fontSize: 12 }}>This incident does not trigger EU AI Act obligations.</div>
              )}
            </Card>
          </div>

          {/* Overlap explanation */}
          {analysis.combinedRisk?.overlapDetected && (
            <Card style={{ marginBottom: 14 }} accent={C.red}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20 }}>⚡</span>
                <div>
                  <div style={{ color: C.red, fontSize: 10, fontFamily: "monospace", fontWeight: 700, marginBottom: 4 }}>DUAL-FRAMEWORK INTERSECTION</div>
                  <p style={{ color: C.text, fontSize: 12, lineHeight: 1.7, margin: 0 }}>{analysis.combinedRisk.intersectionExplanation}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Unified remediation plan */}
          <Card style={{ marginBottom: 14 }}>
            <SectionTag>Unified Remediation Plan</SectionTag>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {analysis.combinedRisk?.unifiedRemediationPlan?.map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr 120px 100px 100px", alignItems: "center", gap: 10, padding: "10px 14px", background: C.bgMid, borderRadius: 6, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: fwColor[item.framework] || C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: C.bg, fontWeight: 800, fontSize: 12, fontFamily: "monospace", flexShrink: 0 }}>
                    {item.priority}
                  </div>
                  <div style={{ color: C.text, fontSize: 12 }}>{item.action}</div>
                  <div style={{ color: C.muted, fontSize: 11, textAlign: "right" }}>{item.owner}</div>
                  <Badge color={fwColor[item.framework] || C.teal}>{item.framework}</Badge>
                  <div style={{ color: C.gold, fontSize: 11, fontFamily: "monospace", textAlign: "right" }}>{item.deadline}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Regulatory timeline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card>
              <SectionTag>Regulatory Timeline</SectionTag>
              {analysis.regulatoryTimeline?.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: i < analysis.regulatoryTimeline.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <Badge color={statusColor[t.status]} size={8}>{t.status}</Badge>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.text, fontSize: 12 }}>{t.milestone}</div>
                    <div style={{ color: C.muted, fontSize: 10, fontFamily: "monospace" }}>{t.deadline}</div>
                  </div>
                  <Badge color={fwColor[t.framework]}>{t.framework}</Badge>
                </div>
              ))}
            </Card>

            <Card accent={C.red}>
              <SectionTag color={C.red}>Financial Exposure</SectionTag>
              <p style={{ color: C.text, fontSize: 12, lineHeight: 1.8, margin: 0 }}>{analysis.potentialFinancialExposure}</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function ComplianceWorkstation() {
  const [app, setApp] = useState(null);
  const [incident, setIncident] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  function handleSelectApp(selectedApp) {
    setApp(selectedApp);
    setIncident(null);
    setActiveStep(2);
  }

  function handleSelectIncident(inc) {
    setIncident(inc);
    setActiveStep(5);
  }

  const steps = [
    { n: 1, label: "Application ID", done: !!app },
    { n: 2, label: "App Details", done: !!app && activeStep > 2, active: !!app },
    { n: 3, label: "WALTZ Flows", done: !!app && activeStep > 3, active: !!app },
    { n: 4, label: "Incidents", done: !!incident, active: !!app },
    { n: 5, label: "Reg Analysis", done: false, active: !!incident },
  ];

  const stepColor = (s) => {
    if (s.n === activeStep) return C.gold;
    if (s.done) return C.green;
    if (!s.active) return C.border;
    return C.teal;
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", display: "flex" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
      `}</style>

      {/* LEFT SIDEBAR — Case File Progress */}
      <div style={{ width: 220, flexShrink: 0, background: C.navy, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "24px 0" }}>
        {/* Brand */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ background: C.goldLight, color: C.navy, fontWeight: 900, fontSize: 12, padding: "2px 7px", borderRadius: 3, fontFamily: "monospace" }}>db</div>
            <span style={{ color: "#FFFFFF", fontWeight: 800, fontSize: 13 }}>RegSentinel</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, fontFamily: "monospace", letterSpacing: 2 }}>COMPLIANCE WORKSTATION</div>
          <div style={{ marginTop: 8, display: "flex", gap: 5 }}>
            <Tag color={C.tealLight}>DORA</Tag>
            <Tag color={C.goldLight}>AI ACT</Tag>
          </div>
        </div>

        {/* Case file steps */}
        <div style={{ padding: "20px 0", flex: 1 }}>
          <div style={{ padding: "0 20px", color: "rgba(255,255,255,0.45)", fontSize: 9, fontFamily: "monospace", letterSpacing: 2, marginBottom: 12 }}>INVESTIGATION STEPS</div>
          {steps.map((s, i) => (
            <div key={s.n}>
              <button
                onClick={() => { if (s.active || s.done || s.n === 1) setActiveStep(s.n); }}
                disabled={!s.active && !s.done && s.n !== 1}
                style={{
                  width: "100%", background: activeStep === s.n ? "rgba(255,255,255,0.12)" : "transparent",
                  border: "none", borderRight: activeStep === s.n ? `3px solid ${C.goldLight}` : "3px solid transparent",
                  padding: "10px 20px", cursor: (s.active || s.done || s.n === 1) ? "pointer" : "default",
                  display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s",
                  textAlign: "left",
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: activeStep === s.n ? C.gold : s.done ? C.green : C.bgMid,
                  border: `2px solid ${stepColor(s)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, fontFamily: "monospace",
                  color: activeStep === s.n ? C.bg : s.done ? C.white : stepColor(s),
                }}>
                  {s.done ? "✓" : s.n}
                </div>
                <div>
                  <div style={{ color: activeStep === s.n ? "#FFFFFF" : s.done ? "#6EE7B7" : s.active ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: activeStep === s.n ? 700 : 400 }}>
                    {s.label}
                  </div>
                </div>
              </button>
              {i < steps.length - 1 && (
                <div style={{ width: 2, height: 8, background: s.done ? "#6EE7B7" : "rgba(255,255,255,0.15)", marginLeft: 32 }} />
              )}
            </div>
          ))}
        </div>

        {/* Case file info */}
        {app && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>ACTIVE CASE</div>
            <div style={{ color: C.goldLight, fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>{app.id}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginBottom: 6 }}>{app.name}</div>
            {incident && (
              <>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontFamily: "monospace", letterSpacing: 2, margin: "8px 0 4px" }}>INCIDENT</div>
                <div style={{ color: "#FCA5A5", fontFamily: "monospace", fontSize: 10 }}>{incident.id}</div>
              </>
            )}
          </div>
        )}

        {/* Reset */}
        {app && (
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}` }}>
            <button onClick={() => { setApp(null); setIncident(null); setActiveStep(1); }}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.5)", borderRadius: 5, padding: "6px 12px", fontSize: 11, cursor: "pointer", width: "100%", fontFamily: "monospace" }}>
              ← New Investigation
            </button>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Top bar */}
        <div style={{ padding: "14px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, background: C.bgCard, position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 8px rgba(0,62,126,0.08)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.muted, fontSize: 10, fontFamily: "monospace" }}>
              {["App Lookup", "Application Details", "WALTZ Data Flows", "Incident Register", "Regulatory Analysis"][activeStep - 1]}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "spin 4s linear infinite" }} />
            <span style={{ color: C.green, fontSize: 10, fontFamily: "monospace" }}>REGSENTINEL ACTIVE</span>
          </div>
          {app && activeStep >= 2 && activeStep < 5 && (
            <div style={{ display: "flex", gap: 6 }}>
              {[{n:2,l:"Details"},{n:3,l:"WALTZ"},{n:4,l:"Incidents"}].map(t => (
                <button key={t.n} onClick={() => setActiveStep(t.n)} style={{
                  background: activeStep === t.n ? C.navy : "transparent",
                  border: `1px solid ${activeStep === t.n ? C.gold : C.border}`,
                  color: activeStep === t.n ? C.gold : C.muted,
                  borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "monospace",
                }}>{t.l}</button>
              ))}
            </div>
          )}
          {incident && activeStep === 5 && (
            <button onClick={() => setActiveStep(4)} style={{
              background: "transparent", border: `1px solid ${C.border}`, color: C.muted,
              borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "monospace",
            }}>← Back to Incidents</button>
          )}
        </div>

        {/* Step content */}
        <div style={{ padding: 28, animation: "fadeIn 0.25s ease" }}>
          {activeStep === 1 && <Step1 onSelect={handleSelectApp} />}
          {activeStep === 2 && app && <Step2 app={app} />}
          {activeStep === 3 && app && <Step3 app={app} />}
          {activeStep === 4 && app && <Step4 app={app} onSelectIncident={handleSelectIncident} />}
          {activeStep === 5 && app && incident && <Step5 key={incident.id} app={app} incident={incident} />}
        </div>
      </div>
    </div>
  );
}
