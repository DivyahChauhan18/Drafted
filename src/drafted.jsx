import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   DESIGN: Black Atelier
   — Absolute black + champagne single accent
   — Abril Fatface massive display + Crimson Pro body
   — Underline-only inputs that draw on focus
   — Theatrical curtain wipe on generate
   — Full-screen heartbeat generating state
   — Split preview: cream letter + black action panel
   ═══════════════════════════════════════════════════════════ */

const C = {
  black:      "#000000",
  void:       "#080808",
  charcoal:   "#111111",
  iron:       "#1A1A1A",
  gunmetal:   "#222222",
  smoke:      "#333333",
  ash:        "#555555",
  fog:        "#888888",
  mist:       "#AAAAAA",
  ghost:      "#CCCCCC",
  champagne:  "#F0D080",
  champDim:   "#C8A850",
  champGlow:  "rgba(240,208,128,0.20)",
  champTrace: "rgba(240,208,128,0.08)",
  champFaint: "rgba(240,208,128,0.04)",
  cream:      "#FDFAF4",
  creamDeep:  "#F5F0E4",
  white:      "#FFFFFF",
  display:    "'Abril Fatface', Georgia, serif",
  body:       "'Crimson Pro', Georgia, serif",
  mono:       "'DM Mono', monospace",
  sans:       "'Plus Jakarta Sans', system-ui, sans-serif",
};

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

const STEPS = [
  { id:"candidate",    label:"Candidate",    num:"I"   },
  { id:"compensation", label:"Compensation", num:"II"  },
  { id:"terms",        label:"Terms",        num:"III" },
  { id:"company",      label:"Company",      num:"IV"  },
];

const FIELDS = {
  candidate: [
    { key:"candidateName",    label:"Full Name",         placeholder:"Priya Sharma",                          span:2 },
    { key:"role",             label:"Role / Designation",placeholder:"HR Executive"                                 },
    { key:"department",       label:"Department",         placeholder:"Human Resources"                             },
    { key:"reportingManager", label:"Reporting Manager",  placeholder:"Anjali Mehta"                                },
    { key:"workLocation",     label:"Work Location",      placeholder:"Bengaluru, Karnataka"                        },
    { key:"workMode",         label:"Work Mode",          placeholder:"On-site / Hybrid / Remote"                   },
    { key:"startDate",        label:"Start Date",         placeholder:"1st July 2026"                               },
  ],
  compensation: [
    { key:"ctc",        label:"Annual CTC",                 placeholder:"₹4,50,000",                           span:2 },
    { key:"basic",      label:"Basic (monthly)",            placeholder:"₹15,000 — leave blank to auto-calculate"   },
    { key:"hra",        label:"HRA (monthly)",              placeholder:"₹7,500 — leave blank to auto-calculate"    },
    { key:"allowances", label:"Other Allowances (monthly)", placeholder:"₹15,000 — leave blank to auto-calculate"   },
  ],
  terms: [
    { key:"probationPeriod", label:"Probation Period", placeholder:"6 months"                                       },
    { key:"noticePeriod",    label:"Notice Period",    placeholder:"30 days probation, 60 days post confirmation"   },
    { key:"specialClauses",  label:"Special Clauses",  placeholder:"Joining bonus, stock options, relocation...", multiline:true, span:2 },
  ],
  company: [
    { key:"companyName",    label:"Company Name",          placeholder:"Nexus Solutions Pvt. Ltd."                  },
    { key:"hrName",         label:"HR Signatory Name",     placeholder:"Anjali Mehta"                               },
    { key:"companyAddress", label:"Company Address",        placeholder:"12, Koramangala, Bengaluru – 560034", span:2 },
    { key:"hrTitle",        label:"HR Signatory Title",     placeholder:"HR Manager"                                 },
  ],
};

const defaultForm = {
  candidateName:"", role:"", department:"", reportingManager:"",
  workLocation:"", workMode:"", startDate:"", ctc:"", basic:"",
  hra:"", allowances:"", probationPeriod:"", noticePeriod:"",
  specialClauses:"", companyName:"", companyAddress:"", hrName:"", hrTitle:"",
};

const requiredKeys = ["candidateName","role","department","reportingManager","startDate","ctc","probationPeriod","noticePeriod","workLocation","companyName","hrName","hrTitle"];

