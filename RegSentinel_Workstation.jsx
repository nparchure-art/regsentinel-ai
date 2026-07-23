import { useState, useEffect, useRef, createContext, useContext } from "react";

// ── API KEY ───────────────────────────────────────────────────────────────────


// ── DESIGN TOKENS — DB EU Three-Blue System ───────────────────────────────────
const C = {
  deepBlue:   "#1E2A78",
  darkBlue:   "#16184E",
  midBlue:    "#0069B1",
  bg:         "#EBF2FA",
  bgCard:     "#FFFFFF",
  bgMid:      "#D6E8F5",
  navy:       "#1E2A78",
  accent:     "#0069B1",
  accentLight:"#3A8FCC",
  white:      "#FFFFFF",
  text:       "#16184E",
  muted:      "#4A6080",
  border:     "#B0CCE8",
};

// ── MOCK DATA — Registered Apps ────────────────────────────────────────────────
const APPLICATIONS = {
  "APP-2841": {
    id:"APP-2841", name:"DB Credit Intelligence Platform", owner:"Retail Credit Risk", bu:"Private & Commercial Bank",
    classification:"HIGH_RISK_AI", criticality:"CRITICAL",
    functional:{
      description:"AI-driven platform automating credit scoring, loan eligibility decisions, and limit assignments for retail and SME customers across the EU. Processes 2.4 million decisions per month.",
      capabilities:["Automated credit scoring (ML model v3.2)","Real-time loan eligibility assessment","Dynamic credit limit assignment","Adverse action reasoning generation","Regulatory reporting (CRD V, EBA GL/2020/06)"],
      aiComponents:["XGBoost scoring model","SHAP explainability layer","Bias monitoring module","Human override workflow"],
    },
    tech:{ languages:["Python 3.11","Java 17","TypeScript"], frameworks:["FastAPI","Spring Boot","React 18"], databases:["PostgreSQL 15","Redis 7","Elasticsearch 8"], aiStack:["scikit-learn 1.3","XGBoost 1.7","SHAP 0.42","MLflow 2.8"], messaging:["Apache Kafka 3.5","IBM MQ 9.3"] },
    infra:{ hosting:"Azure EU (Frankfurt / Amsterdam — dual region active-active)", dataResidency:"EU only — no cross-border data transfer", availability:"99.95% SLA (Tier 1 critical system)", rto:"4 hours", rpo:"15 minutes", certifications:["ISO 27001","SOC 2 Type II","PCI-DSS L1"] },
    waltz:{
      upstream:[
        {id:"CUS-CORE",name:"Core Customer Data Hub",type:"Database",protocol:"JDBC",data:"Customer KYC, identity, segment",criticality:"CRITICAL"},
        {id:"EXT-BUREAU",name:"Credit Bureau Connector (Schufa / Experian)",type:"API Gateway",protocol:"REST/TLS",data:"External credit scores, payment history",criticality:"CRITICAL"},
        {id:"TXN-HIST",name:"Transaction History Service",type:"Microservice",protocol:"Kafka",data:"12-month transaction patterns",criticality:"HIGH"},
        {id:"PROD-CAT",name:"Product Catalogue Service",type:"Microservice",protocol:"REST",data:"Loan product parameters, interest rates",criticality:"MEDIUM"},
      ],
      downstream:[
        {id:"LOAN-OPS",name:"Loan Origination System",type:"Core Banking",protocol:"IBM MQ",data:"Credit decisions, approved limits",criticality:"CRITICAL"},
        {id:"REG-RPT",name:"Regulatory Reporting Engine",type:"Service",protocol:"REST",data:"EBA-format decision audit logs",criticality:"HIGH"},
        {id:"CUST-NOTIF",name:"Customer Notification Service",type:"Microservice",protocol:"Kafka",data:"Adverse action letters, approval notices",criticality:"MEDIUM"},
        {id:"RISK-DASH",name:"Risk Analytics Dashboard",type:"BI Platform",protocol:"JDBC",data:"Portfolio risk metrics, model performance",criticality:"MEDIUM"},
      ],
    },
    incidents:[
      {id:"INC0084291",severity:"P1",status:"Resolved",date:"2026-06-28",title:"Credit scoring model drift — accuracy below 0.82 threshold",category:"AI Model",doraFlag:true,aiActFlag:true,duration:"4h 22m",affectedUsers:14200},
      {id:"INC0081034",severity:"P2",status:"Resolved",date:"2026-05-14",title:"SHAP explainability service timeout — adverse action letters delayed",category:"Explainability",doraFlag:true,aiActFlag:true,duration:"1h 48m",affectedUsers:3400},
      {id:"INC0079512",severity:"P2",status:"Resolved",date:"2026-04-03",title:"Bias monitoring alert — demographic parity breach on age cohort 65+",category:"Bias / Fairness",doraFlag:false,aiActFlag:true,duration:"6h 10m",affectedUsers:890},
      {id:"INC0076830",severity:"P3",status:"Resolved",date:"2026-03-19",title:"Credit bureau connector (Schufa) connectivity loss — fallback model activated",category:"Third-Party",doraFlag:true,aiActFlag:false,duration:"47m",affectedUsers:0},
      {id:"INC0074102",severity:"P1",status:"Resolved",date:"2026-02-07",title:"Database failover triggered — 8-minute decision processing outage",category:"Infrastructure",doraFlag:true,aiActFlag:false,duration:"8m",affectedUsers:0},
    ],
  },
  "APP-1193": {
    id:"APP-1193", name:"AML Transaction Surveillance Engine", owner:"Financial Crime Compliance", bu:"Corporate Bank",
    classification:"HIGH_RISK_AI", criticality:"CRITICAL",
    functional:{
      description:"Real-time AI-powered AML surveillance screening all SWIFT, SEPA, and domestic payments for suspicious patterns. Generates STRs for regulatory submission to BaFin.",
      capabilities:["Real-time transaction screening (≤200ms)","Pattern recognition across 47 typologies","Automated STR drafting","Network graph analysis for entity relationships","Sanctions list screening (OFAC, EU, UN)"],
      aiComponents:["Graph Neural Network (GNN) for network analysis","Anomaly detection ensemble","NLP-based STR narrative generator","Human-in-the-loop review queue"],
    },
    tech:{ languages:["Python 3.11","Scala 2.13","Go 1.21"], frameworks:["Apache Flink","FastAPI","gRPC"], databases:["Apache Cassandra","Neo4j 5.x","ClickHouse"], aiStack:["PyTorch 2.1","DGL (Deep Graph Library)","Hugging Face Transformers"], messaging:["Apache Kafka 3.5","SWIFT Alliance Gateway"] },
    infra:{ hosting:"Azure EU (Frankfurt — primary, Warsaw — DR)", dataResidency:"EU only — data classified SECRET/FIN", availability:"99.99% SLA (Tier 0 critical system)", rto:"30 minutes", rpo:"Zero (synchronous replication)", certifications:["ISO 27001","SOC 2 Type II","SWIFT CSCF v2025"] },
    waltz:{
      upstream:[
        {id:"SWIFT-GW",name:"SWIFT Alliance Gateway",type:"Network Gateway",protocol:"SWIFT MT/MX",data:"Cross-border payment messages",criticality:"CRITICAL"},
        {id:"SEPA-PROC",name:"SEPA Payment Processor",type:"Core Banking",protocol:"ISO 20022",data:"SEPA credit transfers, direct debits",criticality:"CRITICAL"},
        {id:"SANC-LIST",name:"Sanctions List Manager",type:"Service",protocol:"REST",data:"OFAC, EU, UN consolidated sanctions",criticality:"CRITICAL"},
        {id:"KYC-STORE",name:"KYC / CDD Data Store",type:"Database",protocol:"JDBC",data:"Customer due diligence profiles",criticality:"HIGH"},
      ],
      downstream:[
        {id:"FIU-RPT",name:"FIU Reporting Portal (BaFin)",type:"Regulatory",protocol:"HTTPS/XML",data:"Suspicious Transaction Reports",criticality:"CRITICAL"},
        {id:"CASE-MGT",name:"Case Management System",type:"Workflow",protocol:"REST",data:"Alert investigations, SAR workflow",criticality:"HIGH"},
        {id:"RISK-SCORE",name:"Enterprise Risk Score Bus",type:"Message Bus",protocol:"Kafka",data:"Entity risk scores, network flags",criticality:"HIGH"},
        {id:"AUDIT-LOG",name:"Immutable Audit Trail (Azure Blob)",type:"Storage",protocol:"Azure SDK",data:"All screening decisions, model outputs",criticality:"CRITICAL"},
      ],
    },
    incidents:[
      {id:"INC0083710",severity:"P1",status:"Resolved",date:"2026-06-15",title:"GNN model inference failure — 23-minute gap in transaction screening",category:"AI Model",doraFlag:true,aiActFlag:true,duration:"23m",affectedUsers:0},
      {id:"INC0080221",severity:"P2",status:"Open",date:"2026-05-02",title:"False positive rate spike to 34% — analyst queue overflow",category:"AI Model",doraFlag:false,aiActFlag:true,duration:"Ongoing",affectedUsers:47},
      {id:"INC0077934",severity:"P2",status:"Resolved",date:"2026-03-28",title:"Sanctions list sync failure — 6-hour stale data window",category:"Third-Party",doraFlag:true,aiActFlag:false,duration:"6h 02m",affectedUsers:0},
      {id:"INC0075503",severity:"P3",status:"Resolved",date:"2026-02-18",title:"BaFin STR submission portal timeout — delayed regulatory filing",category:"Regulatory Reporting",doraFlag:true,aiActFlag:false,duration:"2h 15m",affectedUsers:0},
    ],
  },
  "APP-3307": {
    id:"APP-3307", name:"Wealth Robo-Adviser (DB Anlageassistent)", owner:"Wealth Management", bu:"Private Bank",
    classification:"HIGH_RISK_AI", criticality:"IMPORTANT",
    functional:{
      description:"AI-powered investment advisory for Private Banking clients providing personalised portfolio recommendations, rebalancing signals, and ESG-aligned strategies. Manages approximately €4.2B AUM.",
      capabilities:["Personalised portfolio construction (MiFID II compliant)","Dynamic rebalancing recommendations","ESG scoring and impact reporting","Tax-loss harvesting optimisation","Client risk profile assessment"],
      aiComponents:["Mean-variance optimisation engine","Reinforcement learning rebalancing agent","NLP suitability assessment","ESG data aggregation model"],
    },
    tech:{ languages:["Python 3.11","TypeScript","R 4.3"], frameworks:["FastAPI","Next.js 14","Plumber (R)"], databases:["PostgreSQL 15","InfluxDB","MongoDB 7"], aiStack:["PyPortfolioOpt","Stable Baselines 3","FinBERT"], messaging:["Apache Kafka","Azure Service Bus"] },
    infra:{ hosting:"Azure EU (Frankfurt — primary)", dataResidency:"EU only — MiFID II data retention 5 years", availability:"99.9% SLA", rto:"8 hours", rpo:"1 hour", certifications:["ISO 27001","MiFID II Art. 25 compliant"] },
    waltz:{
      upstream:[
        {id:"MKT-DATA",name:"Bloomberg Market Data Feed",type:"External Feed",protocol:"Bloomberg API",data:"Real-time prices, fundamentals, ESG scores",criticality:"CRITICAL"},
        {id:"PORT-SVC",name:"Portfolio Management Service",type:"Core Banking",protocol:"FIX 4.4",data:"Current holdings, cash positions",criticality:"CRITICAL"},
        {id:"CLT-PROF",name:"Client Profile & Suitability Store",type:"Database",protocol:"JDBC",data:"Risk tolerance, investment goals, KYC",criticality:"HIGH"},
        {id:"ESG-AGG",name:"ESG Data Aggregator (MSCI/Sustainalytics)",type:"API Gateway",protocol:"REST",data:"ESG ratings, controversy scores",criticality:"MEDIUM"},
      ],
      downstream:[
        {id:"OMS",name:"Order Management System",type:"Core Banking",protocol:"FIX 4.4",data:"Trade orders, rebalancing instructions",criticality:"CRITICAL"},
        {id:"CLIENT-APP",name:"DB Wealth Mobile / Web App",type:"Frontend",protocol:"REST/WebSocket",data:"Recommendations, performance reports",criticality:"HIGH"},
        {id:"COMP-CHK",name:"Compliance Pre-Trade Checker",type:"Service",protocol:"REST",data:"MiFID suitability validation",criticality:"CRITICAL"},
        {id:"PERF-RPT",name:"Performance Reporting Engine",type:"Service",protocol:"REST",data:"Portfolio returns, benchmark comparison",criticality:"MEDIUM"},
      ],
    },
    incidents:[
      {id:"INC0082944",severity:"P2",status:"Resolved",date:"2026-06-05",title:"RL rebalancing agent recommended concentrated position — suitability breach",category:"AI Model",doraFlag:false,aiActFlag:true,duration:"3h 20m",affectedUsers:128},
      {id:"INC0079001",severity:"P3",status:"Resolved",date:"2026-04-22",title:"Bloomberg feed latency — stale ESG scores used in recommendations",category:"Third-Party",doraFlag:true,aiActFlag:true,duration:"55m",affectedUsers:0},
      {id:"INC0076210",severity:"P2",status:"Resolved",date:"2026-03-11",title:"MiFID suitability check bypass — 14 orders executed without validation",category:"Compliance",doraFlag:false,aiActFlag:true,duration:"2h 05m",affectedUsers:14},
    ],
  },
};

