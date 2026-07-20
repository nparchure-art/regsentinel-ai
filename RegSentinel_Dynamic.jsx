import { useState, useEffect, useCallback, useRef } from "react";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  navy:     "#001A3A", navyMid: "#002E5F", navyCard: "#05305E",
  gold:     "#C8922A", goldLight: "#E5B84D",
  teal:     "#00869A", tealLight: "#00A8C0",
  green:    "#2D8653", greenLight: "#3AAD6A",
  red:      "#C0392B", amber: "#D4820A",
  white:    "#FFFFFF", offWhite: "#E8EEF7",
  muted:    "#8899AA", border: "#1A3A5C",
  purple:   "#7C3AED",
};

// ══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — MOCK API (simulates ServiceNow CMDB, AI Registry, BaFin feeds)
// In production: replace fetch() URLs with real endpoints
// ══════════════════════════════════════════════════════════════════════════════
const MOCK_DB = {
  cmdbAssets: [
    { id:"ASSET-001", name:"DB Credit Scoring Engine", type:"Credit Scoring Model", owner:"Retail Credit Risk", vendor:"Internal", region:"EU-Frankfurt", criticality:"CRITICAL", lastP1:"2026-03-12", openVulns:3, doraScope:true, isAI:true, incidents:14, slaBreaches:2 },
    { id:"ASSET-002", name:"SWIFT Payment Gateway", type:"Payment Processing System", owner:"Transaction Banking", vendor:"SWIFT", region:"EU-Frankfurt", criticality:"CRITICAL", lastP1:"2026-05-22", openVulns:1, doraScope:true, isAI:false, incidents:6, slaBreaches:0 },
    { id:"ASSET-003", name:"AML Detection Platform", type:"Fraud Detection Model", owner:"Financial Crime", vendor:"Internal", region:"EU-Amsterdam", criticality:"CRITICAL", lastP1:"2026-01-08", openVulns:0, doraScope:true, isAI:true, incidents:9, slaBreaches:1 },
    { id:"ASSET-004", name:"Client Onboarding KYC AI", type:"Identity & Authentication", owner:"Private Banking", vendor:"Idemia", region:"EU-Frankfurt", criticality:"IMPORTANT", lastP1:"2026-04-15", openVulns:2, doraScope:true, isAI:true, incidents:4, slaBreaches:0 },
    { id:"ASSET-005", name:"DB Cloud API Gateway", type:"API Gateway", owner:"Platform Engineering", vendor:"Azure", region:"EU-Frankfurt", criticality:"CRITICAL", lastP1:"2026-06-01", openVulns:5, doraScope:true, isAI:false, incidents:21, slaBreaches:3 },
    { id:"ASSET-006", name:"Robo-Adviser Engine", type:"Investment Advisory Model", owner:"Wealth Management", vendor:"Internal", region:"EU-Frankfurt", criticality:"IMPORTANT", lastP1:"2025-11-30", openVulns:1, doraScope:true, isAI:true, incidents:2, slaBreaches:0 },
    { id:"ASSET-007", name:"Trade Surveillance System", type:"Trading System", owner:"Markets Compliance", vendor:"NICE Actimize", region:"EU-Frankfurt", criticality:"CRITICAL", lastP1:"2026-02-19", openVulns:0, doraScope:true, isAI:true, incidents:7, slaBreaches:1 },
    { id:"ASSET-008", name:"Core Banking Platform", type:"Core Banking Platform", owner:"IT Operations", vendor:"SAP", region:"EU-Frankfurt", criticality:"CRITICAL", lastP1:"2026-06-28", openVulns:8, doraScope:true, isAI:false, incidents:33, slaBreaches:5 },
  ],
  regulatoryFeed: [
    { id:"REG-001", source:"BaFin", date:"2026-07-15", title:"DORA RTS on ICT incident classification — updated thresholds", urgency:"HIGH" },
    { id:"REG-002", source:"EBA", date:"2026-07-10", title:"AI Act high-risk system obligations — Q&A clarification on Annex III", urgency:"HIGH" },
    { id:"REG-003", source:"ECB", date:"2026-07-05", title:"DORA third-party ICT provider register — registration deadline extended", urgency:"MEDIUM" },
    { id:"REG-004", source:"EUR-Lex", date:"2026-06-28", title:"AI Act Article 12 audit trail specifications — technical standard published", urgency:"MEDIUM" },
  ],
};

// Simulated async API calls with realistic latency
const MockAPI = {
  async getAssets() {
    await new Promise(r => setTimeout(r, 600));
    return MOCK_DB.cmdbAssets;
  },
  async getAsset(id) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_DB.cmdbAssets.find(a => a.id === id);
  },
  async getRegulatoryFeed() {
    await new Promise(r => setTimeout(r, 400));
    return MOCK_DB.regulatoryFeed;
  },
  async writeBack(assetId, result) {
    await new Promise(r => setTimeout(r, 500));
    return { success: true, ticketId: `SNW-${Math.floor(Math.random()*90000+10000)}`, assetId, timestamp: new Date().toISOString() };
  },
  async createIncidentTask(incident) {
    await new Promise(r => setTimeout(r, 400));
    return { ticketId: `INC-${Math.floor(Math.random()*90000+10000)}`, status:"created" };
  },
};

// ── Claude API ─────────────────────────────────────────────────────────────
async function callClaude(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      model:"claude-sonnet-4-6", max_tokens:1000,
      system, messages:[{ role:"user", content:user }],
    }),
  });
  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

