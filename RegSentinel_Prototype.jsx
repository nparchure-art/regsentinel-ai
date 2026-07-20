import { useState, useEffect, useRef } from "react";

// ── Design tokens ────────────────────────────────────────────────────────────
// Palette: deep EU-navy + sovereign-gold + trust-teal on near-black surfaces
// Signature element: a live "compliance pulse" status bar that breathes
// Typography: system monospace for data fields (authority + legibility),
//             clean sans for prose — mimics regulatory document aesthetics

const T = {
  navy:    "#001A3A",
  navyMid: "#002E5F",
  navyCard:"#05305E",
  gold:    "#C8922A",
  goldLight:"#E5B84D",
  teal:    "#00869A",
  tealLight:"#00A8C0",
  green:   "#2D8653",
  red:     "#C0392B",
  amber:   "#D4820A",
  white:   "#FFFFFF",
  offWhite:"#E8EEF7",
  muted:   "#8899AA",
  border:  "#1A3A5C",
};

// ── Claude API helper ────────────────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ── Shared UI primitives ─────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      display:"inline-block", width:18, height:18,
      border:`2px solid ${T.border}`, borderTopColor:T.gold,
      borderRadius:"50%", animation:"spin 0.7s linear infinite",
      verticalAlign:"middle", marginRight:8,
    }}/>
  );
}

function Badge({ color, children }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 10px", borderRadius:4,
      background:color+"22", border:`1px solid ${color}`,
      color:color, fontSize:11, fontWeight:700, letterSpacing:1,
      textTransform:"uppercase", fontFamily:"monospace",
    }}>{children}</span>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{
      background:T.navyCard, border:`1px solid ${T.border}`,
      borderRadius:10, padding:24, ...style,
    }}>{children}</div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize:10, letterSpacing:3, textTransform:"uppercase",
      color:T.gold, fontFamily:"monospace", fontWeight:700, marginBottom:6,
    }}>{children}</div>
  );
}

function ResultBlock({ children, accent=T.teal }) {
  return (
    <div style={{
      background:T.navy, border:`1px solid ${accent}`,
      borderLeft:`4px solid ${accent}`, borderRadius:6,
      padding:16, marginTop:12, fontFamily:"monospace",
      fontSize:13, color:T.offWhite, lineHeight:1.7,
      whiteSpace:"pre-wrap", wordBreak:"break-word",
    }}>{children}</div>
  );
}