// ── DYNAMIC MOCK GENERATOR ────────────────────────────────────────────────────
const TMPL = {
  types:[
    {name:"Fraud Detection Engine",owner:"Financial Crime",bu:"Corporate Bank",ai:true,lang:["Python 3.11","Scala 2.13"],fw:["Apache Flink","FastAPI"],db:["Cassandra","Redis"],ai_stack:["PyTorch 2.1","Isolation Forest"],msg:["Kafka","SWIFT"],up:["Payment Processor","Core Banking","Sanctions DB"],dn:["Case Management","Risk Dashboard","Audit Log"]},
    {name:"Customer Churn Predictor",owner:"Digital Analytics",bu:"Retail Bank",ai:true,lang:["Python 3.11","R 4.3"],fw:["FastAPI","Streamlit"],db:["PostgreSQL 15","MongoDB"],ai_stack:["XGBoost 1.7","SHAP 0.42"],msg:["Kafka","Azure Service Bus"],up:["CRM System","Transaction History","Product Catalogue"],dn:["Campaign Platform","RM Dashboard","Reporting Engine"]},
    {name:"Liquidity Risk Calculator",owner:"Treasury Risk",bu:"Investment Bank",ai:false,lang:["Java 17","Python 3.11"],fw:["Spring Boot","Pandas"],db:["Oracle 19c","InfluxDB"],ai_stack:[],msg:["IBM MQ","Bloomberg API"],up:["Market Data Feed","Position System","Collateral Manager"],dn:["Regulatory Reporting","Risk Dashboard","ALM System"]},
    {name:"KYC Document Classifier",owner:"Compliance Operations",bu:"Private Bank",ai:true,lang:["Python 3.11","TypeScript"],fw:["FastAPI","React 18"],db:["PostgreSQL 15","Elasticsearch"],ai_stack:["Hugging Face Transformers","Tesseract OCR"],msg:["Azure Service Bus","RabbitMQ"],up:["Document Ingestion","Customer Portal","ID Verification API"],dn:["Onboarding System","CDD Store","Compliance Portal"]},
    {name:"Trade Surveillance Monitor",owner:"Markets Compliance",bu:"Corporate Bank",ai:true,lang:["Scala 2.13","Python 3.11"],fw:["Apache Flink","FastAPI"],db:["ClickHouse","Neo4j"],ai_stack:["GNN Model","Anomaly Detection"],msg:["Kafka","FIX Protocol"],up:["Order Management System","Market Data","Trader Comms"],dn:["Compliance Alerts","Regulatory Filing","Risk Ops"]},
    {name:"ESG Scoring Platform",owner:"Sustainable Finance",bu:"Asset Management",ai:true,lang:["Python 3.11","R 4.3"],fw:["FastAPI","Dash"],db:["PostgreSQL","InfluxDB"],ai_stack:["FinBERT","Random Forest"],msg:["Kafka","REST"],up:["Bloomberg ESG Feed","Sustainalytics API","Portfolio System"],dn:["Client Reports","Fund Admin","Regulatory Disclosures"]},
    {name:"Payments Routing Engine",owner:"Transaction Banking",bu:"Corporate Bank",ai:false,lang:["Java 17","Go 1.21"],fw:["Spring Boot","gRPC"],db:["PostgreSQL","Redis"],ai_stack:[],msg:["SWIFT Alliance","ISO 20022","SEPA"],up:["Corporate Banking Portal","Forex System","Correspondent Banks"],dn:["Settlement Engine","Reconciliation","SWIFT Gateway"]},
    {name:"Mortgage Underwriting AI",owner:"Home Finance",bu:"Retail Bank",ai:true,lang:["Python 3.11","Java 17"],fw:["FastAPI","Spring Boot"],db:["PostgreSQL","Redis"],ai_stack:["LightGBM","SHAP"],msg:["Kafka","IBM MQ"],up:["Credit Bureau","Property Valuation API","Income Verification"],dn:["Mortgage Origination","Regulatory Reporting","Customer Portal"]},
  ],
  ai_inc:[
    {title:"Model accuracy degradation below threshold — retraining required",cat:"AI Model",dora:true,ai:true},
    {title:"Explainability module timeout — decisions made without SHAP output",cat:"Explainability",dora:true,ai:true},
    {title:"Bias alert — demographic disparity detected in model outputs",cat:"Bias / Fairness",dora:false,ai:true},
    {title:"Model served stale predictions — feature pipeline lag > 6 hours",cat:"AI Model",dora:true,ai:true},
    {title:"Human override workflow bypassed — automated decisions exceeded threshold",cat:"AI Governance",dora:false,ai:true},
  ],
  infra_inc:[
    {title:"Database failover triggered — processing outage during switch",cat:"Infrastructure",dora:true,ai:false},
    {title:"Third-party API connector unavailable — fallback logic activated",cat:"Third-Party",dora:true,ai:false},
    {title:"Network latency spike — SLA breach on response time",cat:"Infrastructure",dora:true,ai:false},
    {title:"Certificate expiry caused downstream authentication failures",cat:"Security",dora:true,ai:false},
    {title:"Cloud region failover — service degradation period",cat:"Infrastructure",dora:true,ai:false},
  ],
  protocols:["REST/TLS","Kafka","IBM MQ","JDBC","gRPC","ISO 20022","FIX 4.4","SWIFT MT/MX","Azure SDK"],
  node_types:["Database","API Gateway","Microservice","Core Banking","Service","Workflow","BI Platform","Message Bus"],
  severities:["P1","P1","P2","P2","P2","P3"],
  statuses:["Resolved","Resolved","Resolved","Open","Resolved"],
  durations:["4h 22m","1h 48m","23m","6h 10m","47m","2h 05m","8m","3h 20m","55m"],
  crits:["CRITICAL","CRITICAL","IMPORTANT","IMPORTANT","STANDARD"],
  hostings:["Azure EU (Frankfurt / Amsterdam — active-active)","Azure EU (Frankfurt — primary, Warsaw — DR)","Azure EU (Frankfurt — primary)"],
  rtos:["4 hours","2 hours","8 hours","30 minutes"],
  rpos:["15 minutes","1 hour","Zero (synchronous)","30 minutes"],
};

function seedRng(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return () => { h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
}

function generateApp(id) {
  if (APPLICATIONS[id]) return APPLICATIONS[id];
  const rng = seedRng(id);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const num = (a, b) => Math.floor(rng() * (b - a + 1)) + a;
  const t = pick(TMPL.types);
  const criticality = pick(TMPL.crits);
  const pool = t.ai ? [...TMPL.ai_inc, ...TMPL.infra_inc] : TMPL.infra_inc;
  const seen = new Set();
  const incidents = [];
  for (let i = 0; i < num(2, 5); i++) {
    let inc; let tries = 0;
    do { inc = pick(pool); tries++; } while (seen.has(inc.title) && tries < 20);
    seen.add(inc.title);
    const sev = pick(TMPL.severities);
    incidents.push({ id:`INC${num(7000000,8999999)}`, severity:sev, status:pick(TMPL.statuses), date:`2026-${num(1,6).toString().padStart(2,"0")}-${num(1,28).toString().padStart(2,"0")}`, title:inc.title, category:inc.cat, doraFlag:inc.dora, aiActFlag:inc.ai, duration:pick(TMPL.durations), affectedUsers:sev==="P1"?num(0,20000):sev==="P2"?num(0,5000):0 });
  }
  incidents.sort((a,b) => b.date.localeCompare(a.date));
  return {
    id, name:t.name, owner:t.owner, bu:t.bu,
    classification: t.ai ? "HIGH_RISK_AI" : "STANDARD", criticality,
    functional:{ description:`${t.name} for the ${t.bu} division. Manages critical operations with ${t.ai?"AI/ML-powered decision making":"automated rule-based processing"} across Deutsche Bank EU entities.`, capabilities:[`Core ${t.name.toLowerCase()} processing`,"Real-time data pipeline integration","Regulatory reporting and audit trail","Exception handling and alerting","Management dashboard and KPIs"], aiComponents: t.ai ? t.ai_stack.map(a=>`${a} (production)`) : [] },
    tech:{ languages:t.lang, frameworks:t.fw, databases:t.db, aiStack:t.ai_stack, messaging:t.msg },
    infra:{ hosting:pick(TMPL.hostings), dataResidency:"EU only — no cross-border data transfer", availability:criticality==="CRITICAL"?"99.95% SLA (Tier 1)":"99.9% SLA (Tier 2)", rto:pick(TMPL.rtos), rpo:pick(TMPL.rpos), certifications:["ISO 27001","SOC 2 Type II"] },
    waltz:{
      upstream: t.up.map((name,i)=>({id:`US-${id.replace("APP-","")}-${i+1}`,name,type:pick(TMPL.node_types),protocol:pick(TMPL.protocols),data:`${name} data`,criticality:pick(["CRITICAL","CRITICAL","HIGH","MEDIUM"])})),
      downstream: t.dn.map((name,i)=>({id:`DS-${id.replace("APP-","")}-${i+1}`,name,type:pick(TMPL.node_types),protocol:pick(TMPL.protocols),data:`${name} outputs`,criticality:pick(["CRITICAL","HIGH","MEDIUM"])})),
    },
    incidents,
  };
}

// ── CLAUDE API ────────────────────────────────────────────────────────────────
async function callClaude(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:4000, system, messages:[{role:"user",content:user}] }),
  });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message || `HTTP ${res.status}`); }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

