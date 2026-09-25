import { useState, useEffect, useRef } from "react";
import { DS } from "../../lib/ds-platform-tokens.js";
import { requestAssessment, coachingPrompt } from "../../lib/practice-attempt.js";
import { runPracticeQuery } from "../../lib/practice-sql-engine.js";

const STEPS = ["app_open", "search", "select", "confirm", "complete"];
const SCHEMA = [["user_id", "int"], ["step", "text"], ["city", "text"], ["event_date", "date"]];
const EMPTY = { draft: "", submission: null, assessment: null, evidence: null, saved: false };
const S = {
  label: { fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.ind, letterSpacing: ".08em", marginBottom: 12 },
  heading: { fontSize: 19, fontWeight: 700, marginBottom: 16 },
  muted: { color: DS.t3, fontSize: 13, lineHeight: 1.7 },
  panel: { background: DS.cardGlass, border: "1px solid " + DS.border, borderRadius: DS.radiusMd, padding: 16 },
  button: { minHeight: 44, padding: "10px 14px", border: "1px solid " + DS.border, borderRadius: DS.radiusSm, background: DS.surface2, color: DS.t1, cursor: "pointer", font: "inherit", fontSize: 13 },
  row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  disclosure: { borderTop: "1px solid " + DS.border, padding: "16px 0", fontSize: 14 },
};