// ── Flow 1: AI Act Risk Classifier ───────────────────────────────────────────
function Flow1() {
  const [desc, setDesc]     = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const SYSTEM = `You are RegSentinel AI, the EU AI Act Risk Classification engine for Deutsche Bank.
When given an AI system description, respond ONLY with a JSON object in this exact shape:
{
  "riskTier": "HIGH_RISK" | "LIMITED_RISK" | "MINIMAL_RISK" | "PROHIBITED",
  "aiActArticle": "e.g. Article 6, Annex III §5",
  "rationale": "2-3 sentence plain-English rationale",
  "requiredControls": ["control 1", "control 2", "control 3", "control 4"],
  "doraOverlap": true | false,
  "doraReason": "one sentence if doraOverlap is true, else null",
  "estimatedComplianceDays": number
}
No markdown, no preamble, only the JSON object.`;

  async function classify() {
    if (!desc.trim()) return;
    setLoading(true); setResult(null);
    try {
      const raw = await callClaude(SYSTEM, `AI System Description: ${desc}`);
      const json = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setResult(json);
    } catch(e) { setResult({ error: "Classification failed. Please retry." }); }
    setLoading(false);
  }

  const tierColor = {
    HIGH_RISK: T.red, LIMITED_RISK: T.amber,
    MINIMAL_RISK: T.green, PROHIBITED: "#8B0000",
  };

  const examples = [
    "Credit scoring model that determines retail loan eligibility",
    "Chatbot for answering FAQ on savings accounts",
    "Biometric facial recognition for branch entry",
    "Robo-adviser allocating client investment portfolios",
  ];

  return (
    <div>
      <SectionLabel>Flow 1 — EU AI Act Risk Classifier</SectionLabel>
      <h2 style={{ color:T.white, fontSize:22, margin:"4px 0 8px", fontWeight:700 }}>
        AI System Intake → Auto-Classification
      </h2>
      <p style={{ color:T.muted, fontSize:13, marginBottom:20 }}>
        Describe any AI system. RegSentinel classifies its EU AI Act risk tier and generates required controls — in seconds.
      </p>

      {/* Quick examples */}
      <div style={{ marginBottom:14 }}>
        <span style={{ color:T.muted, fontSize:11, fontFamily:"monospace", marginRight:8 }}>EXAMPLES →</span>
        {examples.map(ex => (
          <button key={ex} onClick={() => setDesc(ex)} style={{
            background:"transparent", border:`1px solid ${T.border}`,
            color:T.muted, fontSize:11, borderRadius:4, padding:"3px 8px",
            marginRight:6, marginBottom:6, cursor:"pointer", fontFamily:"monospace",
            transition:"all 0.15s",
          }}
          onMouseEnter={e=>{e.target.style.borderColor=T.gold;e.target.style.color=T.gold;}}
          onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.muted;}}
          >{ex.slice(0,40)}…</button>
        ))}
      </div>

      <textarea
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Describe the AI system — its purpose, what decisions it influences, who it affects…"
        rows={4}
        style={{
          width:"100%", background:T.navy, border:`1px solid ${T.border}`,
          borderRadius:6, padding:14, color:T.offWhite, fontSize:14,
          fontFamily:"inherit", resize:"vertical", outline:"none",
          boxSizing:"border-box", transition:"border 0.2s",
        }}
        onFocus={e=>e.target.style.borderColor=T.gold}
        onBlur={e=>e.target.style.borderColor=T.border}
      />

      <button onClick={classify} disabled={loading || !desc.trim()} style={{
        marginTop:12, background: loading||!desc.trim() ? T.border : T.gold,
        color: loading||!desc.trim() ? T.muted : T.navy,
        border:"none", borderRadius:6, padding:"10px 28px",
        fontSize:13, fontWeight:700, cursor: loading||!desc.trim() ? "default":"pointer",
        fontFamily:"monospace", letterSpacing:1, transition:"all 0.2s",
      }}>
        {loading ? <><Spinner/>CLASSIFYING…</> : "▶  CLASSIFY SYSTEM"}
      </button>

      {result && !result.error && (
        <div style={{ marginTop:24 }}>
          {/* Risk tier header */}
          <div style={{
            display:"flex", alignItems:"center", gap:14,
            background:T.navy, border:`2px solid ${tierColor[result.riskTier]||T.teal}`,
            borderRadius:8, padding:"14px 20px", marginBottom:16,
          }}>
            <div style={{
              fontSize:32,
              color:tierColor[result.riskTier]||T.teal,
            }}>
              {result.riskTier==="HIGH_RISK"?"⚠️":result.riskTier==="PROHIBITED"?"🚫":result.riskTier==="LIMITED_RISK"?"⚡":"✅"}
            </div>
            <div>
              <Badge color={tierColor[result.riskTier]||T.teal}>{result.riskTier?.replace("_"," ")}</Badge>
              <div style={{ color:T.muted, fontSize:11, fontFamily:"monospace", marginTop:4 }}>
                {result.aiActArticle}
              </div>
            </div>
            {result.doraOverlap && (
              <div style={{ marginLeft:"auto" }}>
                <Badge color={T.amber}>DORA OVERLAP DETECTED</Badge>
              </div>
            )}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Card>
              <SectionLabel>Rationale</SectionLabel>
              <p style={{ color:T.offWhite, fontSize:13, lineHeight:1.7, margin:0 }}>{result.rationale}</p>
              {result.doraOverlap && (
                <div style={{
                  marginTop:12, padding:"8px 12px", borderRadius:5,
                  background:T.amber+"18", border:`1px solid ${T.amber}`,
                  color:T.amber, fontSize:12, fontFamily:"monospace",
                }}>⚡ DORA: {result.doraReason}</div>
              )}
            </Card>
            <Card>
              <SectionLabel>Required Controls</SectionLabel>
              {result.requiredControls?.map((c,i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"flex-start", gap:8,
                  marginBottom:8, fontSize:13, color:T.offWhite,
                }}>
                  <span style={{ color:T.teal, fontFamily:"monospace", minWidth:20 }}>{i+1}.</span>
                  {c}
                </div>
              ))}
            </Card>
          </div>

          <div style={{
            marginTop:14, padding:"10px 16px", background:T.navy,
            border:`1px solid ${T.border}`, borderRadius:6,
            display:"flex", alignItems:"center", gap:16,
          }}>
            <span style={{ color:T.muted, fontSize:12, fontFamily:"monospace" }}>EST. COMPLIANCE TIMELINE</span>
            <span style={{ color:T.goldLight, fontWeight:700, fontSize:18, fontFamily:"monospace" }}>
              {result.estimatedComplianceDays} working days
            </span>
            <span style={{ color:T.muted, fontSize:11, marginLeft:"auto", fontFamily:"monospace" }}>
              GENERATED BY REGSENTINEL AI · {new Date().toISOString().split("T")[0]}
            </span>
          </div>
        </div>
      )}
      {result?.error && (
        <ResultBlock accent={T.red}>{result.error}</ResultBlock>
      )}
    </div>
  );
}