function extractJSON(raw) {
  let text = raw.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();
  try { return JSON.parse(text); } catch(_) {}
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON object in response");
  let depth=0, end=-1;
  for (let i=start;i<text.length;i++) { if(text[i]==="{") depth++; else if(text[i]==="}"){depth--;if(depth===0){end=i;break;}} }
  if (end!==-1) { try{return JSON.parse(text.slice(start,end+1));}catch(_){} }
  let frag = text.slice(start).replace(/,?\s*"[^"]*$/,"");
  let br=0,sq=0,inS=false,esc=false;
  for(const ch of frag){if(esc){esc=false;continue;}if(ch==="\\"&&inS){esc=true;continue;}if(ch==='"'){inS=!inS;continue;}if(inS)continue;if(ch==="{"  )br++;else if(ch==="}")br--;else if(ch==="[")sq++;else if(ch==="]")sq--;}
  frag=frag.replace(/,\s*$/,"")+"]".repeat(Math.max(0,sq))+"}".repeat(Math.max(0,br));
  try{return JSON.parse(frag);}catch(e){throw new Error("Parse failed: "+e.message);}
}

// ── UI PRIMITIVES ─────────────────────────────────────────────────────────────
function Spinner({size=16,color=C.deepBlue}){
  return <span style={{display:"inline-block",width:size,height:size,border:`2px solid ${C.border}`,borderTopColor:color,borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle",marginRight:6}}/>;
}
function Badge({color,bg,children,size=10}){
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:3,background:bg||color+"20",border:`1px solid ${color}`,color,fontSize:size,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",fontFamily:"monospace"}}>{children}</span>;
}
function SLabel({children,color=C.deepBlue}){
  return <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color,fontFamily:"monospace",fontWeight:700,marginBottom:6}}>{children}</div>;
}
function InfoRow({label,value,mono=false}){
  return <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
    <span style={{color:C.muted,fontSize:11,fontFamily:"monospace",minWidth:150,flexShrink:0}}>{label}</span>
    <span style={{color:C.text,fontSize:12,fontFamily:mono?"monospace":"inherit",lineHeight:1.5}}>{value}</span>
  </div>;
}
function Card({children,style={},accent}){
  return <div style={{background:C.bgCard,border:`1px solid ${accent||C.border}`,borderRadius:8,padding:18,...style}}>{children}</div>;
}
function Tag({color,children}){
  return <span style={{background:color+"18",border:`1px solid ${color}`,color,fontSize:10,fontFamily:"monospace",padding:"2px 8px",borderRadius:3,marginRight:5,marginBottom:4,display:"inline-block"}}>{children}</span>;
}

