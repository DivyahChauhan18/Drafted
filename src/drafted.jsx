import { useState } from "react";

const C = {
  bg: "#f2f4f2",
  surface: "#ffffff",
  topbar: "#1e2a24",
  border: "#d4ddd6",
  borderLight: "#e8f0e8",
  emerald: "#1a6644",
  emeraldLight: "#4caf82",
  emeraldSoft: "rgba(26,102,68,0.08)",
  emeraldBorder: "rgba(26,102,68,0.2)",
  text: "#1e2a24",
  textSub: "#374151",
  muted: "#6b7c72",
  mutedLight: "#9aab9e",
  font: "'Plus Jakarta Sans', sans-serif",
};

const STEPS = [
  { id: "candidate", label: "Candidate", icon: "01" },
  { id: "compensation", label: "Compensation", icon: "02" },
  { id: "terms", label: "Terms", icon: "03" },
  { id: "company", label: "Company", icon: "04" },
];

const FIELDS = {
  candidate: [
    { key: "candidateName", label: "Full Name", placeholder: "Priya Sharma", span: 2 },
    { key: "role", label: "Role / Designation", placeholder: "HR Executive" },
    { key: "department", label: "Department", placeholder: "Human Resources" },
    { key: "reportingManager", label: "Reporting Manager", placeholder: "Anjali Mehta" },
    { key: "workLocation", label: "Work Location", placeholder: "Bengaluru, Karnataka" },
    { key: "workMode", label: "Work Mode", placeholder: "On-site / Hybrid / Remote" },
    { key: "startDate", label: "Start Date", placeholder: "1st July 2026" },
  ],
  compensation: [
    { key: "ctc", label: "Annual CTC", placeholder: "₹4,50,000", span: 2 },
    { key: "basic", label: "Basic (monthly)", placeholder: "₹15,000 — leave blank to auto-calculate" },
    { key: "hra", label: "HRA (monthly)", placeholder: "₹7,500 — leave blank to auto-calculate" },
    { key: "allowances", label: "Other Allowances (monthly)", placeholder: "₹15,000 — leave blank to auto-calculate" },
  ],
  terms: [
    { key: "probationPeriod", label: "Probation Period", placeholder: "6 months" },
    { key: "noticePeriod", label: "Notice Period", placeholder: "30 days during probation, 60 days post confirmation" },
    { key: "specialClauses", label: "Special Clauses (optional)", placeholder: "Joining bonus, stock options, relocation...", multiline: true, span: 2 },
  ],
  company: [
    { key: "companyName", label: "Company Name", placeholder: "Nexus Solutions Pvt. Ltd." },
    { key: "hrName", label: "HR Signatory Name", placeholder: "Anjali Mehta" },
    { key: "companyAddress", label: "Company Address", placeholder: "12, Koramangala, Bengaluru – 560034", span: 2 },
    { key: "hrTitle", label: "HR Signatory Title", placeholder: "HR Manager" },
  ],
};

const defaultForm = {
  candidateName: "", role: "", department: "", reportingManager: "",
  workLocation: "", workMode: "", startDate: "", ctc: "", basic: "",
  hra: "", allowances: "", probationPeriod: "", noticePeriod: "",
  specialClauses: "", companyName: "", companyAddress: "", hrName: "", hrTitle: "",
};

function buildPrompt(f) {
  return `You are a senior HR professional writing a formal employment offer letter on behalf of ${f.companyName}.

Generate a COMPLETE, professionally worded offer letter. No placeholders, no brackets — fully written.

DETAILS:
Candidate: ${f.candidateName} | Role: ${f.role} | Department: ${f.department}
Reporting to: ${f.reportingManager} | Location: ${f.workLocation} | Mode: ${f.workMode || "On-site"}
Start Date: ${f.startDate} | Annual CTC: ${f.ctc}
Basic: ${f.basic || "~40% of CTC"} | HRA: ${f.hra || "~20% of CTC"} | Allowances: ${f.allowances || "remainder"}
Probation: ${f.probationPeriod} | Notice: ${f.noticePeriod}
Special Clauses: ${f.specialClauses || "None"}
Company: ${f.companyName} | Address: ${f.companyAddress}
Signatory: ${f.hrName}, ${f.hrTitle}

Write a complete offer letter with: letterhead, reference line, salutation, role paragraph, CTC breakdown table, terms, confidentiality clause, joining instructions, acceptance deadline, closing, signature block. Indian corporate English, warm but formal.`;
}