function buildPrompt(f) {
  return `You are a senior HR professional writing a formal employment offer letter on behalf of ${f.companyName}.
Generate a COMPLETE, professionally worded offer letter. No placeholders, no brackets — fully written.
DETAILS:
Candidate: ${f.candidateName} | Role: ${f.role} | Department: ${f.department}
Reporting to: ${f.reportingManager} | Location: ${f.workLocation} | Mode: ${f.workMode||"On-site"}
Start Date: ${f.startDate} | Annual CTC: ${f.ctc}
Basic: ${f.basic||"~40% of CTC"} | HRA: ${f.hra||"~20% of CTC"} | Allowances: ${f.allowances||"remainder"}
Probation: ${f.probationPeriod} | Notice: ${f.noticePeriod}
Special Clauses: ${f.specialClauses||"None"}
Company: ${f.companyName} | Address: ${f.companyAddress}
Signatory: ${f.hrName}, ${f.hrTitle}
Write a complete offer letter with: letterhead, reference line, salutation, role paragraph, CTC breakdown table, terms, confidentiality clause, joining instructions, acceptance deadline, closing, signature block. Indian corporate English, warm but formal.`;
}

/* ── Underline input ── */
function AtelierInput({ label, value, onChange, placeholder, multiline }) {
  const [focused, setFocused] = useState(false);
  const hasVal = value.length > 0;
  const active = focused || hasVal;

  return (
    <div style={{ position:"relative", paddingTop:20 }}>
      <label style={{
        position:"absolute", top:0, left:0,
        fontSize: active ? 9 : 13,
        letterSpacing: active ? "0.22em" : "0.04em",
        textTransform: active ? "uppercase" : "none",
        color: focused ? C.champagne : active ? C.white : C.ghost,
        fontFamily: active ? C.mono : C.body,
        fontStyle: active ? "normal" : "italic",
        transition:`all 220ms ${EASE}`,
        pointerEvents:"none",
        whiteSpace:"nowrap",
      }}>{label}</label>

      {multiline ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={focused ? placeholder : ""}
          rows={3}
          style={{ width:"100%", background:"transparent", border:"none", color:C.white, fontFamily:C.body, fontStyle:"italic", fontSize:16, lineHeight:1.7, resize:"none", outline:"none", paddingTop:4, caretColor:C.champagne, marginTop:4 }}
        />
      ) : (
        <input
          value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={focused ? placeholder : ""}
          style={{ width:"100%", background:"transparent", border:"none", color:C.white, fontFamily:C.body, fontStyle:"italic", fontSize:16, lineHeight:1, outline:"none", paddingTop:4, paddingBottom:6, caretColor:C.champagne, marginTop:4, display:"block" }}
        />
      )}

      {/* Underline */}
      <div style={{ position:"relative", height:1 }}>
        <div style={{ position:"absolute", inset:0, background:C.smoke }}/>
        <div style={{
          position:"absolute", top:0, left:0, height:"100%",
          background: focused ? C.champagne : hasVal ? C.ash : "transparent",
          width: focused ? "100%" : hasVal ? "100%" : "0%",
          transition:`width 300ms ${EASE}, background 200ms ease`,
          boxShadow: focused ? `0 0 8px ${C.champGlow}` : "none",
        }}/>
      </div>

      {focused && (
        <p style={{ fontSize:10, color:C.ash, fontFamily:C.mono, marginTop:5, letterSpacing:"0.06em", fontStyle:"italic" }}>{placeholder}</p>
      )}
    </div>
  );
}