// ── REGULATION MODAL ──────────────────────────────────────────────────────────
function RegModal({which,onClose}){
  if(!which) return null;
  const isDora = which==="dora";

  const DORA_DATA = {
    title:"Digital Operational Resilience Act (DORA)",
    sub:"Regulation (EU) 2022/2554 · Published: 27 December 2022 · In force: 17 January 2025",
    color:C.midBlue,
    icon:"🛡",
    overview:"DORA creates a harmonised, comprehensive framework for digital operational resilience across the EU financial sector. It consolidates and elevates ICT risk requirements that were previously scattered across sector-specific rules, ensuring every financial entity — regardless of size or type — can prevent, withstand, contain, and recover from all ICT-related disruptions and threats.",
    whyItMatters:"Before DORA, each sector (banking, insurance, securities) had its own fragmented ICT guidance. DORA replaces this patchwork with a single, binding regulation supervised directly by competent authorities (BaFin in Germany, ECB for significant institutions). The management body is explicitly accountable — individual board members can be held personally liable.",
    keyFacts:[
      "Applies to 22 categories of financial entities across the EU",
      "Management body bears ultimate and non-delegable responsibility for ICT risk",
      "Major incidents must be reported to regulators within 4 hours initially",
      "Critical third-party ICT providers (CTPPs) are directly supervised by EU Lead Overseers (EBA, ESMA, EIOPA)",
      "Threat-Led Penetration Testing (TLPT) required every 3 years for significant entities",
      "Sub-outsourcing chains must be contractually controlled — 'fourth parties' are in scope",
    ],
    pillars:[
      {n:"01",title:"ICT Risk Management",art:"Art. 5–16",
        desc:"Requires a comprehensive, documented ICT risk management framework approved by the management body. Must cover identification, protection, detection, response and recovery, and communication.",
        items:[
          "Board-approved ICT risk strategy reviewed at least annually",
          "Complete asset register with all ICT assets and dependencies mapped",
          "Identification of all ICT-supported business functions and their criticality",
          "Continuous vulnerability monitoring and patch management processes",
          "Business continuity plans tested and updated at least annually",
          "ICT legacy system risk management with documented mitigation plans",
          "Post-incident reviews after every major ICT-related incident",
        ]},
      {n:"02",title:"ICT Incident Management & Reporting",art:"Art. 17–23",
        desc:"Mandates classification of ICT incidents as 'major' or otherwise using EBA/ESMA/EIOPA criteria. Major incidents trigger a three-stage regulatory reporting obligation to the competent authority.",
        items:[
          "Initial notification to competent authority (BaFin/ECB): within 4 hours of classification",
          "Intermediate report with updated details: within 72 hours",
          "Final report with root cause analysis: within 1 month of resolution",
          "Incidents affecting clients must be communicated transparently",
          "Significant cyber threats: voluntary early notification encouraged",
          "Annual summary statistics reported to competent authorities",
          "DORA prescribes exact templates and data fields for all reports",
        ]},
      {n:"03",title:"Digital Operational Resilience Testing",art:"Art. 24–27",
        desc:"Establishes a tiered testing programme. All entities run basic vulnerability assessments; significant entities additionally conduct Threat-Led Penetration Testing (TLPT) using approved testers.",
        items:[
          "Annual vulnerability assessments and scenario-based testing for all entities",
          "TLPT mandatory every 3 years for significant/systemic entities",
          "TLPT scope agreed with competent authority — covers live production systems",
          "Third-party testers must be approved by the competent authority",
          "Testing results shared with supervisors; remediation timelines enforced",
          "ICT third-party providers may be included in TLPT scope",
        ]},
      {n:"04",title:"Third-Party ICT Risk",art:"Art. 28–44",
        desc:"Introduces direct EU-level oversight of Critical Third-Party Providers (CTPPs) designated by the Joint Committee of ESAs. Financial entities must conduct thorough due diligence and maintain contractual protections.",
        items:[
          "Register of all ICT third-party arrangements maintained and reported annually",
          "Mandatory contractual clauses: audit rights, SLAs, sub-outsourcing controls, exit plans",
          "Critical providers designated CTPPs face direct oversight by Lead Overseer (EBA/ESMA/EIOPA)",
          "Financial entities retain full regulatory accountability — cannot delegate it to vendor",
          "Exit strategies required: substitutability assessed before onboarding",
          "Sub-outsourcing chains must be identified and contractually controlled",
          "Cloud service providers, data centres, and AI model vendors all potentially in scope",
        ]},
      {n:"05",title:"ICT Information Sharing",art:"Art. 45",
        desc:"Encourages voluntary sharing of cyber threat intelligence between financial entities to strengthen collective resilience across the sector.",
        items:[
          "Voluntary sharing of indicators of compromise, tactics, techniques and procedures (TTPs)",
          "Sharing arrangements must be notified to competent authorities",
          "Confidentiality and data protection obligations apply to all shared information",
          "Participation does not create additional regulatory liability for sharing entities",
        ]},
    ],
    fines:{
      entities:"Up to 2% of total annual worldwide turnover",
      individuals:"Up to €1,000,000 per responsible natural person",
      cttps:"Up to €5,000,000 per day of ongoing non-compliance (CTPPs)",
      note:"Competent authorities may also impose temporary bans on management functions",
    },
    scope:"Banks (credit institutions) · Investment firms · Payment institutions · E-money institutions · Trading venues (MTFs, OTFs, regulated markets) · Central counterparties (CCPs) · Central securities depositories (CSDs) · Insurance undertakings · Crypto-asset service providers (CASPs) · Credit rating agencies · Data reporting service providers · Management companies",
    competentAuth:"Germany: BaFin (Federal Financial Supervisory Authority) + ECB for significant credit institutions · European oversight: Joint Committee of EBA, ESMA, EIOPA",
  };

  const AIACT_DATA = {
    title:"EU Artificial Intelligence Act (EU AI Act)",
    sub:"Regulation (EU) 2024/1689 · Published: 12 July 2024 · Phased application: August 2024 – August 2027",
    color:C.deepBlue,
    icon:"🤖",
    overview:"The EU AI Act is the world's first comprehensive, binding legal framework for artificial intelligence. It adopts a risk-proportionate approach: AI systems are classified into four risk tiers, and obligations scale accordingly. For financial services, most AI systems in credit decisioning, fraud detection, and investment advisory are classified as high-risk — triggering extensive conformity, transparency, data governance, and human oversight requirements.",
    whyItMatters:"Deutsche Bank deploys AI across credit scoring, AML surveillance, robo-advisory, and operational processes. Under the AI Act, each of these systems must be assessed for risk tier, registered in the EU AI database, and continuously monitored for accuracy, bias, and compliance. The management body is responsible for AI governance. August 2026 is the critical deadline: from that date, all high-risk AI systems in financial services must be fully compliant or face fines of up to 3% of global turnover.",
    keyFacts:[
      "High-risk AI in financial services must be compliant by August 2026",
      "Credit scoring, AML detection, and investment advisory are all classified HIGH RISK under Annex III",
      "Mandatory conformity assessment required before any high-risk AI system is deployed",
      "All high-risk AI decisions must generate automatic, immutable audit logs (Art. 12)",
      "Human-in-the-loop oversight measures are mandatory for all high-risk systems",
      "Bias monitoring and demographic parity checks are required obligations",
      "AI systems must be registered in the EU AI public database before deployment",
    ],
    timeline:[
      {date:"Aug 2024",label:"Act in Force",desc:"Regulation enters into force. 24-month countdown begins."},
      {date:"Feb 2025",label:"Prohibited Practices",desc:"Art. 5 prohibitions apply: social scoring, subliminal manipulation, real-time biometric ID banned."},
      {date:"Aug 2025",label:"GPAI Rules",desc:"General Purpose AI model obligations (Art. 51-56) apply, including systemic-risk model requirements."},
      {date:"Aug 2026",label:"⚠ HIGH RISK DEADLINE",desc:"High-risk AI system obligations (Art. 6, Annex III) fully apply. Financial services AI must be compliant.",highlight:true},
      {date:"Aug 2027",label:"Full Application",desc:"Annex I high-risk systems and remaining provisions fully apply across all sectors."},
    ],
    pillars:[
      {n:"01",title:"Prohibited AI Practices",art:"Art. 5",
        desc:"A narrow set of AI applications posing unacceptable risks are outright prohibited across the EU, regardless of who develops or deploys them.",
        items:[
          "Social scoring of persons by public authorities based on behaviour",
          "Real-time remote biometric identification in public spaces (narrow law enforcement exceptions)",
          "Emotion recognition systems in workplace or educational settings",
          "AI exploiting vulnerabilities of specific groups (age, disability, social situation)",
          "Subliminal manipulation techniques bypassing conscious decision-making",
          "Predictive policing based solely on profiling or personality traits",
        ]},
      {n:"02",title:"High-Risk AI Systems — Financial Services",art:"Art. 6, Annex III §5",
        desc:"AI systems used in credit scoring, creditworthiness assessment, insurance risk pricing, AML transaction monitoring, and investment advisory are classified as high-risk and subject to the full compliance regime.",
        items:[
          "Conformity assessment (internal or third-party) before market placement (Art. 43)",
          "Comprehensive risk management system documented and maintained (Art. 9)",
          "Training, validation & test data governance — bias testing required (Art. 10)",
          "Technical documentation: model architecture, performance metrics, limitations (Art. 11)",
          "Automatic, immutable logging of all AI decisions and inputs (Art. 12)",
          "Plain-language transparency documentation for deployers and users (Art. 13)",
          "Human oversight: operators must be able to monitor, override, and halt the system (Art. 14)",
          "Accuracy, robustness, and cybersecurity standards maintained throughout lifecycle (Art. 15)",
          "Registration in EU AI public database before deployment (Art. 49)",
          "Post-market monitoring plan required — continuous performance tracking (Art. 72)",
        ]},
      {n:"03",title:"Transparency & Interaction Disclosure",art:"Art. 50",
        desc:"Specific AI systems interacting with natural persons, or generating synthetic content, must disclose their AI nature to ensure informed human decision-making.",
        items:[
          "Chatbots and conversational AI must clearly disclose they are AI-generated",
          "Deepfake images, audio, and video must carry mandatory AI-generated label",
          "Emotion recognition and biometric categorisation must notify subjects",
          "AI-generated synthetic media used in news/media contexts must be marked",
        ]},
      {n:"04",title:"General Purpose AI (GPAI) Models",art:"Art. 51–56",
        desc:"Foundation models and large language models are regulated at model level. Models exceeding 10²⁵ training FLOPs are designated systemic-risk models with enhanced obligations.",
        items:[
          "All GPAI providers: technical documentation, copyright compliance, training data summary",
          "Systemic-risk models: mandatory adversarial testing (red-teaming) before release",
          "Systemic-risk models: serious incident reporting to European Commission",
          "Cybersecurity measures proportionate to systemic risk level",
          "Model capabilities and limitations published in a standardised format",
          "Downstream deployers must be informed of model capabilities and constraints",
        ]},
    ],
    fines:{
      prohibited:"Up to €35,000,000 or 7% of global annual turnover (whichever is higher)",
      highrisk:"Up to €15,000,000 or 3% of global annual turnover (whichever is higher)",
      misleading:"Up to €7,500,000 or 1.5% of global annual turnover (whichever is higher)",
      note:"SME-specific caps apply; national supervisory authorities enforce",
    },
    scope:"AI system providers placing systems on the EU market · Deployers (operators) using AI systems in the EU · Providers and deployers established outside the EU where the AI output is used within the EU · Importers and distributors of AI systems",
    competentAuth:"Germany: BaFin (for financial services AI) + Federal Office for AI (to be established) · EU-level: AI Office within the European Commission oversees GPAI models",
  };

  const d = isDora ? DORA_DATA : AIACT_DATA;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(22,24,78,0.7)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:C.bgCard,borderRadius:14,border:`2px solid ${d.color}`,width:"100%",maxWidth:780,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 12px 60px rgba(22,24,78,0.4)"}} onClick={e=>e.stopPropagation()}>

        {/* Modal header */}
        <div style={{background:d.color,padding:"22px 28px",borderRadius:"12px 12px 0 0",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
            <span style={{fontSize:24}}>{d.icon}</span>
            <div>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:9,fontFamily:"monospace",letterSpacing:2,marginBottom:3}}>EU REGULATORY FRAMEWORK</div>
              <div style={{color:C.white,fontWeight:800,fontSize:19}}>{d.title}</div>
            </div>
            <button onClick={onClose} style={{marginLeft:"auto",background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:C.white,borderRadius:6,padding:"6px 16px",fontSize:11,cursor:"pointer",fontWeight:700}}>✕ Close</button>
          </div>
          <div style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontFamily:"monospace"}}>{d.sub}</div>
        </div>

        <div style={{padding:"24px 28px"}}>

          {/* Overview */}
          <div style={{background:C.bgMid,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 18px",marginBottom:18}}>
            <div style={{color:d.color,fontSize:10,fontFamily:"monospace",fontWeight:700,letterSpacing:2,marginBottom:8}}>OVERVIEW</div>
            <p style={{color:C.text,fontSize:13,lineHeight:1.8,margin:"0 0 12px"}}>{d.overview}</p>
            <p style={{color:C.text,fontSize:13,lineHeight:1.8,margin:0,fontStyle:"italic",borderTop:`1px solid ${C.border}`,paddingTop:10}}>{d.whyItMatters}</p>
          </div>

          {/* Key facts */}
          <div style={{marginBottom:18}}>
            <div style={{color:d.color,fontSize:10,fontFamily:"monospace",fontWeight:700,letterSpacing:2,marginBottom:10}}>KEY FACTS AT A GLANCE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {d.keyFacts.map((f,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:6,padding:"9px 12px"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:d.color,color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,flexShrink:0,marginTop:1}}>{i+1}</div>
                  <span style={{color:C.text,fontSize:12,lineHeight:1.55}}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline for AI Act */}
          {!isDora && d.timeline && (
            <div style={{marginBottom:18,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 18px"}}>
              <div style={{color:d.color,fontSize:10,fontFamily:"monospace",fontWeight:700,letterSpacing:2,marginBottom:14}}>IMPLEMENTATION TIMELINE</div>
              {d.timeline.map((t,i)=>(
                <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:i<d.timeline.length-1?12:0,paddingBottom:i<d.timeline.length-1?12:0,borderBottom:i<d.timeline.length-1?`1px solid ${C.border}`:"none"}}>
                  <div style={{minWidth:80,textAlign:"center"}}>
                    <div style={{background:t.highlight?C.deepBlue:t.active?C.midBlue:C.bgMid,color:t.highlight||t.active?C.white:C.muted,borderRadius:5,padding:"4px 8px",fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{t.date}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color:t.highlight?C.deepBlue:C.text,fontWeight:t.highlight?800:600,fontSize:12,marginBottom:3}}>{t.label}</div>
                    <div style={{color:C.muted,fontSize:11,lineHeight:1.55}}>{t.desc}</div>
                  </div>
                  {t.highlight&&<span style={{background:C.deepBlue,color:C.white,fontSize:9,padding:"2px 8px",borderRadius:3,fontFamily:"monospace",fontWeight:700,flexShrink:0}}>IMMINENT</span>}
                </div>
              ))}
            </div>
          )}

          {/* Pillars */}
          <div style={{marginBottom:18}}>
            <div style={{color:d.color,fontSize:10,fontFamily:"monospace",fontWeight:700,letterSpacing:2,marginBottom:12}}>{isDora?"FIVE REGULATORY PILLARS":"FOUR REGULATORY TIERS"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {d.pillars.map((p,i)=>(
                <div key={i} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderLeft:`4px solid ${d.color}`,borderRadius:8,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:C.bgMid,cursor:"default"}}>
                    <div style={{width:30,height:30,borderRadius:6,background:d.color,color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,fontFamily:"monospace",flexShrink:0}}>{p.n}</div>
                    <div style={{flex:1}}>
                      <div style={{color:C.text,fontWeight:700,fontSize:13}}>{p.title}</div>
                      <div style={{color:d.color,fontSize:10,fontFamily:"monospace"}}>{p.art}</div>
                    </div>
                  </div>
                  <div style={{padding:"12px 16px"}}>
                    <p style={{color:C.muted,fontSize:12,lineHeight:1.65,margin:"0 0 10px"}}>{p.desc}</p>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px 12px"}}>
                      {p.items.map((item,j)=>(
                        <div key={j} style={{display:"flex",gap:7,alignItems:"flex-start",fontSize:11,color:C.text,lineHeight:1.55}}>
                          <span style={{color:d.color,fontWeight:700,flexShrink:0,marginTop:1}}>▸</span>{item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Penalties */}
          <div style={{background:C.deepBlue,borderRadius:8,padding:"16px 18px",marginBottom:16}}>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:10,fontFamily:"monospace",fontWeight:700,letterSpacing:2,marginBottom:12}}>FINANCIAL PENALTIES</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              {Object.entries(d.fines).filter(([k])=>k!=="note").map(([key,val])=>(
                <div key={key} style={{background:"rgba(255,255,255,0.08)",borderRadius:6,padding:"10px 14px"}}>
                  <div style={{color:"rgba(255,255,255,0.5)",fontSize:9,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{key.replace(/([A-Z])/g," $1").trim()}</div>
                  <div style={{color:C.white,fontSize:11,fontWeight:600,lineHeight:1.5}}>{val}</div>
                </div>
              ))}
            </div>
            {d.fines.note&&<div style={{color:"rgba(255,255,255,0.55)",fontSize:11,fontStyle:"italic"}}>{d.fines.note}</div>}
          </div>

          {/* Scope & Authority */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
            <div style={{background:C.bgMid,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px"}}>
              <div style={{color:d.color,fontSize:10,fontFamily:"monospace",fontWeight:700,letterSpacing:2,marginBottom:8}}>SCOPE OF APPLICATION</div>
              <p style={{color:C.text,fontSize:11,lineHeight:1.7,margin:0}}>{d.scope}</p>
            </div>
            <div style={{background:C.bgMid,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px"}}>
              <div style={{color:d.color,fontSize:10,fontFamily:"monospace",fontWeight:700,letterSpacing:2,marginBottom:8}}>COMPETENT AUTHORITIES</div>
              <p style={{color:C.text,fontSize:11,lineHeight:1.7,margin:0}}>{d.competentAuth}</p>
            </div>
          </div>

          <div style={{textAlign:"right"}}>
            <button onClick={onClose} style={{background:d.color,color:C.white,border:"none",borderRadius:6,padding:"10px 28px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STEP 0: REGULATIONS PAGE ──────────────────────────────────────────────────
function Step0(){
  const [tab,setTab]=useState("dora");
  const DORA={
    title:"Digital Operational Resilience Act",sub:"Regulation (EU) 2022/2554 · In force: 17 January 2025",
    summary:"DORA establishes a unified framework for digital operational resilience across EU financial entities. Firms must withstand, respond to, and recover from all ICT-related disruptions and threats.",
    fines:"Up to 2% of total annual worldwide turnover",
    scope:"Banks, investment firms, payment institutions, e-money institutions, insurance, trading venues, CCPs, CSDs, crypto-asset service providers",
    pillars:[
      {n:"01",title:"ICT Risk Management",art:"Art. 5–16",desc:"Firms must maintain a comprehensive ICT risk management framework with governance, strategy, and continuous improvement.",items:["Board-approved ICT risk strategy","Asset register with dependency mapping","Detection, protection & recovery controls","Annual ICT risk assessment","Business continuity plans"]},
      {n:"02",title:"ICT Incident Management & Reporting",art:"Art. 17–23",desc:"Major ICT incidents must be classified, managed, and reported to competent authorities within strict timelines.",items:["Initial notification: 4 hours from classification","Intermediate report: 72 hours","Final report: 1 month after resolution","Root cause analysis required","Significant cyber threats: voluntary notification"]},
      {n:"03",title:"Digital Operational Resilience Testing",art:"Art. 24–27",desc:"Regular testing of ICT tools and systems, including Threat-Led Penetration Testing (TLPT) every 3 years for significant entities.",items:["Annual vulnerability assessments","TLPT every 3 years (significant entities)","Test results reported to management","Remediation plans for identified gaps","Third-party testers require supervisory approval"]},
      {n:"04",title:"Third-Party ICT Risk Management",art:"Art. 28–44",desc:"Comprehensive oversight of ICT third-party providers. Critical ICT providers face direct EU supervisory oversight.",items:["Mandatory contractual provisions","Register of all ICT third-party arrangements","Exit strategies for critical providers","CTPP oversight by Lead Overseer","Sub-outsourcing chains must be managed"]},
      {n:"05",title:"ICT Information Sharing",art:"Art. 45",desc:"Financial entities may voluntarily share cyber threat intelligence to strengthen collective resilience.",items:["Voluntary sharing arrangements permitted","Confidentiality obligations apply","Coordinated through competent authorities","Sharing arrangements must be notified"]},
    ],
  };
  const AIACT={
    title:"EU Artificial Intelligence Act",sub:"Regulation (EU) 2024/1689 · High-risk obligations: August 2026",
    summary:"The world's first comprehensive AI legal framework. Risk-based approach classifying AI systems into four tiers with obligations proportional to risk level.",
    fines:"Prohibited AI: €35M or 7% · High-risk violations: €15M or 3% · Misleading info: €7.5M or 1.5%",
    scope:"Providers placing AI in EU market, deployers using AI in EU, providers/deployers in third countries where output is used in EU",
    timeline:[
      {date:"Aug 2024",event:"Act enters into force",active:true},
      {date:"Feb 2025",event:"Prohibited practices (Art. 5) apply",active:true},
      {date:"Aug 2025",event:"GPAI model rules (Art. 51–56) apply",active:true},
      {date:"Aug 2026",event:"High-risk AI obligations apply — FINANCIAL SERVICES",active:false,highlight:true},
      {date:"Aug 2027",event:"Full application including Annex I systems",active:false},
    ],
    pillars:[
      {n:"01",title:"Prohibited AI Practices",art:"Art. 5",desc:"AI applications posing unacceptable risks are outright banned.",items:["Social scoring by public authorities","Real-time remote biometric ID in public spaces","Emotion recognition in workplaces/education","AI exploiting vulnerabilities of specific groups","Subliminal manipulation techniques"]},
      {n:"02",title:"High-Risk AI Systems",art:"Art. 6, Annex III",desc:"AI in critical infrastructure, essential services, employment — including credit scoring, AML, robo-advice — is high-risk.",items:["Conformity assessment before market placement","Risk management system (Art. 9)","Data governance requirements (Art. 10)","Technical documentation (Art. 11)","Automatic logging / audit trail (Art. 12)","Human oversight measures (Art. 14)","Registration in EU database (Art. 49)"]},
      {n:"03",title:"Transparency Obligations",art:"Art. 50",desc:"Certain AI systems must inform users they are interacting with AI.",items:["Chatbots must disclose AI nature","Deepfake content must be labelled","Emotion recognition must disclose to users","Biometric categorisation must disclose"]},
      {n:"04",title:"General Purpose AI (GPAI)",art:"Art. 51–56",desc:"Foundation models with systemic risk face enhanced obligations.",items:["Technical documentation required","Copyright compliance","Summary of training data published","Adversarial testing for systemic-risk models","Incident reporting to Commission","Cybersecurity measures"]},
    ],
  };
  const reg = tab==="dora" ? DORA : AIACT;
  return (
    <div>
      <div style={{display:"flex",gap:0,marginBottom:24,background:C.bgMid,borderRadius:8,padding:4,width:"fit-content"}}>
        {[{id:"dora",label:"DORA",sub:"Reg (EU) 2022/2554"},{id:"aiact",label:"EU AI Act",sub:"Reg (EU) 2024/1689"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?C.deepBlue:"transparent",border:"none",borderRadius:6,padding:"10px 28px",cursor:"pointer",color:tab===t.id?C.white:C.muted,fontFamily:"inherit",transition:"all 0.15s"}}>
            <div style={{fontWeight:700,fontSize:14}}>{t.label}</div>
            <div style={{fontSize:10,opacity:0.7,fontFamily:"monospace"}}>{t.sub}</div>
          </button>
        ))}
      </div>
      <div style={{background:C.deepBlue,borderRadius:10,padding:"22px 26px",marginBottom:20}}>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:9,fontFamily:"monospace",letterSpacing:2,marginBottom:5}}>{tab==="dora"?"DIGITAL OPERATIONAL RESILIENCE":"ARTIFICIAL INTELLIGENCE REGULATION"}</div>
        <h2 style={{color:C.white,fontSize:22,fontWeight:800,margin:"0 0 5px"}}>{reg.title}</h2>
        <div style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontFamily:"monospace",marginBottom:14}}>{reg.sub}</div>
        <p style={{color:"rgba(255,255,255,0.85)",fontSize:13,lineHeight:1.7,margin:0}}>{reg.summary}</p>
      </div>
      {tab==="aiact" && (
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 20px",marginBottom:20}}>
          <SLabel>Implementation Timeline</SLabel>
          <div style={{display:"flex",alignItems:"flex-start",gap:0,marginTop:8}}>
            {AIACT.timeline.map((t,i)=>(
              <div key={i} style={{flex:1,textAlign:"center",position:"relative"}}>
                {i<AIACT.timeline.length-1&&<div style={{position:"absolute",top:9,left:"50%",width:"100%",height:2,background:t.highlight?C.deepBlue:C.border,zIndex:0}}/>}
                <div style={{width:20,height:20,borderRadius:"50%",margin:"0 auto 8px",background:t.highlight?C.deepBlue:t.active?C.midBlue:C.bgMid,border:`2px solid ${t.highlight?C.deepBlue:t.active?C.midBlue:C.border}`,position:"relative",zIndex:1}}/>
                <div style={{color:t.highlight?C.deepBlue:t.active?C.midBlue:C.muted,fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{t.date}</div>
                <div style={{color:t.highlight?C.deepBlue:C.text,fontSize:10,lineHeight:1.4,marginTop:3,padding:"0 4px",fontWeight:t.highlight?700:400}}>{t.event}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
        {reg.pillars.map((p,i)=>(
          <div key={i} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderTop:`3px solid ${i%2===0?C.deepBlue:C.midBlue}`,borderRadius:8,padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:30,height:30,borderRadius:6,background:C.deepBlue,display:"flex",alignItems:"center",justifyContent:"center",color:C.white,fontWeight:800,fontSize:11,fontFamily:"monospace",flexShrink:0}}>{p.n}</div>
              <div><div style={{color:C.text,fontWeight:700,fontSize:13}}>{p.title}</div><div style={{color:C.midBlue,fontSize:10,fontFamily:"monospace"}}>{p.art}</div></div>
            </div>
            <p style={{color:C.muted,fontSize:12,lineHeight:1.6,margin:"0 0 10px"}}>{p.desc}</p>
            {p.items.map((o,j)=><div key={j} style={{display:"flex",gap:7,fontSize:11,color:C.text,marginBottom:5}}><span style={{color:C.midBlue,fontWeight:700,flexShrink:0}}>▸</span>{o}</div>)}
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:C.bgMid,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 18px"}}>
          <SLabel>Scope of Application</SLabel>
          <p style={{color:C.text,fontSize:12,lineHeight:1.7,margin:0}}>{reg.scope}</p>
        </div>
        <div style={{background:C.deepBlue,borderRadius:8,padding:"14px 18px"}}>
          <SLabel color="rgba(255,255,255,0.55)">Maximum Financial Penalties</SLabel>
          <p style={{color:C.white,fontSize:13,lineHeight:1.7,margin:0,fontWeight:600}}>{reg.fines}</p>
        </div>
      </div>
    </div>
  );
}

// ── STEP 1: APP LOOKUP ────────────────────────────────────────────────────────
function Step1({onSelect}){
  const [input,setInput]=useState("");
  const [error,setError]=useState("");
  function handleLookup(id){
    const val=(id||input).trim().toUpperCase();
    if(!val){setError("Enter an Application ID");return;}
    if(!/^APP-\d{4}$/.test(val)){setError("Format must be APP-XXXX (4-digit number, e.g. APP-2841 or APP-5500)");return;}
    setError("");
    onSelect(generateApp(val));
  }
  return (
    <div style={{maxWidth:640,margin:"0 auto",paddingTop:48}}>
      <SLabel>NAR Portal — Application Lookup</SLabel>
      <h2 style={{color:C.text,fontSize:28,fontWeight:800,margin:"6px 0 8px"}}>Search NAR Portal</h2>
      <p style={{color:C.muted,fontSize:13,marginBottom:32,lineHeight:1.6}}>Enter any DB Application ID in the format <strong style={{color:C.deepBlue}}>APP-XXXX</strong>. Registered apps load real data; any other valid ID generates a realistic mock profile for demonstration.</p>
      <div style={{display:"flex",gap:10,marginBottom:12}}>
        <input value={input} onChange={e=>{setInput(e.target.value.toUpperCase());setError("");}} onKeyDown={e=>e.key==="Enter"&&handleLookup()}
          placeholder="APP-XXXX (e.g. APP-2841, APP-1193, APP-5500)"
          autoFocus
          style={{flex:1,background:C.bgCard,border:`1px solid ${error?C.accent:C.border}`,borderRadius:6,padding:"12px 16px",color:C.text,fontSize:14,fontFamily:"monospace",letterSpacing:1,outline:"none"}}/>
        <button onClick={()=>handleLookup()} style={{background:C.deepBlue,color:C.white,border:"none",borderRadius:6,padding:"12px 28px",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"monospace",letterSpacing:1,whiteSpace:"nowrap"}}>LOOK UP →</button>
      </div>
      {error&&<div style={{color:C.accent,fontSize:12,fontFamily:"monospace",marginBottom:16}}>⚠ {error}</div>}
      <div style={{marginTop:28}}>
        <div style={{color:C.muted,fontSize:10,fontFamily:"monospace",letterSpacing:2,marginBottom:12}}>REGISTERED NAR PORTAL APPLICATIONS</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {Object.values(APPLICATIONS).map(app=>(
            <button key={app.id} onClick={()=>handleLookup(app.id)}
              style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:6,padding:"12px 16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.deepBlue;e.currentTarget.style.background=C.bgMid;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.bgCard;}}>
              <span style={{color:C.deepBlue,fontFamily:"monospace",fontSize:12,fontWeight:700,minWidth:90}}>{app.id}</span>
              <span style={{color:C.text,fontSize:13,flex:1}}>{app.name}</span>
              <Badge color={C.accent}>HIGH RISK AI</Badge>
              <span style={{color:C.muted,fontSize:11}}>{app.bu}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── STEP 2: APP DETAILS ───────────────────────────────────────────────────────
function Step2({app}){
  const critColor = app.criticality==="CRITICAL"?C.accent:C.midBlue;
  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:22,padding:"18px 22px",background:C.deepBlue,borderRadius:8}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <span style={{color:"rgba(255,255,255,0.6)",fontFamily:"monospace",fontSize:12,fontWeight:700}}>{app.id}</span>
            {app.classification==="HIGH_RISK_AI"&&<Badge color="#E5A020" bg="rgba(229,160,32,0.2)">HIGH RISK AI</Badge>}
            <Badge color={critColor==="CRITICAL"?"#E5A020":C.accentLight} bg="rgba(58,143,204,0.2)">{app.criticality}</Badge>
          </div>
          <h2 style={{color:C.white,fontSize:22,fontWeight:800,margin:"0 0 4px"}}>{app.name}</h2>
          <div style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>{app.owner} · {app.bu}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:10,fontFamily:"monospace"}}>AI ACT CLASSIFICATION</div>
          <div style={{color:"#F0B429",fontWeight:800,fontSize:13,fontFamily:"monospace"}}>Annex III — High Risk</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
        <Card style={{gridColumn:"1 / -1"}}>
          <SLabel>Functional Overview</SLabel>
          <p style={{color:C.text,fontSize:13,lineHeight:1.8,margin:"0 0 16px"}}>{app.functional.description}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div>
              <div style={{color:C.muted,fontSize:10,fontFamily:"monospace",marginBottom:8}}>KEY CAPABILITIES</div>
              {app.functional.capabilities.map((c,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:12,color:C.text}}><span style={{color:C.midBlue}}>▸</span>{c}</div>)}
            </div>
            <div>
              <div style={{color:C.muted,fontSize:10,fontFamily:"monospace",marginBottom:8}}>AI COMPONENTS (EU AI ACT SCOPE)</div>
              {app.functional.aiComponents.length>0 ? app.functional.aiComponents.map((c,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:12,color:C.text}}><span style={{color:C.deepBlue}}>◆</span>{c}</div>) : <div style={{color:C.muted,fontSize:12}}>No AI components — standard system</div>}
            </div>
          </div>
        </Card>
        <Card>
          <SLabel>Technology Stack</SLabel>
          <InfoRow label="Languages" value={app.tech.languages.join(", ")} mono/>
          <InfoRow label="Frameworks" value={app.tech.frameworks.join(", ")} mono/>
          <InfoRow label="Databases" value={app.tech.databases.join(", ")} mono/>
          {app.tech.aiStack.length>0&&<InfoRow label="AI / ML Stack" value={app.tech.aiStack.join(", ")} mono/>}
          <InfoRow label="Messaging" value={app.tech.messaging.join(", ")} mono/>
        </Card>
        <Card style={{gridColumn:"span 2"}}>
          <SLabel>Infrastructure Overview</SLabel>
          <InfoRow label="Hosting" value={app.infra.hosting}/>
          <InfoRow label="Data Residency" value={app.infra.dataResidency}/>
          <InfoRow label="Availability SLA" value={app.infra.availability}/>
          <InfoRow label="RTO / RPO" value={`${app.infra.rto} / ${app.infra.rpo}`}/>
          <InfoRow label="Certifications" value={app.infra.certifications.join(" · ")}/>
        </Card>
      </div>
    </div>
  );
}

// ── STEP 3: WALTZ ─────────────────────────────────────────────────────────────
function Step3({app}){
  const cc={CRITICAL:C.accent,HIGH:C.midBlue,MEDIUM:C.muted,LOW:C.border};
  const ti={"Database":"🗄","API Gateway":"🔌","Microservice":"⚙","Core Banking":"🏦","Service":"📦","Network Gateway":"📡","External Feed":"📊","Frontend":"🖥","Storage":"💾","BI Platform":"📈","Workflow":"📋","Message Bus":"📨","Regulatory":"⚖"};
  function FC({item}){
    return <div style={{background:C.bgMid,border:`1px solid ${cc[item.criticality]||C.border}`,borderRadius:6,padding:"11px 14px",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
        <span style={{fontSize:14}}>{ti[item.type]||"📦"}</span>
        <span style={{color:C.text,fontWeight:700,fontSize:12}}>{item.name}</span>
        <Badge color={cc[item.criticality]||C.muted}>{item.criticality}</Badge>
        <span style={{marginLeft:"auto",color:C.muted,fontSize:10,fontFamily:"monospace"}}>{item.id}</span>
      </div>
      <div style={{display:"flex",gap:16}}>
        <div style={{color:C.muted,fontSize:10}}><span style={{fontFamily:"monospace"}}>TYPE: </span><span style={{color:C.text}}>{item.type}</span></div>
        <div style={{color:C.muted,fontSize:10}}><span style={{fontFamily:"monospace"}}>PROTOCOL: </span><span style={{color:C.midBlue,fontFamily:"monospace"}}>{item.protocol}</span></div>
      </div>
      <div style={{marginTop:5,color:C.muted,fontSize:11}}><span style={{fontFamily:"monospace"}}>DATA: </span>{item.data}</div>
    </div>;
  }
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div><SLabel>WALTZ Data Flows</SLabel><h3 style={{color:C.text,fontSize:18,fontWeight:700,margin:0}}>Physical & Logical Data Flow Map — {app.name}</h3></div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}><Badge color={C.midBlue}>{app.waltz.upstream.length} Upstream</Badge><Badge color={C.deepBlue}>{app.waltz.downstream.length} Downstream</Badge></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:16,alignItems:"start"}}>
        <div>
          <div style={{color:C.midBlue,fontSize:10,fontFamily:"monospace",fontWeight:700,letterSpacing:2,marginBottom:10}}>◀ UPSTREAM — DATA SOURCES</div>
          {app.waltz.upstream.map(u=><FC key={u.id} item={u}/>)}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:40,gap:4}}>
          <div style={{background:C.deepBlue,border:`2px solid ${C.accentLight}`,borderRadius:8,padding:"14px 10px",textAlign:"center",minWidth:120}}>
            <div style={{color:C.accentLight,fontSize:9,fontFamily:"monospace",fontWeight:700,marginBottom:4}}>DB APP</div>
            <div style={{color:C.white,fontWeight:800,fontSize:11}}>{app.id}</div>
          </div>
          <div style={{color:C.muted,fontSize:18}}>⬌</div>
        </div>
        <div>
          <div style={{color:C.deepBlue,fontSize:10,fontFamily:"monospace",fontWeight:700,letterSpacing:2,marginBottom:10}}>DOWNSTREAM — DATA CONSUMERS ▶</div>
          {app.waltz.downstream.map(d=><FC key={d.id} item={d}/>)}
        </div>
      </div>
      {[...app.waltz.upstream,...app.waltz.downstream].some(f=>["API Gateway","External Feed","Network Gateway"].includes(f.type))&&(
        <div style={{marginTop:16,padding:"10px 14px",background:C.bgMid,border:`1px solid ${C.border}`,borderRadius:6,color:C.text,fontSize:12}}>
          <span style={{color:C.deepBlue,fontFamily:"monospace",fontWeight:700}}>⚠ DORA Art. 28-44: </span>External providers in this flow are subject to DORA third-party ICT risk requirements. Contractual arrangements must include RTO/RPO obligations and exit strategies.
        </div>
      )}
    </div>
  );
}

// ── STEP 4: INCIDENTS ─────────────────────────────────────────────────────────
function Step4({app,onSelect}){
  const sc={P1:C.accent,P2:C.midBlue,P3:C.muted};
  const stc={Resolved:C.midBlue,Open:C.accent,"In Progress":C.deepBlue};
  return (
    <div>
      <SLabel>ServiceNow — Incident Register</SLabel>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <h3 style={{color:C.text,fontSize:18,fontWeight:700,margin:0}}>ServiceNow Incidents — {app.name}</h3>
        <Badge color={C.accent}>{app.incidents.filter(i=>i.severity==="P1").length} P1</Badge>
        <Badge color={C.midBlue}>{app.incidents.filter(i=>i.severity==="P2").length} P2</Badge>
        <span style={{marginLeft:"auto",color:C.muted,fontSize:11}}>Select an incident to run DORA & EU AI Act regulatory analysis →</span>
      </div>
      <div style={{display:"flex",gap:14,marginBottom:14,padding:"8px 14px",background:C.bgMid,borderRadius:6,fontSize:11}}>
        <div style={{display:"flex",alignItems:"center",gap:5,color:C.muted}}><Badge color={C.midBlue}>DORA</Badge> DORA-reportable incident</div>
        <div style={{display:"flex",alignItems:"center",gap:5,color:C.muted}}><Badge color={C.deepBlue}>AI ACT</Badge> EU AI Act Article 12 / 62 scope</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {app.incidents.map(inc=>(
          <button key={inc.id} onClick={()=>onSelect(inc)}
            style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:6,padding:"14px 18px",cursor:"pointer",textAlign:"left",display:"grid",gridTemplateColumns:"110px 70px 1fr auto auto auto",alignItems:"center",gap:12,transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.deepBlue;e.currentTarget.style.background=C.bgMid;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.bgCard;}}>
            <span style={{color:C.muted,fontFamily:"monospace",fontSize:11}}>{inc.id}</span>
            <Badge color={sc[inc.severity]||C.muted}>{inc.severity}</Badge>
            <div>
              <div style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:3}}>{inc.title}</div>
              <div style={{display:"flex",gap:8}}>
                <span style={{color:C.muted,fontSize:11}}>{inc.date}</span>
                <span style={{color:C.muted,fontSize:11}}>·</span>
                <span style={{color:C.muted,fontSize:11}}>{inc.category}</span>
                <span style={{color:C.muted,fontSize:11}}>·</span>
                <span style={{color:C.muted,fontSize:11}}>Duration: {inc.duration}</span>
              </div>
            </div>
            <Badge color={stc[inc.status]||C.muted}>{inc.status}</Badge>
            {inc.doraFlag&&<Badge color={C.midBlue}>DORA</Badge>}
            {inc.aiActFlag&&<Badge color={C.deepBlue}>AI ACT</Badge>}
            <span style={{color:C.deepBlue,fontSize:16}}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── STEP 5: REGULATORY ANALYSIS ───────────────────────────────────────────────
function Step5({app,incident}){
  const [analysis,setAnalysis]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const hasRun=useRef(false);

  const SYSTEM=`You are RegSentinel AI, Deutsche Bank's regulatory compliance analyser for DORA and the EU AI Act.
Given an application profile and a ServiceNow incident, produce a structured regulatory analysis. Respond ONLY with this JSON (no markdown, no preamble):
{
  "executiveSummary": "2-3 sentence plain-English summary of the regulatory exposure this incident creates",
  "doraAnalysis": {
    "inScope": true,
    "primaryArticles": ["Art. XX — Title"],
    "classification": "Major ICT-related incident",
    "reportingObligation": "Specific reporting obligation and timeline e.g. Initial notification to BaFin within 4 hours",
    "gapIdentified": "Key DORA compliance gap this incident reveals",
    "remediationAction": "Specific DORA-required remediation step"
  },
  "aiActAnalysis": {
    "inScope": true,
    "primaryArticles": ["Art. XX — Title"],
    "riskCategory": "High",
    "obligationTriggered": "Which specific AI Act obligation does this incident trigger",
    "gapIdentified": "Key AI Act compliance gap this incident reveals",
    "remediationAction": "Specific AI Act-required remediation step"
  },
  "combinedRisk": {
    "overlapDetected": true,
    "intersectionExplanation": "If both frameworks apply explain the intersection",
    "overallSeverity": "CRITICAL",
    "unifiedRemediationPlan": [
      {"priority":1,"action":"action text","owner":"role","framework":"BOTH","deadline":"timeframe"},
      {"priority":2,"action":"action text","owner":"role","framework":"DORA","deadline":"timeframe"},
      {"priority":3,"action":"action text","owner":"role","framework":"AI Act","deadline":"timeframe"},
      {"priority":4,"action":"action text","owner":"role","framework":"BOTH","deadline":"timeframe"}
    ]
  },
  "regulatoryTimeline": [
    {"milestone":"milestone name","deadline":"timeframe from incident","framework":"DORA","status":"DUE"}
  ],
  "potentialFinancialExposure": "Describe the regulatory fine exposure with specific reference to DORA Art. 50 or AI Act penalty provisions"
}`;

  useEffect(()=>{
    if(hasRun.current) return;
    hasRun.current=true;
    setLoading(true);
    const msg=`APPLICATION: ${app.name} (${app.id})\nClassification: ${app.classification}\nBusiness Unit: ${app.bu}\nAI Components: ${app.functional.aiComponents.join(", ")||"None"}\nInfrastructure: ${app.infra.hosting}\n\nINCIDENT:\nID: ${incident.id}\nSeverity: ${incident.severity}\nCategory: ${incident.category}\nTitle: ${incident.title}\nDuration: ${incident.duration}\nAffected Users: ${incident.affectedUsers}\nDate: ${incident.date}\nStatus: ${incident.status}\nDORA Flagged: ${incident.doraFlag}\nAI Act Flagged: ${incident.aiActFlag}\n\nProvide a detailed DORA and EU AI Act regulatory analysis.`;
    callClaude(SYSTEM,msg)
      .then(raw=>{ try{setAnalysis(extractJSON(raw));}catch(e){setError("Parse failed: "+e.message+". Raw: "+raw.slice(0,150));} })
      .catch(e=>setError("API error: "+e.message))
      .finally(()=>setLoading(false));
  },[incident.id]);

  const oc={CRITICAL:C.accent,HIGH:C.midBlue,MEDIUM:C.muted,LOW:C.border};
  const fc={"DORA":C.midBlue,"AI Act":C.deepBlue,"BOTH":C.accent};
  const stc={OVERDUE:C.accent,DUE:C.midBlue,UPCOMING:C.muted};
  const sv={P1:C.accent,P2:C.midBlue,P3:C.muted};

  return (
    <div>
      <div style={{padding:"14px 18px",background:C.bgMid,borderRadius:8,border:`1px solid ${C.border}`,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <Badge color={sv[incident.severity]||C.muted}>{incident.severity}</Badge>
          <span style={{color:C.deepBlue,fontFamily:"monospace",fontSize:12,fontWeight:700}}>{incident.id}</span>
          {incident.doraFlag&&<Badge color={C.midBlue}>DORA</Badge>}
          {incident.aiActFlag&&<Badge color={C.deepBlue}>AI ACT</Badge>}
        </div>
        <div style={{color:C.text,fontWeight:700,fontSize:15,marginBottom:4}}>{incident.title}</div>
        <div style={{color:C.muted,fontSize:11,fontFamily:"monospace"}}>{app.name} · {incident.date} · Duration: {incident.duration} · Affected: {incident.affectedUsers.toLocaleString()} users</div>
      </div>

      {loading&&<div style={{padding:48,textAlign:"center"}}><Spinner size={28}/><div style={{color:C.muted,fontFamily:"monospace",fontSize:12,marginTop:16}}>RegSentinel AI is analysing this incident against DORA Art. 5–44 and EU AI Act Art. 6–14…</div></div>}
      {error&&<Card accent={C.accent}><div style={{color:C.accent,fontSize:12,fontFamily:"monospace"}}>{error}</div></Card>}

      {analysis&&!loading&&(
        <div>
          {/* ── COMPLIANCE SUMMARY — structured readable points ── */}
          <div style={{marginBottom:20,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
            {/* Summary header bar */}
            <div style={{background:C.deepBlue,padding:"14px 20px",display:"flex",alignItems:"center",gap:14}}>
              <div style={{flex:1}}>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:9,fontFamily:"monospace",letterSpacing:3,marginBottom:3}}>COMPLIANCE SUMMARY</div>
                <div style={{color:C.white,fontWeight:800,fontSize:15}}>Regulatory Impact Assessment — {incident.id}</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <div style={{background:"rgba(255,255,255,0.12)",borderRadius:6,padding:"6px 14px",textAlign:"center"}}>
                  <div style={{color:"rgba(255,255,255,0.5)",fontSize:8,fontFamily:"monospace",letterSpacing:1}}>SEVERITY</div>
                  <div style={{color:C.white,fontWeight:800,fontSize:14}}>{analysis.combinedRisk?.overallSeverity||"—"}</div>
                </div>
                {analysis.combinedRisk?.overlapDetected&&(
                  <div style={{background:"rgba(0,105,177,0.35)",border:"1px solid rgba(58,143,204,0.7)",borderRadius:6,padding:"6px 12px",color:C.white,fontSize:10,fontWeight:700,fontFamily:"monospace"}}>⚡ DUAL FRAMEWORK</div>
                )}
              </div>
            </div>
            {/* Key findings as bullet points */}
            <div style={{padding:"18px 22px"}}>
              <div style={{marginBottom:4,color:C.deepBlue,fontSize:10,fontFamily:"monospace",fontWeight:700,letterSpacing:2}}>KEY FINDINGS</div>
              {analysis.executiveSummary && analysis.executiveSummary.split(/(?<=[.!?])\s+/).filter(s=>s.trim().length>10).map((point,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 0",borderBottom:i<analysis.executiveSummary.split(/(?<=[.!?])\s+/).filter(s=>s.trim().length>10).length-1?`1px solid ${C.border}`:"none"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:C.deepBlue,color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0,marginTop:1}}>{i+1}</div>
                  <div style={{color:C.text,fontSize:13,lineHeight:1.65}}>{point.trim()}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <Card accent={analysis.doraAnalysis?.inScope?C.midBlue:C.border}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <Badge color={C.midBlue}>DORA</Badge>
                <span style={{color:C.text,fontWeight:700,fontSize:13}}>Digital Operational Resilience Act</span>
                <span style={{marginLeft:"auto",fontSize:16}}>{analysis.doraAnalysis?.inScope?"✅":"⬜"}</span>
              </div>
              {analysis.doraAnalysis?.inScope?(<>
                <InfoRow label="Classification" value={analysis.doraAnalysis.classification}/>
                <InfoRow label="Articles" value={analysis.doraAnalysis.primaryArticles?.join(", ")}/>
                <InfoRow label="Reporting" value={analysis.doraAnalysis.reportingObligation}/>
                <div style={{marginTop:10,padding:"8px 12px",background:C.bgMid,border:`1px solid ${C.border}`,borderRadius:5}}>
                  <div style={{color:C.accent,fontSize:9,fontFamily:"monospace",marginBottom:3}}>GAP IDENTIFIED</div>
                  <div style={{color:C.text,fontSize:11}}>{analysis.doraAnalysis.gapIdentified}</div>
                </div>
                <div style={{marginTop:8,padding:"8px 12px",background:C.bgMid,border:`1px solid ${C.border}`,borderRadius:5}}>
                  <div style={{color:C.midBlue,fontSize:9,fontFamily:"monospace",marginBottom:3}}>REQUIRED ACTION</div>
                  <div style={{color:C.text,fontSize:11}}>{analysis.doraAnalysis.remediationAction}</div>
                </div>
              </>):(<div style={{color:C.muted,fontSize:12}}>This incident does not trigger DORA reporting obligations.</div>)}
            </Card>
            <Card accent={analysis.aiActAnalysis?.inScope?C.deepBlue:C.border}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <Badge color={C.deepBlue}>EU AI ACT</Badge>
                <span style={{color:C.text,fontWeight:700,fontSize:13}}>Artificial Intelligence Act</span>
                <span style={{marginLeft:"auto",fontSize:16}}>{analysis.aiActAnalysis?.inScope?"✅":"⬜"}</span>
              </div>
              {analysis.aiActAnalysis?.inScope?(<>
                <InfoRow label="Risk Category" value={analysis.aiActAnalysis.riskCategory}/>
                <InfoRow label="Articles" value={analysis.aiActAnalysis.primaryArticles?.join(", ")}/>
                <InfoRow label="Obligation" value={analysis.aiActAnalysis.obligationTriggered}/>
                <div style={{marginTop:10,padding:"8px 12px",background:C.bgMid,border:`1px solid ${C.border}`,borderRadius:5}}>
                  <div style={{color:C.accent,fontSize:9,fontFamily:"monospace",marginBottom:3}}>GAP IDENTIFIED</div>
                  <div style={{color:C.text,fontSize:11}}>{analysis.aiActAnalysis.gapIdentified}</div>
                </div>
                <div style={{marginTop:8,padding:"8px 12px",background:C.bgMid,border:`1px solid ${C.border}`,borderRadius:5}}>
                  <div style={{color:C.deepBlue,fontSize:9,fontFamily:"monospace",marginBottom:3}}>REQUIRED ACTION</div>
                  <div style={{color:C.text,fontSize:11}}>{analysis.aiActAnalysis.remediationAction}</div>
                </div>
              </>):(<div style={{color:C.muted,fontSize:12}}>This incident does not trigger EU AI Act obligations.</div>)}
            </Card>
          </div>
          {analysis.combinedRisk?.overlapDetected&&(
            <Card style={{marginBottom:14}} accent={C.accent}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18}}>⚡</span>
                <div>
                  <div style={{color:C.accent,fontSize:10,fontFamily:"monospace",fontWeight:700,marginBottom:4}}>DUAL-FRAMEWORK INTERSECTION</div>
                  {analysis.combinedRisk.intersectionExplanation && analysis.combinedRisk.intersectionExplanation.split(/(?<=[.!?])\s+/).filter(s=>s.trim().length>8).map((pt,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:7}}>
                    <span style={{color:C.accent,fontWeight:800,flexShrink:0}}>›</span>
                    <span style={{color:C.text,fontSize:12,lineHeight:1.65}}>{pt.trim()}</span>
                  </div>
                ))}
                </div>
              </div>
            </Card>
          )}
          <Card style={{marginBottom:14}}>
            <SLabel>Unified Remediation Plan</SLabel>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {analysis.combinedRisk?.unifiedRemediationPlan?.map((item,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"32px 1fr 120px 100px 100px",alignItems:"center",gap:10,padding:"10px 14px",background:C.bgMid,borderRadius:6,border:`1px solid ${C.border}`}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:fc[item.framework]||C.midBlue,display:"flex",alignItems:"center",justifyContent:"center",color:C.white,fontWeight:800,fontSize:12,fontFamily:"monospace",flexShrink:0}}>{item.priority}</div>
                  <div style={{color:C.text,fontSize:12}}>{item.action}</div>
                  <div style={{color:C.muted,fontSize:11,textAlign:"right"}}>{item.owner}</div>
                  <Badge color={fc[item.framework]||C.midBlue}>{item.framework}</Badge>
                  <div style={{color:C.deepBlue,fontSize:11,fontFamily:"monospace",textAlign:"right"}}>{item.deadline}</div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <SLabel>Regulatory Timeline</SLabel>
              {analysis.regulatoryTimeline?.map((t,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:i<(analysis.regulatoryTimeline?.length||0)-1?`1px solid ${C.border}`:"none"}}>
                  <Badge color={stc[t.status]||C.muted}>{t.status}</Badge>
                  <div style={{flex:1}}><div style={{color:C.text,fontSize:12}}>{t.milestone}</div><div style={{color:C.muted,fontSize:10,fontFamily:"monospace"}}>{t.deadline}</div></div>
                  <Badge color={fc[t.framework]||C.midBlue}>{t.framework}</Badge>
                </div>
              ))}
            </Card>
            <Card accent={C.accent}>
              <SLabel color={C.accent}>Financial Exposure</SLabel>
              {analysis.potentialFinancialExposure && analysis.potentialFinancialExposure.split(/(?<=[.!?])\s+/).filter(s=>s.trim().length>8).map((pt,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:8}}>
                  <span style={{color:C.accent,fontWeight:800,flexShrink:0,fontSize:14,lineHeight:"1.4"}}>›</span>
                  <span style={{color:C.text,fontSize:12,lineHeight:1.65}}>{pt.trim()}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function ComplianceWorkstation(){
  const [app,setApp]=useState(null);
  const [incident,setIncident]=useState(null);
  const [activeStep,setActiveStep]=useState(0);
  const [regModal,setRegModal]=useState(null);

  const steps=[
    {n:0,label:"Regulations",done:false,active:true},
    {n:1,label:"NAR Portal",done:!!app},
    {n:2,label:"App Details",done:!!app&&activeStep>2,active:!!app},
    {n:3,label:"WALTZ Flows",done:!!app&&activeStep>3,active:!!app},
    {n:4,label:"ServiceNow Incidents",done:!!incident,active:!!app},
    {n:5,label:"Reg Analysis",done:false,active:!!incident},
  ];

  const stepColor=(s)=>{
    if(s.n===activeStep) return C.accentLight;
    if(s.done) return C.midBlue;
    if(!s.active) return "rgba(255,255,255,0.2)";
    return "rgba(255,255,255,0.4)";
  };

  return (
    <>
      {regModal&&<RegModal which={regModal} onClose={()=>setRegModal(null)}/>}
      <div style={{minHeight:"100vh",background:C.bg,color:C.white,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",display:"flex"}}>
        <style>{`
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          *{box-sizing:border-box}
          ::-webkit-scrollbar{width:5px}
          ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        `}</style>

        {/* SIDEBAR */}
        <div style={{width:220,flexShrink:0,background:C.deepBlue,borderRight:`1px solid rgba(255,255,255,0.1)`,display:"flex",flexDirection:"column",padding:"24px 0"}}>
          <div style={{padding:"0 20px 22px",borderBottom:"1px solid rgba(255,255,255,0.12)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{background:C.accentLight,color:C.darkBlue,fontWeight:900,fontSize:12,padding:"2px 7px",borderRadius:3,fontFamily:"monospace"}}>db</div>
              <span style={{color:C.white,fontWeight:800,fontSize:13}}>RegSentinel</span>
            </div>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:9,fontFamily:"monospace",letterSpacing:2}}>COMPLIANCE WORKSTATION</div>

          </div>
          <div style={{padding:"20px 0",flex:1}}>
            <div style={{padding:"0 20px",color:"rgba(255,255,255,0.4)",fontSize:9,fontFamily:"monospace",letterSpacing:2,marginBottom:12}}>INVESTIGATION STEPS</div>
            {steps.map((s,i)=>(
              <div key={s.n}>
                <button onClick={()=>{if(s.active||s.done||s.n===1||s.n===0)setActiveStep(s.n);}} disabled={!s.active&&!s.done&&s.n!==1&&s.n!==0}
                  style={{width:"100%",background:activeStep===s.n?"rgba(255,255,255,0.12)":"transparent",border:"none",borderRight:activeStep===s.n?`3px solid ${C.accentLight}`:"3px solid transparent",padding:"10px 20px",cursor:(s.active||s.done||s.n===1||s.n===0)?"pointer":"default",display:"flex",alignItems:"center",gap:12,textAlign:"left",transition:"all 0.15s"}}>
                  <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,background:activeStep===s.n?C.accentLight:s.done?C.midBlue:"rgba(255,255,255,0.08)",border:`2px solid ${stepColor(s)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,fontFamily:"monospace",color:activeStep===s.n?C.darkBlue:s.done?C.white:stepColor(s)}}>
                    {s.done?"✓":s.n}
                  </div>
                  <div style={{color:activeStep===s.n?C.white:s.done?"#93C5FD":s.active?"rgba(255,255,255,0.75)":"rgba(255,255,255,0.3)",fontSize:12,fontWeight:activeStep===s.n?700:400}}>{s.label}</div>
                </button>
                {i<steps.length-1&&<div style={{width:2,height:8,background:s.done?C.midBlue:"rgba(255,255,255,0.12)",marginLeft:32}}/>}
              </div>
            ))}
          </div>
          {app&&(
            <div style={{padding:"14px 20px",borderTop:"1px solid rgba(255,255,255,0.12)"}}>
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:9,fontFamily:"monospace",letterSpacing:2,marginBottom:7}}>ACTIVE CASE</div>
              <div style={{color:C.accentLight,fontFamily:"monospace",fontSize:11,fontWeight:700}}>{app.id}</div>
              <div style={{color:"rgba(255,255,255,0.75)",fontSize:11,marginBottom:6}}>{app.name}</div>
              {incident&&<><div style={{color:"rgba(255,255,255,0.4)",fontSize:9,fontFamily:"monospace",letterSpacing:2,margin:"7px 0 3px"}}>INCIDENT</div><div style={{color:"#FCA5A5",fontFamily:"monospace",fontSize:10}}>{incident.id}</div></>}
            </div>
          )}
          {app&&(
            <div style={{padding:"10px 20px",borderTop:"1px solid rgba(255,255,255,0.12)"}}>
              <button onClick={()=>{setApp(null);setIncident(null);setActiveStep(1);}} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.45)",borderRadius:5,padding:"6px 12px",fontSize:11,cursor:"pointer",width:"100%",fontFamily:"monospace"}}>← New Investigation</button>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
          {/* HEADER */}
          <div style={{background:C.deepBlue,position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 12px rgba(22,24,78,0.25)",flexShrink:0}}>
            <div style={{padding:"12px 28px",borderBottom:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",gap:16}}>
              <div style={{flex:1}}>
                <div style={{color:"rgba(255,255,255,0.45)",fontSize:9,fontFamily:"monospace",letterSpacing:3,marginBottom:3}}>DEUTSCHE BANK · REGSENTINEL AI</div>
                <div style={{color:C.white,fontWeight:800,fontSize:17,letterSpacing:0.3}}>AI Powered DB EU Compliance Dashboard</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{textAlign:"right"}}>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:9,fontFamily:"monospace",marginBottom:4}}>FRAMEWORKS</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setRegModal("dora")} title="View DORA regulation details"
                      style={{background:"#0069B1",border:"2px solid #3A8FCC",color:"#FFFFFF",fontSize:11,fontWeight:800,padding:"7px 18px",borderRadius:6,fontFamily:"monospace",letterSpacing:1,cursor:"pointer",boxShadow:"0 0 12px rgba(0,105,177,0.6)",transition:"all 0.15s",display:"flex",alignItems:"center",gap:5}}>
                      <span style={{fontSize:13}}>🛡</span> DORA <span style={{fontSize:10,opacity:0.8}}>↗</span>
                    </button>
                    <button onClick={()=>setRegModal("aiact")} title="View EU AI Act details"
                      style={{background:"#1E2A78",border:"2px solid rgba(255,255,255,0.5)",color:"#FFFFFF",fontSize:11,fontWeight:800,padding:"7px 18px",borderRadius:6,fontFamily:"monospace",letterSpacing:1,cursor:"pointer",boxShadow:"0 0 12px rgba(30,42,120,0.6)",transition:"all 0.15s",display:"flex",alignItems:"center",gap:5}}>
                      <span style={{fontSize:13}}>🤖</span> EU AI ACT <span style={{fontSize:10,opacity:0.8}}>↗</span>
                    </button>
                  </div>
                </div>
                <div style={{width:1,height:32,background:"rgba(255,255,255,0.15)"}}/>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:C.accentLight,boxShadow:`0 0 6px ${C.accentLight}`}}/>
                  <span style={{color:C.accentLight,fontSize:10,fontFamily:"monospace",fontWeight:700}}>ACTIVE</span>
                </div>
              </div>
            </div>
            <div style={{padding:"0 28px",display:"flex",alignItems:"center",minHeight:36}}>
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:10,fontFamily:"monospace"}}>
                {["Regulations","NAR Portal","App Details","WALTZ Flows","ServiceNow Incidents","Reg Analysis"][activeStep]}
              </div>
              {app&&activeStep>=2&&activeStep<5&&(
                <div style={{display:"flex",marginLeft:"auto"}}>
                  {[{n:2,l:"Details"},{n:3,l:"WALTZ"},{n:4,l:"ServiceNow"}].map(t=>(
                    <button key={t.n} onClick={()=>setActiveStep(t.n)} style={{background:"transparent",border:"none",borderBottom:activeStep===t.n?`2px solid ${C.accentLight}`:"2px solid transparent",color:activeStep===t.n?C.white:"rgba(255,255,255,0.4)",padding:"8px 16px",fontSize:11,cursor:"pointer",fontFamily:"monospace",fontWeight:activeStep===t.n?700:400,transition:"all 0.15s"}}>{t.l}</button>
                  ))}
                </div>
              )}
              {incident&&activeStep===5&&(
                <button onClick={()=>setActiveStep(4)} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.45)",padding:"8px 0",fontSize:11,cursor:"pointer",fontFamily:"monospace",marginLeft:"auto"}}>← Back to Incidents</button>
              )}
            </div>
          </div>

          {/* STEP CONTENT */}
          <div style={{padding:28,animation:"fadeIn 0.25s ease",flex:1}}>
            {activeStep===0&&<Step0/>}
            {activeStep===1&&<Step1 onSelect={app=>{setApp(app);setIncident(null);setActiveStep(2);}}/>}
            {activeStep===2&&app&&<Step2 app={app}/>}
            {activeStep===3&&app&&<Step3 app={app}/>}
            {activeStep===4&&app&&<Step4 app={app} onSelect={inc=>{setIncident(inc);setActiveStep(5);}}/>}
            {activeStep===5&&app&&incident&&<Step5 key={incident.id} app={app} incident={incident}/>}
          </div>
        </div>
      </div>
    </>
  );
}
