// Development-only component harness, not an application route or build entry.
import { useRef, useState } from "react";
import SqlTrainingLab from "../src/components/platform/SqlTrainingLab.jsx";
import { SQL_QUESTIONS } from "../src/data/questions-sql.js";
const question = SQL_QUESTIONS.find(q => q.id === "sqq3");
const grade = { score: 70, totalScore: "Developing", feedback: "Fixture feedback: revisit the denominator for each step-over-step rate.", rubricScores: question.rubric.map((criterion, index) => ({ criterion, met: index !== 3, confidence: "high" })) };
export default function Preview() {
  const [mode, setMode] = useState("success");
  const [saveMode, setSaveMode] = useState("failed");
  const [mounted, setMounted] = useState(true);
  const [coaching, setCoaching] = useState("");
  const session = useRef(null);
  return <main style={{ maxWidth: 1440, margin: "auto", padding: 16 }}>
    <div style={{ padding: 12, background: "#111726", display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13 }}>
      <strong>COMPONENT QA · Real local SQL · AI/save fixtures · No account writes</strong>
      <label>AI <select value={mode} onChange={e => setMode(e.target.value)}><option value="success">Success fixture</option><option value="failed">Unavailable fixture</option></select></label>
      <label>Save <select value={saveMode} onChange={e => setSaveMode(e.target.value)}><option value="failed">Failure fixture</option><option value="success">Confirmed fixture</option></select></label>
      <button onClick={() => setMounted(value => !value)}>{mounted ? "Leave task" : "Return to task"}</button>
    </div>
    {mounted && <SqlTrainingLab question={question} session={session.current} retainSession={value => { session.current = value; }}
      evaluate={async () => { await new Promise(resolve => setTimeout(resolve, 800)); if (mode === "failed") throw new Error("Unavailable"); return grade; }}
      onSave={async () => { await new Promise(resolve => setTimeout(resolve, 800)); if (saveMode === "failed") throw new Error("Fixture: save failed. Retry without losing your answer."); }}
      onAskTutor={setCoaching} />}
    {coaching && <aside style={{ border: "1px solid #A855F7", padding: 16 }}><h2>Tutor input fixture — review before sending</h2><pre style={{ whiteSpace: "pre-wrap" }}>{coaching}</pre><button onClick={() => setCoaching("")}>Close tutor fixture</button></aside>}
  </main>;
}