function Action({ primary, disabled, children, ...props }) {
  return <button type="button" {...props} disabled={disabled} style={{ ...S.button, background: primary ? DS.indB : DS.surface2, opacity: disabled ? .5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>{children}</button>;
}

function ResultTable({ result, label }) {
  if (!result) return <p style={S.muted}>No tabular result returned.</p>;
  return <section aria-label={label} style={{ marginTop: 16, minWidth: 0 }}>
    <h3 style={{ fontSize: 15, marginBottom: 8 }}>{label} · {result.rows.length} rows</h3>
    <div tabIndex={0} role="region" aria-label={label + " — scroll horizontally for more columns"} style={{ overflow: "auto", maxHeight: 260, border: "1px solid " + DS.border, borderRadius: 8 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "var(--ds-mono), monospace", fontSize: 12 }}>
        <thead><tr>{result.fields.map(field => <th key={field.name} scope="col" style={{ padding: 12, textAlign: "left", whiteSpace: "nowrap", background: DS.surface2, color: DS.t3 }}>{field.name}</th>)}</tr></thead>
        <tbody>{result.rows.slice(0, 30).map((row, index) => <tr key={index}>{result.fields.map(field => <td key={field.name} style={{ padding: "10px 12px", borderTop: "1px solid " + DS.border, whiteSpace: "nowrap" }}>{row[field.name] == null ? "NULL" : String(row[field.name])}</td>)}</tr>)}</tbody>
      </table>
    </div>
    {result.rows.length > 30 && <p style={S.muted}>Showing the first 30 rows.</p>}
  </section>;
}

export default function SqlTrainingLab({ question, session, retainSession, onSave, onAskTutor, evaluate = requestAssessment, runQuery = runPracticeQuery }) {
  const [attempt, setAttempt] = useState(() => ({ ...EMPTY, ...session }));
  const [view, setView] = useState("brief");
  const [width, setWidth] = useState(() => window.innerWidth);
  const [runStatus, setRunStatus] = useState("");
  const [runError, setRunError] = useState("");
  const [aiStatus, setAiStatus] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [saveError, setSaveError] = useState("");
  const [recap, setRecap] = useState(false);
  const alive = useRef(false);
  const busy = useRef({ run: false, ai: false, save: false });
  const abort = useRef(null);
  const phone = width <= 700;
  const compact = width < 1100;
  const isRevision = attempt.submission !== null && attempt.draft !== attempt.submission;
  const currentEvidence = attempt.evidence?.sql === attempt.draft;
  useEffect(() => {
    alive.current = true;
    const resize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => { alive.current = false; abort.current?.abort(); window.removeEventListener("resize", resize); };
  }, []);
  useEffect(() => { retainSession(attempt); }, [attempt, retainSession]);

  async function execute(compare) {
    if (!attempt.draft.trim() || busy.current.run) return;
    busy.current.run = true;
    const sql = attempt.draft;
    setRunStatus("Preparing PostgreSQL…"); setRunError("");
    try {
      const evidence = await runQuery(sql, question.modelAnswer, compare, () => { if (alive.current) setRunStatus("Running query…"); });
      if (alive.current) setAttempt(previous => ({ ...previous, evidence }));
    } catch (error) {
      if (alive.current) { setRunError(error.message || "SQL could not run. Edit and retry."); setAttempt(previous => ({ ...previous, evidence: null })); }
    } finally { busy.current.run = false; if (alive.current) setRunStatus(""); }
  }

  async function assess() {
    if (!attempt.draft.trim() || busy.current.ai || busy.current.save) return;
    busy.current.ai = true;
    const submitted = attempt.draft;
    abort.current = new AbortController();
    setAiStatus("pending"); setSaveStatus(""); setSaveError(""); setRecap(false);
    // Keep the last successful assessment if the new request fails.
    try {
      const assessment = await evaluate(question, submitted, { signal: abort.current.signal });
      if (alive.current) {
        setAttempt(previous => ({ ...previous, submission: submitted, assessment, saved: false }));
        setAiStatus(""); setView("feedback");
      }
    } catch {
      if (alive.current) { setAiStatus("unavailable"); setView("feedback"); }
    } finally { busy.current.ai = false; }
  }

  async function save() {
    if (!attempt.assessment || busy.current.save || busy.current.ai) return;
    busy.current.save = true; setSaveStatus("pending"); setSaveError("");
    try {
      await onSave(attempt.assessment.score);
      if (alive.current) { setAttempt(previous => ({ ...previous, saved: true })); setSaveStatus("confirmed"); }
    } catch (error) {
      if (alive.current) { setSaveStatus("failed"); setSaveError(error.message || "Assessment was not saved. Please retry."); }
    } finally { busy.current.save = false; }
  }

  function showView(next, focusId) {
    setView(next);
    if (phone || focusId) requestAnimationFrame(() => document.getElementById(focusId || "training-" + next)?.focus());
  }

  const assessment = attempt.assessment;
  return <section aria-label="SQL training lab" style={{ color: DS.t1, padding: phone ? "12px 0 max(24px, env(safe-area-inset-bottom))" : "24px 16px 40px", fontFamily: "var(--ds-sans), sans-serif" }}>
    <header style={{ marginBottom: 24 }}>
      {(!phone || view === "brief") && <p style={S.label}>PRACTICE 03 / PRODUCT ANALYTICS</p>}
      <h1 style={{ fontSize: phone ? 28 : 40, fontWeight: 800, letterSpacing: "-.035em", lineHeight: 1.2, marginBottom: 12 }}>{question.title}</h1>
      <p style={S.muted}><span style={{ color: "#F59E0B" }}>SQL</span> · {question.difficulty} · About {question.estimatedMinutes} minutes · Draft kept in this session</p>
    </header>
    {(!phone || view === "brief") && <ol aria-label="Funnel steps" style={{ display: "flex", gap: 3, padding: 0, listStyle: "none", marginBottom: 28 }}>
      {STEPS.map((step, index) => <li key={step} style={{ flex: 1, minWidth: 0, background: DS.surface2, padding: phone ? "12px 4px" : "16px 20px", clipPath: "polygon(0 0,calc(100% - 9px) 0,100% 50%,calc(100% - 9px) 100%,0 100%,7px 50%)", textAlign: phone ? "center" : "left", fontFamily: "var(--ds-mono), monospace", fontSize: phone ? 10 : 13 }}>
        <span style={{ display: phone ? "block" : "inline", color: DS.ind, marginRight: phone ? 0 : 16, marginBottom: 6 }}>{String(index + 1).padStart(2, "0")}</span>{step}
      </li>)}
    </ol>}
    {phone && <nav aria-label="Attempt views" style={{ ...S.row, marginBottom: 24, borderBottom: "1px solid " + DS.border }}>
      {["brief", "work", "feedback"].map(tab => <button key={tab} type="button" aria-pressed={view === tab} onClick={() => showView(tab)} style={{ ...S.button, flex: 1, background: "transparent", border: 0, borderRadius: 0, borderBottom: view === tab ? "2px solid " + DS.ind : "2px solid transparent", textTransform: "capitalize" }}>{tab}</button>)}
    </nav>}
    <div style={{ display: phone ? "block" : "grid", gridTemplateColumns: compact ? "minmax(210px,1fr) minmax(0,2fr)" : "minmax(220px,.85fr) minmax(0,1.8fr) minmax(260px,1fr)", gap: 28, alignItems: "start" }}>
      <section id="training-brief" tabIndex={-1} hidden={phone && view !== "brief"} style={{ minWidth: 0 }}>
        <p style={S.label}>01 / THE BRIEF</p><h2 style={S.heading}>Measure each next step.</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>{question.prompt}</p>
        <details open style={S.disclosure}><summary style={{ cursor: "pointer", minHeight: 44 }}>Schema · funnel_events</summary>
          <dl>{SCHEMA.map(([name, type]) => <div key={name} style={{ ...S.row, justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + DS.border }}><dt style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 13 }}>{name}</dt><dd style={S.muted}>{type} · not null</dd></div>)}</dl>
        </details>
        <details style={S.disclosure}><summary style={{ cursor: "pointer", minHeight: 44 }}>Hints · {question.hints.length} available</summary><ol style={{ paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>{question.hints.map(hint => <li key={hint} style={{ marginBottom: 12, overflowWrap: "anywhere" }}>{hint}</li>)}</ol></details>
        {phone && <Action primary onClick={() => showView("work")}>Open workspace →</Action>}
      </section>
      <section id="training-work" tabIndex={-1} hidden={phone && view !== "work"} style={{ minWidth: 0 }}>
        <p style={S.label}>02 / YOUR QUERY</p><h2 style={S.heading}>{assessment ? "Revise with a reason." : "Build your query."}</h2>
        {phone && <div style={{ marginBottom: 12 }}><Action onClick={() => showView("brief")}>Schema & hints → Brief</Action></div>}
        <div style={{ border: "1px solid " + DS.border, borderRadius: DS.radiusMd, background: DS.bgElev, overflow: "hidden" }}>
          <div style={{ ...S.row, justifyContent: "space-between", padding: 12, borderBottom: "1px solid " + DS.border, ...S.muted }}><label htmlFor="training-query">attempt.sql</label><span>PostgreSQL</span></div>
          <textarea id="training-query" aria-label="SQL query" spellCheck={false} autoCapitalize="off" autoCorrect="off" value={attempt.draft}
            onChange={event => { setAttempt(previous => ({ ...previous, draft: event.target.value })); setRecap(false); }}
            placeholder="Write your query using funnel_events…"
            style={{ display: "block", width: "100%", minHeight: phone ? 240 : 300, resize: "vertical", padding: 16, background: DS.bgElev, color: DS.t1, border: 0, font: (phone ? "16px" : "14px") + "/1.8 var(--ds-mono), monospace", whiteSpace: phone ? "pre-wrap" : "pre", overflowWrap: phone ? "anywhere" : "normal" }} />
        </div>
        <div style={{ ...S.row, margin: "12px 0" }}>
          <Action primary disabled={!attempt.draft.trim() || !!runStatus} onClick={() => execute(false)}>Run query</Action>
          <Action disabled={!attempt.draft.trim() || !!runStatus} onClick={() => execute(true)}>Check result</Action>
          <Action disabled={!attempt.draft.trim() || aiStatus === "pending" || saveStatus === "pending"} onClick={assess}>Request AI feedback</Action>
        </div>
        <p style={S.muted}>Run executes SQL. Check compares output. AI reviews the rubric.</p>
        <div role="status" style={{ ...S.muted, marginTop: 12 }}>{runStatus}{aiStatus === "pending" && " Reviewing submitted SQL… You can keep editing."}</div>
        {runError && <p role="alert" style={{ ...S.panel, color: "#FCA5A5", marginTop: 12, overflowWrap: "anywhere" }}>SQL did not run: {runError} No grade assigned.</p>}
        {attempt.submission !== null && <details style={{ ...S.disclosure, marginTop: 16 }}><summary style={{ cursor: "pointer", minHeight: 44 }}>Previous assessed answer</summary><pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 13, lineHeight: 1.7 }}>{attempt.submission}</pre></details>}
        <div style={{ borderTop: "1px solid " + DS.border, marginTop: 24, paddingTop: 16 }}>
          <h2 style={S.heading}>Query output</h2>
          {!attempt.evidence && <p style={S.muted}>Run a query to inspect its output.</p>}
          {attempt.evidence && <>
            {!currentEvidence && <p role="status" style={{ color: "#F59E0B", fontSize: 13 }}>Previous query output. Run your edited draft to update it.</p>}
            <ResultTable result={attempt.evidence.result} label="Your query result" />
            {attempt.evidence.comparison && <p role="status" style={{ marginTop: 16, color: attempt.evidence.comparison === "match" ? DS.grn : "#F59E0B", fontSize: 14 }}>{attempt.evidence.comparison === "match" ? "Matches expected result" : "Differs from expected result"}{!currentEvidence && " — previous query"}</p>}
            {attempt.evidence.expected && <details style={S.disclosure}><summary style={{ minHeight: 44, cursor: "pointer" }}>Compare expected output</summary><ResultTable result={attempt.evidence.expected} label="Expected query result" /><p style={S.muted}>Compares column positions and values, ignoring row order and aliases. Numeric values normalise to two decimal places.</p></details>}
          </>}
        </div>
      </section>
      <section id="training-feedback" tabIndex={-1} hidden={phone && view !== "feedback"} style={{ minWidth: 0, gridColumn: compact ? "1 / -1" : "auto", borderLeft: !compact ? "1px solid " + DS.border : 0, paddingLeft: !compact ? 24 : 0 }}>
        <p style={S.label}>03 / THE EVIDENCE</p><h2 style={S.heading}>{assessment ? "Understand your next revision." : "Evidence before a verdict."}</h2>
        {aiStatus === "pending" && <p role="status" style={S.muted}>AI assessment pending. No new score yet.</p>}
        {aiStatus === "unavailable" && <div role="alert" style={{ ...S.panel, color: "#FCA5A5", marginBottom: 16 }}><p>AI feedback is unavailable. No new grade assigned. Your answer is still editable.</p><Action disabled={!attempt.draft.trim()} onClick={assess}>Retry AI feedback</Action></div>}
        {assessment ? <>
          <p style={{ ...S.muted, marginBottom: 12 }}>AI assessment · {assessment.score}/100 · {assessment.totalScore}</p>
          {(isRevision || aiStatus) && <p style={{ color: "#F59E0B", fontSize: 13, marginBottom: 12 }}>This feedback belongs to the previous assessed answer, not the current draft or pending request.</p>}
          <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>{assessment.feedback}</p>
        </> : <p style={S.muted}>Request AI feedback when you want a rubric assessment. Execution and comparison work independently.</p>}
        <ul style={{ listStyle: "none", padding: 0, margin: "16px 0" }}>
          {(assessment ? assessment.rubricScores : question.rubric.map(criterion => ({ criterion }))).map((item, index) => <li key={index} style={{ display: "flex", gap: 10, padding: "12px 0", borderBottom: "1px solid " + DS.border, fontSize: 13, lineHeight: 1.6 }}>
            <span aria-hidden="true" style={{ color: item.met ? DS.grn : DS.t3 }}>{assessment ? (item.met ? "✓" : "△") : "○"}</span>
            <span>{item.criterion}<small style={{ display: "block", ...S.muted }}>{assessment ? (item.met ? "Met" : "Not met") + " · confidence " + item.confidence : "Not assessed"}</small></span>
          </li>)}
        </ul>
        {assessment && <>
          <div style={{ ...S.panel, margin: "20px 0" }}><h3 style={{ fontSize: 14, marginBottom: 8 }}>Explore the reasoning</h3><p style={{ ...S.muted, marginBottom: 12 }}>The tutor draft includes this task, your assessed SQL and feedback. Review it before sending.</p><Action onClick={() => onAskTutor(coachingPrompt(question, attempt.submission, assessment))}>Ask about this feedback →</Action></div>
          <div style={S.row}><Action primary onClick={() => { setRecap(false); showView("work", "training-query"); }}>Revise query →</Action><Action disabled={saveStatus === "pending" || aiStatus === "pending" || attempt.saved} onClick={save}>{saveStatus === "failed" ? "Retry save" : "Save assessment"}</Action></div>
          <div aria-live="polite" style={{ ...S.muted, marginTop: 12 }}>{saveStatus === "pending" ? "Saving… Not confirmed yet." : attempt.saved ? "Best score saved. Your draft remains in this session only." : "Assessment not saved."}</div>
          {saveError && <p role="alert" style={{ color: "#FCA5A5", fontSize: 14, marginTop: 12 }}>{saveError}</p>}
          <div style={{ marginTop: 16 }}><Action onClick={() => setRecap(value => !value)}>{recap ? "Hide recap" : "View attempt recap"}</Action></div>
          {recap && <section style={{ ...S.panel, marginTop: 16 }} aria-label="Attempt recap"><h3 style={{ marginBottom: 12 }}>What this attempt shows</h3>
            <p style={S.muted}>{attempt.evidence ? "SQL output is available" + (currentEvidence ? " for this draft." : " for a previous query.") : "No SQL output recorded."}</p>
            <p style={S.muted}>Comparison: {attempt.evidence?.comparison || "not checked"}. AI score: {assessment.score}/100 for the assessed answer.</p>
            <p style={S.muted}>{isRevision ? "Your revision has not been assessed." : "The draft matches the assessed answer."} {attempt.saved ? "Best score save confirmed." : "Save not confirmed."} No cross-session improvement is inferred.</p>
          </section>}
        </>}
      </section>
    </div>
  </section>;
}