export default function Drafted() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [stage, setStage] = useState("form"); // form | generating | preview
  const [letter, setLetter] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const stepKey = STEPS[step].id;
  const fields = FIELDS[stepKey];
  const isLast = step === STEPS.length - 1;
  const requiredKeys = ["candidateName", "role", "department", "reportingManager", "startDate", "ctc", "probationPeriod", "noticePeriod", "workLocation", "companyName", "hrName", "hrTitle"];
  const allFilled = requiredKeys.every(k => form[k].trim() !== "");
  const progress = ((step + 1) / STEPS.length) * 100;

  async function generate() {
    setStage("generating");
    setError("");
    try {
      const res = await fetch("/api/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.REACT_APP_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          messages: [{ role: "user", content: buildPrompt(form) }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text) throw new Error("Empty response");
      setLetter(text);
      setStage("preview");
    } catch (e) {
      setError("Generation failed. Please try again.");
      setStage("form");
    }
  }

  function downloadTxt() {
    const blob = new Blob([letter], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `OfferLetter_${form.candidateName.replace(/\s+/g, "_")}.txt`;
    a.click();
  }

  function downloadPDF() {
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><style>body{font-family:'Times New Roman',serif;font-size:13px;line-height:1.8;color:#1a1a1a;max-width:720px;margin:40px auto;padding:0 40px;}pre{white-space:pre-wrap;font-family:inherit;}</style><title>Offer Letter</title></head><body><pre>${letter.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre><script>window.onload=()=>{window.print();}</script></body></html>`);
    win.document.close();
  }

  function copyText() {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const S = {
    root: { minHeight: "100vh", background: C.bg, fontFamily: C.font, color: C.text, display: "flex", flexDirection: "column" },
    topbar: { background: C.topbar, height: 60, padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
    logo: { fontSize: 18, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 },
    logoAccent: { color: C.emeraldLight },
    logoBadge: { fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", marginLeft: 14 },
    main: { flex: 1, display: "flex", flexDirection: "column" },
  };

  if (stage === "generating") return (
    <div style={S.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
      <div style={S.topbar}>
        <h1 style={S.logo}>Draft<span style={S.logoAccent}>ed</span><span style={S.logoBadge}>by Divyah</span></h1>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
        <div style={{ width: 52, height: 52, border: `3px solid ${C.borderLight}`, borderTop: `3px solid ${C.emerald}`, borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 6px" }}>Writing your offer letter...</p>
          <p style={{ fontSize: 13, color: C.muted }}>Crafting a complete, professional document</p>
        </div>
      </div>
    </div>
  );

  if (stage === "preview") return (
    <div style={S.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); button:hover{opacity:0.85}`}</style>
      <div style={S.topbar}>
        <h1 style={S.logo}>Draft<span style={S.logoAccent}>ed</span><span style={S.logoBadge}>by Divyah</span></h1>
        <button onClick={() => { setStage("form"); setLetter(""); setStep(0); setForm(defaultForm); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, color: "rgba(255,255,255,0.6)", fontSize: 10, padding: "6px 16px", cursor: "pointer", fontFamily: C.font, letterSpacing: "0.1em", textTransform: "uppercase" }}>← New Letter</button>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 380px", overflow: "hidden" }}>
        {/* Letter preview */}
        <div style={{ overflowY: "auto", padding: "40px 48px", background: C.bg }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.emerald, fontWeight: 700, margin: "0 0 4px" }}>Generated Letter</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: C.text }}>Offer for {form.candidateName}</h2>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "40px 48px", whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.9, color: C.text, fontFamily: "'Times New Roman', serif", boxShadow: "0 2px 12px rgba(30,42,36,0.06)" }}>
            {letter}
          </div>
        </div>

        {/* Actions panel */}
        <div style={{ background: C.topbar, padding: "40px 32px", display: "flex", flexDirection: "column", gap: 16, borderLeft: `1px solid rgba(255,255,255,0.08)` }}>
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.emeraldLight, margin: "0 0 8px" }}>Ready to share</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1.3 }}>Your offer letter is ready</h3>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
          <button onClick={downloadPDF} style={{ background: C.emerald, color: "#ffffff", border: "none", borderRadius: 6, padding: "14px 20px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: C.font, cursor: "pointer", textAlign: "left", boxShadow: "0 2px 8px rgba(26,102,68,0.4)" }}>
            Download / Print PDF →
          </button>
          <button onClick={downloadTxt} style={{ background: "rgba(255,255,255,0.08)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "12px 20px", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: C.font, cursor: "pointer", textAlign: "left" }}>
            Download .txt
          </button>
          <button onClick={copyText} style={{ background: "transparent", color: copied ? C.emeraldLight : "rgba(255,255,255,0.5)", border: `1px solid ${copied ? C.emeraldLight : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "12px 20px", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: C.font, cursor: "pointer", textAlign: "left" }}>
            {copied ? "✓ Copied!" : "Copy Text"}
          </button>
          <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginTop: 8 }} />
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>Tip: Use "Download / Print PDF" → Save as PDF from your browser's print dialog.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); input:focus,textarea:focus{border-color:${C.emerald}!important;box-shadow:0 0 0 3px ${C.emeraldSoft}!important;outline:none} button:hover{opacity:0.88}`}</style>

      {/* Topbar */}
      <div style={S.topbar}>
        <h1 style={S.logo}>Draft<span style={S.logoAccent}>ed</span><span style={S.logoBadge}>by Divyah</span></h1>
        <div style={{ display: "flex", gap: 6 }}>
          {STEPS.map((s, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ width: 28, height: 28, borderRadius: "50%", background: i === step ? C.emerald : i < step ? "rgba(76,175,130,0.3)" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
              {i < step ? <span style={{ color: C.emeraldLight, fontSize: 11 }}>✓</span> : <span style={{ fontSize: 9, color: i === step ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: 700 }}>{s.icon}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: C.borderLight }}>
        <div style={{ height: "100%", width: `${progress}%`, background: C.emerald, transition: "width 0.4s ease", boxShadow: `0 0 8px ${C.emerald}` }} />
      </div>

      {/* Step content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Step hero */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "32px 48px" }}>
          <div style={{ maxWidth: 680 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: C.emerald, fontWeight: 700, margin: "0 0 8px", fontFamily: C.font }}>Step {step + 1} of {STEPS.length}</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
              {stepKey === "candidate" && "Who is the offer for?"}
              {stepKey === "compensation" && "What's the compensation?"}
              {stepKey === "terms" && "What are the terms?"}
              {stepKey === "company" && "Company details"}
            </h2>
          </div>
        </div>

        {/* Fields */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 48px" }}>
          <div style={{ maxWidth: 680, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {fields.map(f => (
              <div key={f.key} style={{ gridColumn: f.span === 2 ? "1 / -1" : undefined, display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 600, fontFamily: C.font }}>{f.label}</label>
                {f.multiline ? (
                  <textarea
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, padding: "11px 14px", fontFamily: C.font, resize: "vertical", minHeight: 80, transition: "all 0.15s" }}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  />
                ) : (
                  <input
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, padding: "11px 14px", fontFamily: C.font, transition: "all 0.15s" }}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: step === 0 ? C.mutedLight : C.text, fontSize: 11, padding: "11px 24px", cursor: step === 0 ? "not-allowed" : "pointer", fontFamily: C.font, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}
          >← Back</button>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {error && <p style={{ fontSize: 12, color: "#c0392b", margin: 0 }}>{error}</p>}
            {isLast ? (
              <button
                onClick={generate}
                disabled={!allFilled}
                style={{ background: allFilled ? C.emerald : C.border, color: allFilled ? "#ffffff" : C.mutedLight, border: "none", borderRadius: 6, padding: "12px 32px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: C.font, cursor: allFilled ? "pointer" : "not-allowed", boxShadow: allFilled ? `0 2px 12px rgba(26,102,68,0.3)` : "none", transition: "all 0.2s" }}
              >Generate Letter →</button>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                style={{ background: C.topbar, color: "#ffffff", border: "none", borderRadius: 6, padding: "12px 32px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: C.font, cursor: "pointer" }}
              >Next →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}