// ── Flow 2: DORA ICT Asset Gap Dashboard ─────────────────────────────────────
function Flow2() {
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("Core Banking Platform");
  const [vendor, setVendor]       = useState("");
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);

  const SYSTEM = `You are RegSentinel AI, the DORA ICT Risk Mapper for Deutsche Bank.
Given an ICT asset, assess its posture across DORA's 5 pillars and respond ONLY with JSON:
{
  "pillars": [
    { "name": "ICT Risk Management", "status": "RED"|"AMBER"|"GREEN", "gap": "one-sentence gap description", "action": "specific remediation action" },
    { "name": "ICT Incident Management", "status": "RED"|"AMBER"|"GREEN", "gap": "...", "action": "..." },
    { "name": "Digital Resilience Testing", "status": "RED"|"AMBER"|"GREEN", "gap": "...", "action": "..." },
    { "name": "Third-Party ICT Risk", "status": "RED"|"AMBER"|"GREEN", "gap": "...", "action": "..." },
    { "name": "ICT Information Sharing", "status": "RED"|"AMBER"|"GREEN", "gap": "...", "action": "..." }
  ],
  "overallRisk": "RED"|"AMBER"|"GREEN",
  "criticalityTier": "CRITICAL"|"IMPORTANT"|"STANDARD",
  "priorityAction": "The single most urgent action to take",
  "estimatedRemediationWeeks": number
}
Only JSON, no markdown.`;

  async function assess() {
    if (!assetName.trim()) return;
    setLoading(true); setResult(null);
    try {
      const raw = await callClaude(SYSTEM,
        `Asset: ${assetName}\nType: ${assetType}\nVendor/Owner: ${vendor||"Internal"}`);
      const json = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setResult(json);
    } catch(e) { setResult({ error: "Assessment failed. Please retry." }); }
    setLoading(false);
  }

  const statusColor = { RED:T.red, AMBER:T.amber, GREEN:T.green };
  const statusIcon  = { RED:"●", AMBER:"●", GREEN:"●" };

  const assetTypes = [
    "Core Banking Platform","Payment Processing System","Credit Scoring Model",
    "Customer Data Platform","Trading System","Identity & Authentication",
    "Cloud Infrastructure","API Gateway","Data Warehouse",
  ];

  return (
    <div>
      <SectionLabel>Flow 2 — DORA ICT Risk Mapper</SectionLabel>
      <h2 style={{ color:T.white, fontSize:22, margin:"4px 0 8px", fontWeight:700 }}>
        ICT Asset → DORA Resilience Assessment
      </h2>
      <p style={{ color:T.muted, fontSize:13, marginBottom:20 }}>
        Enter any ICT asset. RegSentinel maps it across DORA's 5 resilience pillars and generates a prioritised remediation plan.
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          <SectionLabel>Asset Name</SectionLabel>
          <input value={assetName} onChange={e=>setAssetName(e.target.value)}
            placeholder="e.g. DB Core Banking System"
            style={{
              width:"100%", background:T.navy, border:`1px solid ${T.border}`,
              borderRadius:6, padding:"10px 14px", color:T.offWhite, fontSize:13,
              fontFamily:"monospace", outline:"none", boxSizing:"border-box",
            }}
            onFocus={e=>e.target.style.borderColor=T.teal}
            onBlur={e=>e.target.style.borderColor=T.border}
          />
        </div>
        <div>
          <SectionLabel>Asset Type</SectionLabel>
          <select value={assetType} onChange={e=>setAssetType(e.target.value)}
            style={{
              width:"100%", background:T.navy, border:`1px solid ${T.border}`,
              borderRadius:6, padding:"10px 14px", color:T.offWhite, fontSize:13,
              fontFamily:"monospace", outline:"none", boxSizing:"border-box",
            }}>
            {assetTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <SectionLabel>Vendor / Owner</SectionLabel>
          <input value={vendor} onChange={e=>setVendor(e.target.value)}
            placeholder="e.g. SAP / Internal"
            style={{
              width:"100%", background:T.navy, border:`1px solid ${T.border}`,
              borderRadius:6, padding:"10px 14px", color:T.offWhite, fontSize:13,
              fontFamily:"monospace", outline:"none", boxSizing:"border-box",
            }}
            onFocus={e=>e.target.style.borderColor=T.teal}
            onBlur={e=>e.target.style.borderColor=T.border}
          />
        </div>
      </div>

      <button onClick={assess} disabled={loading||!assetName.trim()} style={{
        background: loading||!assetName.trim() ? T.border : T.teal,
        color: loading||!assetName.trim() ? T.muted : T.white,
        border:"none", borderRadius:6, padding:"10px 28px",
        fontSize:13, fontWeight:700, cursor: loading||!assetName.trim()?"default":"pointer",
        fontFamily:"monospace", letterSpacing:1, transition:"all 0.2s",
      }}>
        {loading ? <><Spinner/>ASSESSING…</> : "▶  RUN DORA ASSESSMENT"}
      </button>

      {result && !result.error && (
        <div style={{ marginTop:24 }}>
          {/* Overall status bar */}
          <div style={{
            display:"flex", alignItems:"center", gap:16,
            background:T.navy, border:`2px solid ${statusColor[result.overallRisk]}`,
            borderRadius:8, padding:"14px 20px", marginBottom:16,
          }}>
            <div style={{ color:statusColor[result.overallRisk], fontSize:28 }}>
              {result.overallRisk==="RED"?"🔴":result.overallRisk==="AMBER"?"🟡":"🟢"}
            </div>
            <div>
              <Badge color={statusColor[result.overallRisk]}>
                {result.overallRisk} — OVERALL POSTURE
              </Badge>
              <div style={{ color:T.muted, fontSize:11, fontFamily:"monospace", marginTop:4 }}>
                Criticality: {result.criticalityTier}
              </div>
            </div>
            <div style={{ marginLeft:"auto", textAlign:"right" }}>
              <div style={{ color:T.muted, fontSize:10, fontFamily:"monospace" }}>EST. REMEDIATION</div>
              <div style={{ color:T.goldLight, fontWeight:700, fontFamily:"monospace", fontSize:16 }}>
                {result.estimatedRemediationWeeks}w
              </div>
            </div>
          </div>

          {/* 5 pillars */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            {result.pillars?.map((p,i) => (
              <Card key={i} style={{ padding:14 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ color:T.offWhite, fontSize:12, fontWeight:700 }}>{p.name}</span>
                  <span style={{ color:statusColor[p.status], fontSize:18 }}>
                    {statusIcon[p.status]}
                  </span>
                </div>
                <div style={{ color:T.muted, fontSize:11, marginBottom:6 }}>{p.gap}</div>
                <div style={{
                  padding:"6px 10px", borderRadius:4,
                  background:statusColor[p.status]+"18",
                  border:`1px solid ${statusColor[p.status]}44`,
                  color:statusColor[p.status], fontSize:11, fontFamily:"monospace",
                }}>→ {p.action}</div>
              </Card>
            ))}
          </div>

          {/* Priority action */}
          <div style={{
            padding:"12px 18px", background:T.red+"18",
            border:`1px solid ${T.red}`, borderRadius:6,
            display:"flex", alignItems:"flex-start", gap:12,
          }}>
            <span style={{ fontSize:18 }}>🎯</span>
            <div>
              <div style={{ color:T.red, fontSize:10, fontFamily:"monospace", fontWeight:700, marginBottom:3 }}>
                PRIORITY ACTION
              </div>
              <div style={{ color:T.offWhite, fontSize:13 }}>{result.priorityAction}</div>
            </div>
          </div>
        </div>
      )}
      {result?.error && <ResultBlock accent={T.red}>{result.error}</ResultBlock>}
    </div>
  );
}

// ── Flow 3: Dual-Framework Overlap Engine ────────────────────────────────────
function Flow3() {
  const [systemDesc, setSystemDesc] = useState("");
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);

  const SYSTEM = `You are RegSentinel AI's Dual-Framework Overlap Engine.
Analyse the AI system described and detect whether it is simultaneously in scope for both DORA and the EU AI Act.
Respond ONLY with this JSON:
{
  "systemName": "short inferred name",
  "doraInScope": true|false,
  "doraReason": "one sentence",
  "aiActInScope": true|false,
  "aiActReason": "one sentence",
  "overlapDetected": true|false,
  "overlapSeverity": "CRITICAL"|"HIGH"|"MEDIUM"|"LOW",
  "intersectionGap": "2-sentence description of the compliance gap that exists because both frameworks apply simultaneously",
  "unifiedRemediation": [
    { "action": "action text", "framework": "DORA"|"AI Act"|"BOTH", "priority": "HIGH"|"MEDIUM"|"LOW" },
    { "action": "action text", "framework": "DORA"|"AI Act"|"BOTH", "priority": "HIGH"|"MEDIUM"|"LOW" },
    { "action": "action text", "framework": "DORA"|"AI Act"|"BOTH", "priority": "HIGH"|"MEDIUM"|"LOW" },
    { "action": "action text", "framework": "DORA"|"AI Act"|"BOTH", "priority": "HIGH"|"MEDIUM"|"LOW" }
  ],
  "estimatedEffortReduction": "percentage as string e.g. 58%",
  "singleOwnerRecommendation": "role title e.g. Chief Compliance Officer"
}
Only JSON, no markdown.`;

  const presets = [
    { label:"Credit Scoring AI", text:"An AI model that automatically determines credit limits and loan eligibility for retail banking customers, running on DB's core banking infrastructure." },
    { label:"AML Detection Engine", text:"A machine learning system that screens all SWIFT and SEPA transactions in real time to detect money laundering patterns and generate alerts." },
    { label:"Robo-Adviser", text:"An automated investment advisory platform that allocates client portfolio assets in Private Banking Germany based on risk profiling and market signals." },
  ];

  async function analyse() {
    if (!systemDesc.trim()) return;
    setLoading(true); setResult(null);
    try {
      const raw = await callClaude(SYSTEM, systemDesc);
      const json = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setResult(json);
    } catch(e) { setResult({ error:"Analysis failed. Please retry." }); }
    setLoading(false);
  }

  const fwColor = { "DORA":T.teal, "AI Act":T.gold, "BOTH":T.red };
  const priColor = { HIGH:T.red, MEDIUM:T.amber, LOW:T.green };

  return (
    <div>
      <SectionLabel>Flow 3 — Dual-Framework Overlap Engine</SectionLabel>
      <h2 style={{ color:T.white, fontSize:22, margin:"4px 0 8px", fontWeight:700 }}>
        The Intersection Problem — Solved
      </h2>
      <p style={{ color:T.muted, fontSize:13, marginBottom:20 }}>
        Detect when one system is in scope for both DORA and the EU AI Act simultaneously — the compliance gap no single framework captures.
      </p>

      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        {presets.map(p => (
          <button key={p.label} onClick={() => setSystemDesc(p.text)} style={{
            background:"transparent", border:`1px solid ${T.border}`,
            color:T.muted, fontSize:11, borderRadius:4, padding:"4px 12px",
            cursor:"pointer", fontFamily:"monospace", transition:"all 0.15s",
          }}
          onMouseEnter={e=>{e.target.style.borderColor=T.teal;e.target.style.color=T.teal;}}
          onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.muted;}}
          >{p.label}</button>
        ))}
      </div>

      <textarea value={systemDesc} onChange={e=>setSystemDesc(e.target.value)}
        placeholder="Describe the AI system — its function, the infrastructure it runs on, and who it makes decisions for…"
        rows={4}
        style={{
          width:"100%", background:T.navy, border:`1px solid ${T.border}`,
          borderRadius:6, padding:14, color:T.offWhite, fontSize:14,
          fontFamily:"inherit", resize:"vertical", outline:"none", boxSizing:"border-box",
        }}
        onFocus={e=>e.target.style.borderColor=T.teal}
        onBlur={e=>e.target.style.borderColor=T.border}
      />

      <button onClick={analyse} disabled={loading||!systemDesc.trim()} style={{
        marginTop:12,
        background: loading||!systemDesc.trim() ? T.border : "#6B21A8",
        color: loading||!systemDesc.trim() ? T.muted : T.white,
        border:"none", borderRadius:6, padding:"10px 28px",
        fontSize:13, fontWeight:700, cursor: loading||!systemDesc.trim()?"default":"pointer",
        fontFamily:"monospace", letterSpacing:1, transition:"all 0.2s",
      }}>
        {loading ? <><Spinner/>ANALYSING OVERLAP…</> : "▶  DETECT OVERLAP"}
      </button>

      {result && !result.error && (
        <div style={{ marginTop:24 }}>
          {/* Scope indicators */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
            {[
              { label:"DORA In Scope", val:result.doraInScope, reason:result.doraReason, color:T.teal },
              { label:"EU AI Act In Scope", val:result.aiActInScope, reason:result.aiActReason, color:T.gold },
              { label:"Overlap Detected", val:result.overlapDetected, reason:result.overlapSeverity+" SEVERITY", color:T.red },
            ].map(item => (
              <Card key={item.label} style={{ padding:14, borderColor: item.val ? item.color : T.border }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ color:T.muted, fontSize:10, fontFamily:"monospace" }}>{item.label}</span>
                  <span style={{ fontSize:18 }}>{item.val ? "✅":"⬜"}</span>
                </div>
                <div style={{ color: item.val ? item.color : T.muted, fontSize:11, fontFamily:"monospace" }}>
                  {item.reason}
                </div>
              </Card>
            ))}
          </div>

          {result.overlapDetected && (
            <>
              {/* Intersection gap */}
              <div style={{
                padding:"14px 18px", marginBottom:16,
                background:T.red+"12", border:`1px solid ${T.red}`,
                borderRadius:6,
              }}>
                <div style={{ color:T.red, fontSize:10, fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>
                  ⚡ INTERSECTION GAP
                </div>
                <p style={{ color:T.offWhite, fontSize:13, lineHeight:1.7, margin:0 }}>
                  {result.intersectionGap}
                </p>
              </div>

              {/* Unified remediation plan */}
              <SectionLabel>Unified Remediation Plan — Single Owner: {result.singleOwnerRecommendation}</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                {result.unifiedRemediation?.map((r,i) => (
                  <div key={i} style={{
                    padding:"10px 14px", background:T.navy,
                    border:`1px solid ${T.border}`, borderRadius:6,
                    display:"flex", gap:10,
                  }}>
                    <span style={{ color:fwColor[r.framework]||T.teal, fontSize:18, minWidth:20 }}>▸</span>
                    <div>
                      <div style={{ display:"flex", gap:6, marginBottom:4 }}>
                        <Badge color={fwColor[r.framework]||T.teal}>{r.framework}</Badge>
                        <Badge color={priColor[r.priority]||T.muted}>{r.priority}</Badge>
                      </div>
                      <div style={{ color:T.offWhite, fontSize:12 }}>{r.action}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Efficiency stat */}
              <div style={{
                padding:"12px 18px", background:T.green+"12",
                border:`1px solid ${T.green}`, borderRadius:6,
                display:"flex", alignItems:"center", gap:16,
              }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ color:T.green, fontSize:28, fontWeight:700, fontFamily:"monospace" }}>
                    {result.estimatedEffortReduction}
                  </div>
                  <div style={{ color:T.muted, fontSize:10, fontFamily:"monospace" }}>EFFORT REDUCTION</div>
                </div>
                <div style={{ color:T.offWhite, fontSize:13 }}>
                  By managing DORA and AI Act obligations through a single unified plan with one owner, RegSentinel eliminates duplicate evidence collection, parallel audits, and siloed remediation tracks.
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {result?.error && <ResultBlock accent={T.red}>{result.error}</ResultBlock>}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function RegSentinelApp() {
  const [activeFlow, setActiveFlow] = useState(0);
  const [pulse, setPulse]           = useState(0);

  // Ambient pulse animation for the status bar
  useEffect(() => {
    const id = setInterval(() => setPulse(p => (p+1)%100), 60);
    return () => clearInterval(id);
  }, []);

  const flows = [
    { id:0, label:"EU AI Act Classifier", icon:"🔍", color:T.gold },
    { id:1, label:"DORA ICT Risk Mapper", icon:"🛡", color:T.teal },
    { id:2, label:"Overlap Engine",        icon:"⚡", color:"#9B59B6" },
  ];

  // Pulse bar: sine wave across 20 segments
  const segments = Array.from({length:20},(_,i) => {
    const wave = Math.sin((i/20)*Math.PI*2 + pulse*0.1)*0.4 + 0.6;
    return Math.max(0.1, wave);
  });

  return (
    <div style={{
      minHeight:"100vh", background:T.navy, color:T.white,
      fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${T.navy}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        textarea, input, select { transition: border-color 0.2s; }
      `}</style>

      {/* Header */}
      <div style={{
        background:T.navyMid, borderBottom:`1px solid ${T.border}`,
        padding:"0 32px",
      }}>
        <div style={{
          maxWidth:1100, margin:"0 auto",
          display:"flex", alignItems:"center", gap:16,
          padding:"14px 0",
        }}>
          {/* DB Logo */}
          <div style={{
            background:T.gold, color:T.navy, fontWeight:900,
            fontSize:16, padding:"4px 10px", borderRadius:4,
            fontFamily:"monospace", letterSpacing:1,
          }}>db</div>

          <div>
            <div style={{ fontWeight:800, fontSize:17, letterSpacing:0.5 }}>
              RegSentinel <span style={{ color:T.gold }}>AI</span>
            </div>
            <div style={{ color:T.muted, fontSize:10, fontFamily:"monospace", letterSpacing:2 }}>
              DORA · EU AI ACT · COMPLIANCE INTELLIGENCE
            </div>
          </div>

          {/* Live pulse bar — signature element */}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"flex-end", gap:2, height:28 }}>
            <span style={{ color:T.muted, fontSize:9, fontFamily:"monospace", marginRight:6, alignSelf:"center" }}>
              LIVE COMPLIANCE PULSE
            </span>
            {segments.map((h,i) => (
              <div key={i} style={{
                width:4, borderRadius:2,
                height: `${h*28}px`,
                background: h>0.7 ? T.green : h>0.45 ? T.amber : T.red,
                transition:"height 0.12s ease",
                opacity:0.8,
              }}/>
            ))}
          </div>

          <div style={{
            marginLeft:24,
            background:T.green+"22", border:`1px solid ${T.green}`,
            borderRadius:4, padding:"4px 12px",
            color:T.green, fontSize:10, fontFamily:"monospace", fontWeight:700,
          }}>● SYSTEM ACTIVE</div>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{
        background:T.navyMid, borderBottom:`1px solid ${T.border}`,
        padding:"0 32px",
      }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", gap:0 }}>
          {flows.map(f => (
            <button key={f.id} onClick={() => setActiveFlow(f.id)} style={{
              background:"transparent",
              borderBottom: activeFlow===f.id ? `2px solid ${f.color}` : "2px solid transparent",
              border:"none", borderBottom: activeFlow===f.id ? `2px solid ${f.color}` : "2px solid transparent",
              color: activeFlow===f.id ? T.white : T.muted,
              padding:"14px 24px", fontSize:13, fontWeight: activeFlow===f.id ? 700:400,
              cursor:"pointer", fontFamily:"inherit",
              transition:"all 0.2s", display:"flex", alignItems:"center", gap:8,
            }}>
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px" }}>
        {activeFlow===0 && <Flow1/>}
        {activeFlow===1 && <Flow2/>}
        {activeFlow===2 && <Flow3/>}
      </div>

      {/* Footer */}
      <div style={{
        borderTop:`1px solid ${T.border}`, padding:"14px 32px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <span style={{ color:T.muted, fontSize:11, fontFamily:"monospace" }}>
          RegSentinel AI · Deutsche Bank Global Hackathon 2026 · "Powering the European Champion of the Future of AI"
        </span>
        <div style={{ display:"flex", gap:14 }}>
          {["DORA Art. 5-44","EU AI Act Art. 6-14","Azure EU","BaFin · ECB · EBA"].map(t => (
            <span key={t} style={{
              color:T.border, fontSize:10, fontFamily:"monospace",
              borderLeft:`1px solid ${T.border}`, paddingLeft:14,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