// ══════════════════════════════════════════════════════════════════════════════
// LAYER 2 — WEBHOOK ENGINE (simulates live incident feed)
// ══════════════════════════════════════════════════════════════════════════════
const INCIDENT_TEMPLATES = [
  { severity:"P1", asset:"ASSET-008", summary:"Core Banking Platform — database cluster failover, 3 nodes degraded", source:"ServiceNow" },
  { severity:"P1", asset:"ASSET-005", summary:"API Gateway — rate limiting failure causing downstream timeouts", source:"Azure Monitor" },
  { severity:"P2", asset:"ASSET-001", summary:"Credit Scoring Engine — model drift detected, accuracy below threshold", source:"ML Ops" },
  { severity:"P2", asset:"ASSET-003", summary:"AML Detection — false positive rate spike, manual review queue overloaded", source:"ServiceNow" },
  { severity:"P1", asset:"ASSET-002", summary:"SWIFT Gateway — connectivity loss to correspondent bank network", source:"SWIFT Alliance" },
];

function useWebhookFeed() {
  const [events, setEvents] = useState([]);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const fireEvent = useCallback(() => {
    const template = INCIDENT_TEMPLATES[Math.floor(Math.random() * INCIDENT_TEMPLATES.length)];
    const asset = MOCK_DB.cmdbAssets.find(a => a.id === template.asset);
    setEvents(prev => [{
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: template.severity,
      asset,
      summary: template.summary,
      source: template.source,
      requiresDORA: asset?.doraScope,
      requiresAIAct: asset?.isAI,
      status: "PENDING",
    }, ...prev].slice(0, 20));
  }, []);

  useEffect(() => {
    if (!paused) {
      timerRef.current = setInterval(fireEvent, 8000 + Math.random() * 7000);
      fireEvent();
    }
    return () => clearInterval(timerRef.current);
  }, [paused, fireEvent]);

  return { events, setEvents, paused, setPaused };
}

// ══════════════════════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ══════════════════════════════════════════════════════════════════════════════
function Spinner({ size=16, color=C.gold }) {
  return <span style={{ display:"inline-block", width:size, height:size, border:`2px solid ${C.border}`, borderTopColor:color, borderRadius:"50%", animation:"spin 0.7s linear infinite", verticalAlign:"middle", marginRight:6 }}/>;
}

function Badge({ color, children, small }) {
  return <span style={{ display:"inline-block", padding: small ? "1px 6px":"2px 9px", borderRadius:3, background:color+"22", border:`1px solid ${color}`, color, fontSize: small ? 9:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", fontFamily:"monospace" }}>{children}</span>;
}

function Card({ children, style={}, accent }) {
  return <div style={{ background:C.navyCard, border:`1px solid ${accent||C.border}`, borderRadius:10, padding:20, ...style }}>{children}</div>;
}

function SLabel({ children, color=C.gold }) {
  return <div style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color, fontFamily:"monospace", fontWeight:700, marginBottom:5 }}>{children}</div>;
}

function Tag({ color, children }) {
  return <span style={{ background:color+"18", border:`1px solid ${color}44`, color, fontSize:10, fontFamily:"monospace", padding:"2px 7px", borderRadius:3, marginRight:4 }}>{children}</span>;
}

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return ()=>clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:1000, background:C.green, color:C.white, padding:"12px 20px", borderRadius:8, fontFamily:"monospace", fontSize:12, fontWeight:700, boxShadow:"0 4px 20px rgba(0,0,0,0.4)", maxWidth:340 }}>
      ✓  {message}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FLOW 1 — AI ACT CLASSIFIER (dynamic: pulls from AI Registry)