/* ── Letter renderer ── */
function renderLetter(text) {
  return text.split('\n').map((line, i) => {
    const h = line.replace(/^#{1,3}\s/, '');
    if (/^#{1,3}\s/.test(line)) return <p key={i} style={{ fontSize:14, fontWeight:700, color:"#1A1A1A", margin:"16px 0 5px", fontFamily:"'Crimson Pro',Georgia,serif", letterSpacing:"0.04em" }}>{h}</p>;
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const pts = line.slice(2).split(/\*\*(.*?)\*\*/g);
      return <div key={i} style={{ display:"flex", gap:8, margin:"3px 0" }}><span style={{ flexShrink:0, color:"#888", marginTop:2 }}>—</span><span style={{ fontSize:13.5, lineHeight:1.85, fontFamily:"'Crimson Pro',Georgia,serif" }}>{pts.map((p,j)=>j%2===1?<strong key={j}>{p}</strong>:p)}</span></div>;
    }
    if (!line.trim()) return <div key={i} style={{ height:9 }}/>;
    if (line.match(/^---+$/)) return <div key={i} style={{ height:1, background:"#DDD", margin:"10px 0" }}/>;
    const pts = line.split(/\*\*(.*?)\*\*/g);
    return <p key={i} style={{ margin:"3px 0", lineHeight:1.9, fontSize:13.5, fontFamily:"'Crimson Pro',Georgia,serif" }}>{pts.map((p,j)=>j%2===1?<strong key={j}>{p}</strong>:p)}</p>;
  });
}

export default function Drafted() {
  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState(defaultForm);
  const [stage, setStage]     = useState("form");
  const [letter, setLetter]   = useState("");
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);
  const [curtain, setCurtain] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const stepKey = STEPS[step].id;
  const fields  = FIELDS[stepKey];
  const isLast  = step === STEPS.length - 1;
  const allFilled = requiredKeys.every(k => form[k].trim() !== "");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const [editing, setEditing] = useState(false);

  async function generate() {
    setCurtain(true);
    await new Promise(r => setTimeout(r, 700));
    setStage("generating");
    setCurtain(false);
    setError("");
    try {
      const res = await fetch("/api/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "x-api-key":process.env.REACT_APP_API_KEY, "anthropic-version":"2023-06-01", "anthropic-dangerous-direct-browser-access":"true" },
        body:JSON.stringify({ model:"claude-sonnet-4-5", max_tokens:1500, messages:[{ role:"user", content:buildPrompt(form) }] }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text||"").join("")||"";
      if (!text) throw new Error("Empty response");
      setCurtain(true);
      await new Promise(r => setTimeout(r, 600));
      setLetter(text);
      setStage("preview");
      setCurtain(false);
    } catch(e) {
      setError("Generation failed. Please try again.");
      setStage("form");
      setCurtain(false);
    }
  }

  function downloadPDF() {
    const win = window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html><head><style>@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');body{font-family:'Crimson Pro',Georgia,serif;font-size:14px;line-height:1.9;color:#1a1a1a;max-width:720px;margin:48px auto;padding:0 48px;}pre{white-space:pre-wrap;font-family:inherit;}</style><title>Offer Letter — ${form.candidateName}</title></head><body><pre>${letter.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre><script>window.onload=()=>{window.print()}</` + `script></body></html>`);
    win.document.close();
  }

  function downloadWord() {
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.8;}</style></head><body><pre style='font-family:Times New Roman,serif;font-size:12pt;line-height:1.8;white-space:pre-wrap;'>${letter.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre></body></html>`;
    const blob = new Blob(['\ufeff', html], { type:'application/msword' });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `OfferLetter_${form.candidateName.replace(/\s+/g,"_")}.doc`;
    a.click();
  }

  function copyText() {
    navigator.clipboard.writeText(letter);
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { height:100%; overflow:hidden; }
        html { -webkit-font-smoothing:antialiased; }
        body { background:${C.black}; }
        ::selection { background:${C.champTrace}; color:${C.champagne}; }
        ::placeholder { color:${C.smoke}; font-style:italic; font-family:'Crimson Pro',Georgia,serif; }
        ::-webkit-scrollbar { width:2px; }
        ::-webkit-scrollbar-thumb { background:${C.iron}; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes heartbeat { 0%,100%{transform:scale(1);opacity:0.15} 14%{transform:scale(1.04);opacity:0.9} 28%{transform:scale(1);opacity:0.15} 42%{transform:scale(1.02);opacity:0.6} 70%{transform:scale(1);opacity:0.15} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes curtainIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes curtainOut{ from{transform:translateX(0)} to{transform:translateX(100%)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes runwayIn  { from{width:0} to{width:100%} }
        @keyframes champGlow { 0%,100%{box-shadow:0 0 8px ${C.champGlow}} 50%{box-shadow:0 0 24px ${C.champGlow}} }

        input { color:${C.white}; }
        textarea { color:${C.white}; }
        button { transition:all 160ms ease; cursor:pointer; }
      `}</style>

      {/* CURTAIN WIPE */}
      {curtain && (
        <div style={{ position:"fixed", inset:0, background:C.black, zIndex:999, animation:`curtainIn 600ms ${EASE} both` }}/>
      )}

      <div style={{ height:"100vh", background:C.black, display:"flex", flexDirection:"column", fontFamily:C.sans, overflow:"hidden" }}>

        {/* ══ GENERATING SCREEN ══ */}
        {stage === "generating" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
            {/* Giant heartbeat text */}
            <div style={{ position:"absolute", fontSize:"22vw", fontWeight:400, fontFamily:C.display, color:C.white, letterSpacing:"-4px", lineHeight:1, userSelect:"none", animation:"heartbeat 2.4s ease-in-out infinite", textAlign:"center" }}>DRAFTED</div>

            {/* Foreground content */}
            <div style={{ position:"relative", zIndex:2, textAlign:"center" }}>
              <div style={{ width:1, height:60, background:`linear-gradient(180deg, transparent, ${C.champagne})`, margin:"0 auto 24px" }}/>
              <p style={{ fontFamily:C.body, fontStyle:"italic", fontSize:20, color:C.champagne, letterSpacing:"0.08em" }}>Composing your offer letter...</p>
              <p style={{ fontFamily:C.mono, fontSize:10, color:C.ash, letterSpacing:"0.2em", textTransform:"uppercase", marginTop:8 }}>Please wait</p>
              <div style={{ width:1, height:60, background:`linear-gradient(180deg, ${C.champagne}, transparent)`, margin:"24px auto 0" }}/>
            </div>
          </div>
        )}

        {/* ══ PREVIEW SCREEN ══ */}
        {stage === "preview" && (
          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
            {/* Letter — cream paper */}
            <div style={{ flex:1, overflowY:"auto", background:C.cream, padding:"60px 72px", animation:`fadeIn 600ms ${EASE} both` }}>
              <div style={{ marginBottom:32, display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div>
                  <p style={{ fontSize:9, letterSpacing:"0.24em", textTransform:"uppercase", color:C.champDim, fontFamily:C.mono, margin:"0 0 6px" }}>Offer Letter</p>
                  <h2 style={{ fontFamily:C.display, fontSize:42, color:"#1A1A1A", margin:0, letterSpacing:"-1px", lineHeight:1 }}>{form.candidateName}</h2>
                  <p style={{ fontFamily:C.body, fontStyle:"italic", fontSize:16, color:"#888", marginTop:4 }}>{form.role} · {form.companyName}</p>
                </div>
                <button onClick={() => setEditing(e => !e)}
                  style={{ background:editing?"#1A1A1A":"transparent", color:editing?C.cream:"#888", border:"1px solid #CCC", borderRadius:0, padding:"8px 16px", fontSize:9, fontFamily:C.mono, letterSpacing:"0.18em", textTransform:"uppercase", cursor:"pointer", flexShrink:0, marginTop:6, transition:"all 150ms ease" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#1A1A1A"; e.currentTarget.style.color="#1A1A1A"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="#CCC"; e.currentTarget.style.color=editing?C.cream:"#888"; e.currentTarget.style.background=editing?"#1A1A1A":"transparent"; }}
                >{editing ? "✓ Done editing" : "✎ Edit"}</button>
              </div>
              <div style={{ height:2, background:"#1A1A1A", marginBottom:32 }}/>
              {editing ? (
                <textarea
                  value={letter}
                  onChange={e => setLetter(e.target.value)}
                  style={{ width:"100%", minHeight:600, background:"transparent", border:"none", outline:"none", fontFamily:"'Crimson Pro',Georgia,serif", fontSize:13.5, lineHeight:1.9, color:"#1A1A1A", resize:"vertical", caretColor:"#C8A850" }}
                />
              ) : (
                <div style={{ color:"#1A1A1A" }}>{renderLetter(letter)}</div>
              )}
            </div>

            {/* Actions — pure black */}
            <div style={{ width:320, background:C.black, borderLeft:`1px solid ${C.iron}`, display:"flex", flexDirection:"column", padding:"48px 32px", gap:0, flexShrink:0, animation:`fadeIn 600ms ${EASE} 200ms both` }}>
              <div style={{ marginBottom:32 }}>
                <p style={{ fontSize:9, letterSpacing:"0.24em", textTransform:"uppercase", color:C.ash, fontFamily:C.mono, margin:"0 0 16px" }}>Ready</p>
                <h3 style={{ fontFamily:C.display, fontSize:36, color:C.white, margin:0, lineHeight:1.1, letterSpacing:"-0.5px" }}>
                  Your letter<br/>is<br/><span style={{ color:C.champagne }}>drafted.</span>
                </h3>
              </div>

              <div style={{ height:1, background:C.iron, marginBottom:32 }}/>

              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <button onClick={downloadPDF}
                  style={{ background:C.champagne, color:C.black, border:"none", borderRadius:0, padding:"16px 20px", fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", fontFamily:C.mono, textAlign:"left", boxShadow:`0 0 24px ${C.champGlow}` }}
                  onMouseEnter={e => { e.currentTarget.style.background=C.champDim; }}
                  onMouseLeave={e => { e.currentTarget.style.background=C.champagne; }}
                  onMouseDown={e => { e.currentTarget.style.transform="scale(0.98)"; }}
                  onMouseUp={e => { e.currentTarget.style.transform="scale(1)"; }}
                >Download / Print PDF →</button>

                <button onClick={downloadWord}
                  style={{ background:"transparent", color:C.ghost, border:`1px solid ${C.smoke}`, borderRadius:0, padding:"14px 20px", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", fontFamily:C.mono, textAlign:"left" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=C.champagne; e.currentTarget.style.color=C.champagne; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=C.smoke; e.currentTarget.style.color=C.ghost; }}
                  onMouseDown={e => { e.currentTarget.style.transform="scale(0.98)"; }}
                  onMouseUp={e => { e.currentTarget.style.transform="scale(1)"; }}
                >Download .doc →</button>

                <button onClick={copyText}
                  style={{ background:"transparent", color:copied?C.champagne:C.ash, border:`1px solid ${copied?C.champDim:C.iron}`, borderRadius:0, padding:"14px 20px", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", fontFamily:C.mono, textAlign:"left" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=C.ash; e.currentTarget.style.color=C.white; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=copied?C.champDim:C.iron; e.currentTarget.style.color=copied?C.champagne:C.ash; }}
                >{copied ? "✓ Copied to clipboard" : "Copy text"}</button>

                <button onClick={() => { setStage("form"); setLetter(""); setStep(0); setForm(defaultForm); }}
                  style={{ background:"transparent", color:C.smoke, border:`1px solid ${C.iron}`, borderRadius:0, padding:"14px 20px", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", fontFamily:C.mono, textAlign:"left", marginTop:8 }}
                  onMouseEnter={e => { e.currentTarget.style.color=C.ghost; e.currentTarget.style.borderColor=C.smoke; }}
                  onMouseLeave={e => { e.currentTarget.style.color=C.smoke; e.currentTarget.style.borderColor=C.iron; }}
                >← New Letter</button>
              </div>

              <div style={{ marginTop:"auto", paddingTop:32, borderTop:`1px solid ${C.iron}` }}>
                <p style={{ fontSize:9, color:C.smoke, fontFamily:C.mono, lineHeight:1.9, letterSpacing:"0.04em" }}>
                  Tip: "Download / Print PDF" → save as PDF from your browser's print dialog.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══ FORM SCREEN ══ */}
        {stage === "form" && (
          <>
            {/* Header */}
            <div style={{
              padding:"0 48px", height:70, display:"flex", alignItems:"center", justifyContent:"space-between",
              borderBottom:`1px solid ${C.iron}`, flexShrink:0,
              opacity:mounted?1:0, transform:mounted?"none":"translateY(-8px)",
              transition:`opacity 500ms ${EASE}, transform 500ms ${EASE}`,
            }}>
              <h1 style={{ fontFamily:C.display, fontSize:28, color:C.white, margin:0, letterSpacing:"-0.5px", lineHeight:1 }}>
                Draft<span style={{ color:C.champagne }}>ed</span>
                <span style={{ fontSize:9, color:C.smoke, fontFamily:C.mono, letterSpacing:"0.2em", textTransform:"uppercase", marginLeft:16, verticalAlign:"middle" }}>by Divyah</span>
              </h1>

              {/* Runway step indicator */}
              <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center" }}>
                    <button onClick={() => setStep(i)} style={{
                      background:"transparent", border:"none", padding:"6px 16px",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:5, cursor:"pointer",
                    }}>
                      <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.18em", color:i===step?C.champagne:i<step?C.ash:C.smoke, textTransform:"uppercase" }}>{s.num}</span>
                      <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:i===step?C.champagne:i<step?C.ash:C.smoke, textTransform:"uppercase" }}>{s.label}</span>
                      <div style={{ width:"100%", height:1, background:i===step?C.champagne:i<step?C.smoke:C.iron, boxShadow:i===step?`0 0 8px ${C.champGlow}`:"none", transition:`all 400ms ease` }}/>
                    </button>
                    {i < STEPS.length-1 && <div style={{ width:24, height:1, background:C.iron }}/>}
                  </div>
                ))}
              </div>
            </div>

            {/* Step hero */}
            <div style={{
              padding:"40px 48px 32px", borderBottom:`1px solid ${C.iron}`, flexShrink:0,
              opacity:mounted?1:0, transition:`opacity 500ms ${EASE} 100ms`,
            }}>
              <p style={{ fontSize:9, color:C.ash, fontFamily:C.mono, letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:12 }}>
                Step {step+1} of {STEPS.length}
              </p>
              <h2 style={{ fontFamily:C.display, fontSize:56, color:C.white, margin:0, letterSpacing:"-2px", lineHeight:0.95, animation:`fadeUp 400ms ${EASE} both` }}>
                {stepKey==="candidate"    && <><span style={{ color:C.champagne }}>Who</span> is the<br/>offer for?</>}
                {stepKey==="compensation" && <>What's the<br/><span style={{ color:C.champagne }}>compensation?</span></>}
                {stepKey==="terms"        && <>What are<br/><span style={{ color:C.champagne }}>the terms?</span></>}
                {stepKey==="company"      && <><span style={{ color:C.champagne }}>Company</span><br/>details</>}
              </h2>
            </div>

            {/* Fields */}
            <div style={{ flex:1, overflowY:"auto", padding:"40px 48px" }}>
              <div style={{ maxWidth:680, display:"grid", gridTemplateColumns:"1fr 1fr", gap:"32px 48px" }}>
                {fields.map((f, i) => (
                  <div key={f.key} style={{ gridColumn:f.span===2?"1 / -1":undefined, animation:`slideUp 400ms ${EASE} ${i*50}ms both` }}>
                    <AtelierInput
                      label={f.label}
                      value={form[f.key]}
                      onChange={v => set(f.key, v)}
                      placeholder={f.placeholder}
                      multiline={f.multiline}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ borderTop:`1px solid ${C.iron}`, padding:"20px 48px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0, background:C.void }}>
              <button onClick={() => setStep(s => s-1)} disabled={step===0}
                style={{ background:"transparent", border:"none", color:step===0?C.iron:C.ash, fontSize:10, fontFamily:C.mono, letterSpacing:"0.18em", textTransform:"uppercase", cursor:step===0?"not-allowed":"pointer", padding:"8px 0" }}
                onMouseEnter={e => { if(step>0) e.currentTarget.style.color=C.white; }}
                onMouseLeave={e => { e.currentTarget.style.color=step===0?C.iron:C.ash; }}
              >← Back</button>

              <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                {error && <p style={{ fontSize:11, color:"#ff6b6b", fontFamily:C.mono }}>{error}</p>}

                {isLast ? (
                  <button onClick={generate} disabled={!allFilled}
                    style={{
                      background: allFilled ? C.champagne : C.iron,
                      color: allFilled ? C.black : C.smoke,
                      border:"none", borderRadius:0,
                      padding:"14px 40px", fontSize:10,
                      fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase",
                      fontFamily:C.mono, cursor:allFilled?"pointer":"not-allowed",
                      boxShadow: allFilled ? `0 0 32px ${C.champGlow}` : "none",
                      transition:`all 200ms ease`,
                    }}
                    onMouseEnter={e => { if(allFilled){ e.currentTarget.style.background=C.champDim; e.currentTarget.style.boxShadow=`0 0 48px ${C.champGlow}`; } }}
                    onMouseLeave={e => { if(allFilled){ e.currentTarget.style.background=C.champagne; e.currentTarget.style.boxShadow=`0 0 32px ${C.champGlow}`; } }}
                    onMouseDown={e => { if(allFilled) e.currentTarget.style.transform="scale(0.97)"; }}
                    onMouseUp={e => { e.currentTarget.style.transform="scale(1)"; }}
                  >Generate Letter →</button>
                ) : (
                  <button onClick={() => setStep(s => s+1)}
                    style={{ background:"transparent", border:`1px solid ${C.smoke}`, borderRadius:0, color:C.white, padding:"14px 40px", fontSize:10, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", fontFamily:C.mono }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=C.champagne; e.currentTarget.style.color=C.champagne; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=C.smoke; e.currentTarget.style.color=C.white; }}
                    onMouseDown={e => { e.currentTarget.style.transform="scale(0.97)"; }}
                    onMouseUp={e => { e.currentTarget.style.transform="scale(1)"; }}
                  >Continue →</button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}