// ══════════════════════════════════════════════════════════════════════════════
function Flow1({ assets, toast }) {
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [writingBack, setWritingBack] = useState(false);

  const aiAssets = assets.filter(a => a.isAI);
  const selected = aiAssets.find(a => a.id === selectedId);

  const SYSTEM = `You are RegSentinel AI, the EU AI Act Risk Classification engine for Deutsche Bank.
Given structured ICT asset data, respond ONLY with JSON:
{
  "riskTier": "HIGH_RISK"|"LIMITED_RISK"|"MINIMAL_RISK"|"PROHIBITED",
  "aiActArticle": "e.g. Article 6, Annex III §5b",
  "rationale": "2-3 sentences",
  "requiredControls": ["control 1","control 2","control 3","control 4"],
  "doraOverlap": true|false,
  "doraReason": "one sentence or null",
  "estimatedComplianceDays": number,
  "complianceGaps": ["gap 1","gap 2","gap 3"]
}
No markdown, only JSON.`;

  async function classify() {
    if (!selected) return;
    setLoading(true); setResult(null);
    try {
      const json = await callClaude(SYSTEM,
        `Asset: ${selected.name}\nType: ${selected.type}\nOwner: ${selected.owner}\nVendor: ${selected.vendor}\nCriticality: ${selected.criticality}\nRegion: ${selected.region}\nOpen vulnerabilities: ${selected.openVulns}\nDORA scope: ${selected.doraScope}\nLast P1 incident: ${selected.lastP1}`
      );
      setResult(json);
    } catch(e) { setResult({ error:"Classification failed." }); }
    setLoading(false);
  }

  async function writeBack() {
    setWritingBack(true);
    const ticket = await MockAPI.writeBack(selectedId, result);
    setWritingBack(false);
    toast(`Result written to AI Governance Portal · ServiceNow ticket ${ticket.ticketId} created`);
  }

  const tierColor = { HIGH_RISK:C.red, LIMITED_RISK:C.amber, MINIMAL_RISK:C.green, PROHIBITED:"#8B0000" };

  return (
    <div>
      <SLabel>Flow 1 — EU AI Act Classifier · Live AI Registry</SLabel>
      <h2 style={{ color:C.white, fontSize:20, margin:"4px 0 6px", fontWeight:800 }}>AI System Intake → Auto-Classification</h2>
      <p style={{ color:C.muted, fontSize:12, marginBottom:18 }}>
        Pulls directly from DB's AI Governance Registry. Select a deployed AI system — RegSentinel classifies its EU AI Act risk tier from live asset metadata.
      </p>

      {/* Data source badge */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, padding:"8px 12px", background:C.navy, border:`1px solid ${C.teal}`, borderRadius:6 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:C.tealLight, animation:"pulse 2s infinite" }}/>
        <span style={{ color:C.teal, fontSize:10, fontFamily:"monospace", fontWeight:700 }}>LIVE · AI GOVERNANCE REGISTRY · {aiAssets.length} systems loaded</span>
        <span style={{ marginLeft:"auto", color:C.muted, fontSize:9, fontFamily:"monospace" }}>Source: DB AI Registry / CMDB via ServiceNow API</span>
      </div>

      {/* Asset selector */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          <SLabel color={C.teal}>Select AI System</SLabel>
          <select value={selectedId} onChange={e=>{ setSelectedId(e.target.value); setResult(null); }}
            style={{ width:"100%", background:C.navy, border:`1px solid ${C.border}`, borderRadius:6, padding:"10px 12px", color:C.offWhite, fontSize:13, fontFamily:"monospace", outline:"none" }}>
            <option value="">— Choose from registry —</option>
            {aiAssets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.criticality})</option>)}
          </select>
        </div>
        {selected && (
          <Card style={{ padding:"10px 14px" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              <Tag color={C.teal}>{selected.type}</Tag>
              <Tag color={selected.criticality==="CRITICAL"?C.red:C.amber}>{selected.criticality}</Tag>
              <Tag color={C.muted}>{selected.vendor}</Tag>
              <Tag color={C.gold}>{selected.region}</Tag>
            </div>
            <div style={{ color:C.muted, fontSize:11, fontFamily:"monospace", marginTop:8 }}>
              Owner: {selected.owner} · Last P1: {selected.lastP1} · Open vulns: {selected.openVulns}
            </div>
          </Card>
        )}
      </div>

      <button onClick={classify} disabled={loading||!selectedId} style={{
        background:loading||!selectedId?C.border:C.gold, color:loading||!selectedId?C.muted:C.navy,
        border:"none", borderRadius:6, padding:"10px 24px", fontSize:12, fontWeight:700,
        cursor:loading||!selectedId?"default":"pointer", fontFamily:"monospace", letterSpacing:1,
      }}>
        {loading ? <><Spinner/>CLASSIFYING…</> : "▶  CLASSIFY SYSTEM"}
      </button>

      {result && !result.error && (
        <div style={{ marginTop:22 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, background:C.navy, border:`2px solid ${tierColor[result.riskTier]||C.teal}`, borderRadius:8, padding:"12px 18px", marginBottom:14 }}>
            <span style={{ fontSize:28 }}>{result.riskTier==="HIGH_RISK"?"⚠️":result.riskTier==="PROHIBITED"?"🚫":result.riskTier==="LIMITED_RISK"?"⚡":"✅"}</span>
            <div>
              <Badge color={tierColor[result.riskTier]||C.teal}>{result.riskTier?.replace("_"," ")}</Badge>
              <div style={{ color:C.muted, fontSize:10, fontFamily:"monospace", marginTop:3 }}>{result.aiActArticle}</div>
            </div>
            {result.doraOverlap && <Badge color={C.amber}>⚡ DORA OVERLAP</Badge>}
            <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
              <button onClick={writeBack} disabled={writingBack} style={{
                background:C.green+"22", border:`1px solid ${C.green}`, color:C.green,
                borderRadius:5, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"monospace",
              }}>
                {writingBack ? <><Spinner size={12} color={C.green}/>WRITING…</> : "↑ WRITE TO REGISTRY"}
              </button>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Card>
              <SLabel>Rationale</SLabel>
              <p style={{ color:C.offWhite, fontSize:12, lineHeight:1.7, margin:0 }}>{result.rationale}</p>
              {result.doraOverlap && <div style={{ marginTop:10, padding:"7px 10px", borderRadius:4, background:C.amber+"18", border:`1px solid ${C.amber}`, color:C.amber, fontSize:11, fontFamily:"monospace" }}>⚡ {result.doraReason}</div>}
            </Card>
            <Card>
              <SLabel>Required Controls</SLabel>
              {result.requiredControls?.map((c,i) => (
                <div key={i} style={{ display:"flex", gap:7, marginBottom:7, fontSize:12, color:C.offWhite }}>
                  <span style={{ color:C.teal, fontFamily:"monospace", minWidth:16 }}>{i+1}.</span>{c}
                </div>
              ))}
            </Card>
            <Card style={{ gridColumn:"1/-1" }}>
              <SLabel>Compliance Gaps Detected</SLabel>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {result.complianceGaps?.map((g,i) => (
                  <div key={i} style={{ background:C.red+"12", border:`1px solid ${C.red}44`, color:C.offWhite, fontSize:11, padding:"5px 10px", borderRadius:5 }}>⚠ {g}</div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ marginTop:12, padding:"9px 14px", background:C.navy, border:`1px solid ${C.border}`, borderRadius:6, display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ color:C.muted, fontSize:11, fontFamily:"monospace" }}>COMPLIANCE TIMELINE</span>
            <span style={{ color:C.goldLight, fontWeight:700, fontSize:16, fontFamily:"monospace" }}>{result.estimatedComplianceDays} working days</span>
            <span style={{ marginLeft:"auto", color:C.muted, fontSize:9, fontFamily:"monospace" }}>REGSENTINEL AI · {new Date().toISOString().split("T")[0]}</span>
          </div>
        </div>
      )}
      {result?.error && <div style={{ marginTop:12, padding:14, background:C.red+"12", border:`1px solid ${C.red}`, borderRadius:6, color:C.offWhite, fontSize:12 }}>{result.error}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FLOW 2 — DORA ICT RISK MAPPER (dynamic: CMDB + write-back)
// ══════════════════════════════════════════════════════════════════════════════
function Flow2({ assets, toast }) {
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [writingBack, setWritingBack] = useState(false);

  const selected = assets.find(a => a.id === selectedId);

  const SYSTEM = `You are RegSentinel AI, the DORA ICT Risk Mapper for Deutsche Bank.
Given live asset data, assess DORA posture and respond ONLY with JSON:
{
  "pillars": [
    { "name":"ICT Risk Management","status":"RED"|"AMBER"|"GREEN","gap":"one sentence","action":"specific action" },
    { "name":"ICT Incident Management","status":"RED"|"AMBER"|"GREEN","gap":"...","action":"..." },
    { "name":"Digital Resilience Testing","status":"RED"|"AMBER"|"GREEN","gap":"...","action":"..." },
    { "name":"Third-Party ICT Risk","status":"RED"|"AMBER"|"GREEN","gap":"...","action":"..." },
    { "name":"ICT Information Sharing","status":"RED"|"AMBER"|"GREEN","gap":"...","action":"..." }
  ],
  "overallRisk":"RED"|"AMBER"|"GREEN",
  "criticalityTier":"CRITICAL"|"IMPORTANT"|"STANDARD",
  "priorityAction":"single most urgent action",
  "estimatedRemediationWeeks": number,
  "doraArticlesTriggered": ["Art. XX","Art. YY"]
}
Only JSON.`;

  async function assess() {
    if (!selected) return;
    setLoading(true); setResult(null);
    try {
      const json = await callClaude(SYSTEM,
        `Asset: ${selected.name}\nType: ${selected.type}\nOwner: ${selected.owner}\nVendor: ${selected.vendor} (${selected.vendor==="Internal"?"no third-party contract":"third-party contract in scope"})\nCriticality: ${selected.criticality}\nRegion: ${selected.region}\nOpen vulnerabilities: ${selected.openVulns}\nTotal incidents (12mo): ${selected.incidents}\nSLA breaches: ${selected.slaBreaches}\nLast P1: ${selected.lastP1}\nIs AI system: ${selected.isAI}`
      );
      setResult(json);
    } catch(e) { setResult({ error:"Assessment failed." }); }
    setLoading(false);
  }

  async function writeBack() {
    setWritingBack(true);
    const ticket = await MockAPI.writeBack(selectedId, result);
    setWritingBack(false);
    toast(`DORA gap assessment written to ServiceNow · Remediation task ${ticket.ticketId} assigned to ${selected.owner}`);
  }

  const sc = { RED:C.red, AMBER:C.amber, GREEN:C.green };

  return (
    <div>
      <SLabel>Flow 2 — DORA ICT Risk Mapper · Live CMDB</SLabel>
      <h2 style={{ color:C.white, fontSize:20, margin:"4px 0 6px", fontWeight:800 }}>ICT Asset → DORA Resilience Assessment</h2>
      <p style={{ color:C.muted, fontSize:12, marginBottom:18 }}>
        Pulls every asset from the ServiceNow CMDB. Select one — RegSentinel maps it across all 5 DORA resilience pillars using live metadata and writes results back as a ServiceNow task.
      </p>

      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, padding:"8px 12px", background:C.navy, border:`1px solid ${C.teal}`, borderRadius:6 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:C.tealLight, animation:"pulse 2s infinite" }}/>
        <span style={{ color:C.teal, fontSize:10, fontFamily:"monospace", fontWeight:700 }}>LIVE · SERVICENOW CMDB · {assets.length} assets loaded</span>
        <span style={{ marginLeft:"auto", color:C.muted, fontSize:9, fontFamily:"monospace" }}>Sync: {new Date().toISOString().split("T")[0]}</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          <SLabel color={C.teal}>Select ICT Asset from CMDB</SLabel>
          <select value={selectedId} onChange={e=>{ setSelectedId(e.target.value); setResult(null); }}
            style={{ width:"100%", background:C.navy, border:`1px solid ${C.border}`, borderRadius:6, padding:"10px 12px", color:C.offWhite, fontSize:13, fontFamily:"monospace", outline:"none" }}>
            <option value="">— Select from CMDB —</option>
            {assets.map(a => <option key={a.id} value={a.id}>[{a.criticality}] {a.name}</option>)}
          </select>
        </div>
        {selected && (
          <Card style={{ padding:"10px 14px" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:7 }}>
              <Tag color={selected.criticality==="CRITICAL"?C.red:C.amber}>{selected.criticality}</Tag>
              <Tag color={C.teal}>{selected.type}</Tag>
              {selected.isAI && <Tag color={C.gold}>AI SYSTEM</Tag>}
              <Tag color={selected.vendor==="Internal"?C.green:C.amber}>{selected.vendor==="Internal"?"Internal":"3rd Party: "+selected.vendor}</Tag>
            </div>
            <div style={{ color:C.muted, fontSize:10, fontFamily:"monospace" }}>
              {selected.incidents} incidents · {selected.slaBreaches} SLA breaches · {selected.openVulns} open vulns
            </div>
          </Card>
        )}
      </div>

      <button onClick={assess} disabled={loading||!selectedId} style={{
        background:loading||!selectedId?C.border:C.teal, color:loading||!selectedId?C.muted:C.white,
        border:"none", borderRadius:6, padding:"10px 24px", fontSize:12, fontWeight:700,
        cursor:loading||!selectedId?"default":"pointer", fontFamily:"monospace", letterSpacing:1,
      }}>
        {loading ? <><Spinner color={C.teal}/>ASSESSING…</> : "▶  RUN DORA ASSESSMENT"}
      </button>

      {result && !result.error && (
        <div style={{ marginTop:22 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, background:C.navy, border:`2px solid ${sc[result.overallRisk]}`, borderRadius:8, padding:"12px 18px", marginBottom:14 }}>
            <span style={{ fontSize:24 }}>{result.overallRisk==="RED"?"🔴":result.overallRisk==="AMBER"?"🟡":"🟢"}</span>
            <div>
              <Badge color={sc[result.overallRisk]}>{result.overallRisk} — OVERALL POSTURE</Badge>
              <div style={{ color:C.muted, fontSize:10, fontFamily:"monospace", marginTop:3 }}>
                Articles triggered: {result.doraArticlesTriggered?.join(", ")}
              </div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:C.muted, fontSize:9, fontFamily:"monospace" }}>REMEDIATION</div>
                <div style={{ color:C.goldLight, fontWeight:700, fontFamily:"monospace" }}>{result.estimatedRemediationWeeks}w</div>
              </div>
              <button onClick={writeBack} disabled={writingBack} style={{
                background:C.green+"22", border:`1px solid ${C.green}`, color:C.green,
                borderRadius:5, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"monospace",
              }}>
                {writingBack ? <><Spinner size={12} color={C.green}/>WRITING…</> : "↑ CREATE TASK"}
              </button>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            {result.pillars?.map((p,i) => (
              <Card key={i} style={{ padding:12 }} accent={sc[p.status]+"44"}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ color:C.offWhite, fontSize:12, fontWeight:700 }}>{p.name}</span>
                  <Badge color={sc[p.status]} small>{p.status}</Badge>
                </div>
                <div style={{ color:C.muted, fontSize:11, marginBottom:6 }}>{p.gap}</div>
                <div style={{ padding:"5px 9px", borderRadius:4, background:sc[p.status]+"15", border:`1px solid ${sc[p.status]}44`, color:sc[p.status], fontSize:10, fontFamily:"monospace" }}>→ {p.action}</div>
              </Card>
            ))}
          </div>

          <div style={{ padding:"11px 16px", background:C.red+"12", border:`1px solid ${C.red}`, borderRadius:6, display:"flex", gap:10 }}>
            <span style={{ fontSize:16 }}>🎯</span>
            <div>
              <div style={{ color:C.red, fontSize:9, fontFamily:"monospace", fontWeight:700, marginBottom:2 }}>PRIORITY ACTION</div>
              <div style={{ color:C.offWhite, fontSize:12 }}>{result.priorityAction}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FLOW 3 — OVERLAP ENGINE (dynamic: auto-triggered + manual)
// ══════════════════════════════════════════════════════════════════════════════
function Flow3({ assets, incomingAsset, toast }) {
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Accept auto-trigger from webhook
  useEffect(() => {
    if (incomingAsset && incomingAsset.id !== selectedId) {
      setSelectedId(incomingAsset.id);
      setResult(null);
    }
  }, [incomingAsset]);

  const selected = assets.find(a => a.id === selectedId);

  const SYSTEM = `You are RegSentinel AI's Dual-Framework Overlap Engine.
Respond ONLY with JSON:
{
  "systemName": "inferred name",
  "doraInScope": true|false,
  "doraReason": "one sentence",
  "aiActInScope": true|false,
  "aiActReason": "one sentence",
  "overlapDetected": true|false,
  "overlapSeverity": "CRITICAL"|"HIGH"|"MEDIUM"|"LOW",
  "intersectionGap": "2 sentences describing the compliance gap",
  "unifiedRemediation": [
    { "action":"...", "framework":"DORA"|"AI Act"|"BOTH", "priority":"HIGH"|"MEDIUM"|"LOW" },
    { "action":"...", "framework":"DORA"|"AI Act"|"BOTH", "priority":"HIGH"|"MEDIUM"|"LOW" },
    { "action":"...", "framework":"DORA"|"AI Act"|"BOTH", "priority":"HIGH"|"MEDIUM"|"LOW" },
    { "action":"...", "framework":"DORA"|"AI Act"|"BOTH", "priority":"HIGH"|"MEDIUM"|"LOW" }
  ],
  "estimatedEffortReduction": "XX%",
  "singleOwnerRecommendation": "role title"
}
Only JSON.`;

  async function analyse() {
    if (!selected) return;
    setLoading(true); setResult(null);
    try {
      const json = await callClaude(SYSTEM,
        `Asset: ${selected.name}\nType: ${selected.type}\nIs AI System: ${selected.isAI}\nDORA Scope: ${selected.doraScope}\nCriticality: ${selected.criticality}\nOwner: ${selected.owner}\nVendor: ${selected.vendor}\nRegion: ${selected.region}\nIncidents (12mo): ${selected.incidents}\nLast P1: ${selected.lastP1}`
      );
      setResult(json);
      if (json.overlapDetected) toast(`Overlap DETECTED on ${selected.name} — unified remediation plan generated`);
    } catch(e) { setResult({ error:"Analysis failed." }); }
    setLoading(false);
  }

  const fw = { "DORA":C.teal, "AI Act":C.gold, "BOTH":C.red };
  const pri = { HIGH:C.red, MEDIUM:C.amber, LOW:C.green };

  return (
    <div>
      <SLabel>Flow 3 — Dual-Framework Overlap Engine · Auto-Trigger + Manual</SLabel>
      <h2 style={{ color:C.white, fontSize:20, margin:"4px 0 6px", fontWeight:800 }}>The Intersection Problem — Solved</h2>
      <p style={{ color:C.muted, fontSize:12, marginBottom:18 }}>
        Detects when one system is simultaneously in scope for DORA and the EU AI Act. Triggered automatically by the webhook feed, or run manually on any CMDB asset.
      </p>

      {incomingAsset && incomingAsset.id === selectedId && (
        <div style={{ marginBottom:12, padding:"8px 14px", background:C.purple+"18", border:`1px solid ${C.purple}`, borderRadius:6, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:14 }}>⚡</span>
          <span style={{ color:C.offWhite, fontSize:11, fontFamily:"monospace" }}>
            AUTO-TRIGGERED by webhook incident on <strong>{incomingAsset.name}</strong>
          </span>
          <Badge color={C.purple}>WEBHOOK</Badge>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          <SLabel color={C.purple}>Select Asset (or auto-populated from webhook)</SLabel>
          <select value={selectedId} onChange={e=>{ setSelectedId(e.target.value); setResult(null); }}
            style={{ width:"100%", background:C.navy, border:`1px solid ${incomingAsset?.id===selectedId?C.purple:C.border}`, borderRadius:6, padding:"10px 12px", color:C.offWhite, fontSize:13, fontFamily:"monospace", outline:"none" }}>
            <option value="">— Select asset —</option>
            {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        {selected && (
          <Card style={{ padding:"10px 14px" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {selected.doraScope && <Tag color={C.teal}>DORA SCOPE</Tag>}
              {selected.isAI && <Tag color={C.gold}>AI SYSTEM</Tag>}
              <Tag color={selected.criticality==="CRITICAL"?C.red:C.amber}>{selected.criticality}</Tag>
            </div>
            <div style={{ color:C.muted, fontSize:10, fontFamily:"monospace", marginTop:7 }}>
              {selected.owner} · {selected.vendor} · {selected.region}
            </div>
          </Card>
        )}
      </div>

      <button onClick={analyse} disabled={loading||!selectedId} style={{
        background:loading||!selectedId?C.border:C.purple, color:loading||!selectedId?C.muted:C.white,
        border:"none", borderRadius:6, padding:"10px 24px", fontSize:12, fontWeight:700,
        cursor:loading||!selectedId?"default":"pointer", fontFamily:"monospace", letterSpacing:1,
      }}>
        {loading ? <><Spinner color={C.purple}/>ANALYSING OVERLAP…</> : "▶  DETECT OVERLAP"}
      </button>

      {result && !result.error && (
        <div style={{ marginTop:22 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
            {[
              { label:"DORA In Scope", val:result.doraInScope, reason:result.doraReason, color:C.teal },
              { label:"EU AI Act In Scope", val:result.aiActInScope, reason:result.aiActReason, color:C.gold },
              { label:"Overlap Detected", val:result.overlapDetected, reason:result.overlapSeverity+" SEVERITY", color:C.red },
            ].map(item => (
              <Card key={item.label} style={{ padding:12 }} accent={item.val?item.color:C.border}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ color:C.muted, fontSize:9, fontFamily:"monospace" }}>{item.label}</span>
                  <span>{item.val?"✅":"⬜"}</span>
                </div>
                <div style={{ color:item.val?item.color:C.muted, fontSize:10, fontFamily:"monospace" }}>{item.reason}</div>
              </Card>
            ))}
          </div>

          {result.overlapDetected && <>
            <div style={{ padding:"12px 16px", marginBottom:12, background:C.red+"10", border:`1px solid ${C.red}`, borderRadius:6 }}>
              <div style={{ color:C.red, fontSize:9, fontFamily:"monospace", fontWeight:700, marginBottom:4 }}>⚡ INTERSECTION GAP</div>
              <p style={{ color:C.offWhite, fontSize:12, lineHeight:1.7, margin:0 }}>{result.intersectionGap}</p>
            </div>

            <SLabel>Unified Remediation · Single Owner: {result.singleOwnerRecommendation}</SLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
              {result.unifiedRemediation?.map((r,i) => (
                <div key={i} style={{ padding:"9px 12px", background:C.navy, border:`1px solid ${C.border}`, borderRadius:6, display:"flex", gap:8 }}>
                  <span style={{ color:fw[r.framework]||C.teal, fontSize:14 }}>▸</span>
                  <div>
                    <div style={{ display:"flex", gap:5, marginBottom:3 }}>
                      <Badge color={fw[r.framework]||C.teal} small>{r.framework}</Badge>
                      <Badge color={pri[r.priority]||C.muted} small>{r.priority}</Badge>
                    </div>
                    <div style={{ color:C.offWhite, fontSize:11 }}>{r.action}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding:"10px 16px", background:C.green+"10", border:`1px solid ${C.green}`, borderRadius:6, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ textAlign:"center", minWidth:70 }}>
                <div style={{ color:C.green, fontSize:26, fontWeight:800, fontFamily:"monospace" }}>{result.estimatedEffortReduction}</div>
                <div style={{ color:C.muted, fontSize:9, fontFamily:"monospace" }}>EFFORT SAVED</div>
              </div>
              <div style={{ color:C.offWhite, fontSize:12 }}>Unified DORA + AI Act plan under one owner eliminates duplicate evidence collection, parallel audits, and siloed remediation tracks.</div>
            </div>
          </>}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAYER 3 — WEBHOOK INCIDENT FEED (real-time panel)
// ══════════════════════════════════════════════════════════════════════════════
function WebhookPanel({ events, setEvents, paused, setPaused, onTriggerOverlap, toast }) {
  const [processing, setProcessing] = useState({});

  async function handleAck(evt) {
    setProcessing(p => ({ ...p, [evt.id]:"acking" }));
    const ticket = await MockAPI.createIncidentTask(evt);
    setEvents(prev => prev.map(e => e.id===evt.id ? { ...e, status:"ACKNOWLEDGED", ticketId:ticket.ticketId } : e));
    setProcessing(p => { const n={...p}; delete n[evt.id]; return n; });
    toast(`Incident acknowledged · Task ${ticket.ticketId} created in ServiceNow`);
  }

  function handleOverlap(evt) {
    onTriggerOverlap(evt.asset);
    toast(`Overlap analysis triggered for ${evt.asset.name}`);
  }

  return (
    <div style={{ background:C.navyCard, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden", height:"100%" }}>
      <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:paused?C.amber:C.green, animation:paused?"none":"pulse 2s infinite" }}/>
        <span style={{ color:C.white, fontWeight:700, fontSize:13 }}>Live Incident Feed</span>
        <span style={{ color:C.muted, fontSize:10, fontFamily:"monospace" }}>ServiceNow · Azure Monitor · SWIFT</span>
        <button onClick={()=>setPaused(p=>!p)} style={{ marginLeft:"auto", background:"transparent", border:`1px solid ${paused?C.green:C.amber}`, color:paused?C.green:C.amber, borderRadius:4, padding:"3px 10px", fontSize:10, cursor:"pointer", fontFamily:"monospace" }}>
          {paused ? "▶ RESUME":"⏸ PAUSE"}
        </button>
      </div>
      <div style={{ overflowY:"auto", maxHeight:520 }}>
        {events.length===0 && (
          <div style={{ padding:20, color:C.muted, fontSize:12, textAlign:"center", fontFamily:"monospace" }}>
            Waiting for incidents…
          </div>
        )}
        {events.map(evt => (
          <div key={evt.id} style={{ padding:"10px 14px", borderBottom:`1px solid ${C.border}44`, background:evt.status==="ACKNOWLEDGED"?C.navy+"80":"transparent" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
              <Badge color={evt.severity==="P1"?C.red:C.amber} small>{evt.severity}</Badge>
              {evt.requiresDORA && <Badge color={C.teal} small>DORA</Badge>}
              {evt.requiresAIAct && <Badge color={C.gold} small>AI ACT</Badge>}
              {evt.status==="ACKNOWLEDGED" && <Badge color={C.green} small>ACK ✓</Badge>}
              <span style={{ marginLeft:"auto", color:C.muted, fontSize:9, fontFamily:"monospace" }}>
                {new Date(evt.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div style={{ color:C.offWhite, fontSize:11, marginBottom:4 }}>{evt.summary}</div>
            <div style={{ color:C.muted, fontSize:9, fontFamily:"monospace", marginBottom:evt.status!=="ACKNOWLEDGED"?7:0 }}>
              {evt.asset?.name} · {evt.source}
              {evt.ticketId && ` · ${evt.ticketId}`}
            </div>
            {evt.status !== "ACKNOWLEDGED" && (
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>handleAck(evt)} disabled={!!processing[evt.id]} style={{ background:C.green+"20", border:`1px solid ${C.green}`, color:C.green, borderRadius:4, padding:"3px 9px", fontSize:9, cursor:"pointer", fontFamily:"monospace" }}>
                  {processing[evt.id]==="acking" ? "…":"✓ ACK"}
                </button>
                {evt.requiresDORA && evt.requiresAIAct && (
                  <button onClick={()=>handleOverlap(evt)} style={{ background:C.purple+"20", border:`1px solid ${C.purple}`, color:C.purple, borderRadius:4, padding:"3px 9px", fontSize:9, cursor:"pointer", fontFamily:"monospace" }}>
                    ⚡ OVERLAP
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REGULATORY FEED PANEL
// ══════════════════════════════════════════════════════════════════════════════
function RegFeedPanel({ feed }) {
  const urgColor = { HIGH:C.red, MEDIUM:C.amber, LOW:C.green };
  return (
    <div style={{ background:C.navyCard, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:C.gold, animation:"pulse 3s infinite" }}/>
        <span style={{ color:C.white, fontWeight:700, fontSize:12 }}>Regulatory Feed</span>
        <span style={{ color:C.muted, fontSize:10, fontFamily:"monospace" }}>BaFin · EBA · ECB · EUR-Lex</span>
      </div>
      {feed.map(item => (
        <div key={item.id} style={{ padding:"9px 14px", borderBottom:`1px solid ${C.border}44` }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <Badge color={urgColor[item.urgency]} small>{item.urgency}</Badge>
            <Badge color={C.muted} small>{item.source}</Badge>
            <span style={{ marginLeft:"auto", color:C.muted, fontSize:9, fontFamily:"monospace" }}>{item.date}</span>
          </div>
          <div style={{ color:C.offWhite, fontSize:11 }}>{item.title}</div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function RegSentinelDynamic() {
  const [activeFlow, setActiveFlow] = useState(0);
  const [assets, setAssets] = useState([]);
  const [regFeed, setRegFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoTriggerAsset, setAutoTriggerAsset] = useState(null);
  const [toast, setToast] = useState(null);
  const { events, setEvents, paused, setPaused } = useWebhookFeed();
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPulse(p => (p+1)%100), 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Promise.all([MockAPI.getAssets(), MockAPI.getRegulatoryFeed()])
      .then(([a, r]) => { setAssets(a); setRegFeed(r); setLoading(false); });
  }, []);

  function showToast(msg) {
    setToast(msg);
  }

  function handleTriggerOverlap(asset) {
    setAutoTriggerAsset(asset);
    setActiveFlow(2);
  }

  const flows = [
    { id:0, label:"AI Act Classifier", icon:"🔍", color:C.gold },
    { id:1, label:"DORA Risk Mapper", icon:"🛡", color:C.teal },
    { id:2, label:"Overlap Engine", icon:"⚡", color:C.purple },
  ];

  const segments = Array.from({length:18},(_,i) => Math.sin((i/18)*Math.PI*2 + pulse*0.1)*0.4+0.6);

  return (
    <div style={{ minHeight:"100vh", background:C.navy, color:C.white, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }
      `}</style>

      {toast && <Toast message={toast} onClose={()=>setToast(null)}/>}

      {/* Header */}
      <div style={{ background:C.navyMid, borderBottom:`1px solid ${C.border}`, padding:"0 24px" }}>
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center", gap:14, padding:"12px 0" }}>
          <div style={{ background:C.gold, color:C.navy, fontWeight:900, fontSize:14, padding:"3px 9px", borderRadius:3, fontFamily:"monospace" }}>db</div>
          <div>
            <div style={{ fontWeight:800, fontSize:16 }}>RegSentinel <span style={{ color:C.gold }}>AI</span> <span style={{ color:C.teal, fontSize:11, fontFamily:"monospace", fontWeight:400 }}>DYNAMIC</span></div>
            <div style={{ color:C.muted, fontSize:9, fontFamily:"monospace", letterSpacing:2 }}>DORA · EU AI ACT · LIVE INTEGRATION</div>
          </div>
          {/* Integration status row */}
          <div style={{ display:"flex", gap:8, marginLeft:16 }}>
            {[
              { label:"CMDB", status:!loading, color:C.teal },
              { label:"AI Registry", status:!loading, color:C.gold },
              { label:"Webhook", status:!paused, color:C.green },
              { label:"BaFin Feed", status:!loading, color:C.amber },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", background:C.navy, borderRadius:4, border:`1px solid ${C.border}` }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:s.status?s.color:C.muted, animation:s.status?"pulse 2s infinite":"none" }}/>
                <span style={{ fontSize:9, fontFamily:"monospace", color:s.status?s.color:C.muted }}>{s.label}</span>
              </div>
            ))}
          </div>
          {/* Pulse bar */}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"flex-end", gap:2, height:24 }}>
            {segments.map((h,i) => (
              <div key={i} style={{ width:3, borderRadius:2, height:`${h*24}px`, background:h>0.7?C.green:h>0.45?C.amber:C.red, transition:"height 0.12s ease", opacity:0.8 }}/>
            ))}
            <span style={{ color:C.muted, fontSize:8, fontFamily:"monospace", marginLeft:6, alignSelf:"center" }}>COMPLIANCE PULSE</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background:C.navyMid, borderBottom:`1px solid ${C.border}`, padding:"0 24px" }}>
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex" }}>
          {flows.map(f => (
            <button key={f.id} onClick={()=>setActiveFlow(f.id)} style={{
              background:"transparent", border:"none",
              borderBottom:activeFlow===f.id?`2px solid ${f.color}`:"2px solid transparent",
              color:activeFlow===f.id?C.white:C.muted, padding:"12px 22px",
              fontSize:12, fontWeight:activeFlow===f.id?700:400, cursor:"pointer",
              fontFamily:"inherit", display:"flex", alignItems:"center", gap:6,
            }}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout: 2/3 flows + 1/3 webhook sidebar */}
      <div style={{ maxWidth:1400, margin:"0 auto", padding:24, display:"grid", gridTemplateColumns:"1fr 340px", gap:20, alignItems:"start" }}>
        {loading ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, color:C.muted, fontFamily:"monospace", fontSize:13 }}>
            <Spinner size={20}/>Loading live data from CMDB & Regulatory Feed…
          </div>
        ) : (
          <div>
            {activeFlow===0 && <Flow1 assets={assets} toast={showToast}/>}
            {activeFlow===1 && <Flow2 assets={assets} toast={showToast}/>}
            {activeFlow===2 && <Flow3 assets={assets} incomingAsset={autoTriggerAsset} toast={showToast}/>}
          </div>
        )}

        {/* Right sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <WebhookPanel events={events} setEvents={setEvents} paused={paused} setPaused={setPaused} onTriggerOverlap={handleTriggerOverlap} toast={showToast}/>
          <RegFeedPanel feed={regFeed}/>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${C.border}`, padding:"12px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ color:C.muted, fontSize:10, fontFamily:"monospace" }}>RegSentinel AI Dynamic · DB Global Hackathon 2026 · Architecture: Mock API → Claude Sonnet 4.6 → ServiceNow Write-back</span>
        <div style={{ display:"flex", gap:10 }}>
          {["ServiceNow CMDB","AI Registry","BaFin API","EUR-Lex","Azure Monitor","SWIFT Alliance"].map(s=>(
            <span key={s} style={{ color:C.border, fontSize:9, fontFamily:"monospace", borderLeft:`1px solid ${C.border}`, paddingLeft:10 }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
