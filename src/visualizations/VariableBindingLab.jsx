import { useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const scenarios = {
  alias: {
    label: "Alias a list",
    code: ["a = [1, 2]", "b = a", "b.append(3)"],
    names: [
      { name: "a", objectId: "list-1" },
      { name: "b", objectId: "list-1" },
    ],
    objects: [{ id: "list-1", type: "list", value: "[1, 2, 3]", mutable: true }],
    verdict: "Mutation: b and a are two names bound to the same mutable list, so append changes one shared object.",
    identity: "a is b → True · id(a) == id(b)",
  },
  rebind: {
    label: "Rebind an int",
    code: ["x = 10", "before = id(x)", "x = x + 1"],
    names: [
      { name: "x", objectId: "int-11" },
      { name: "before", objectId: "id-10" },
    ],
    objects: [
      { id: "int-10", type: "int", value: "10", mutable: false, faded: true },
      { id: "int-11", type: "int", value: "11", mutable: false },
      { id: "id-10", type: "debug id", value: "id(10)", mutable: false },
    ],
    verdict: "Rebinding: integers are immutable, so x + 1 creates a different int object and points x at it.",
    identity: "id(x) changed · x == 11 compares value, not identity",
  },
  equal: {
    label: "Equal is not identical",
    code: ["a = [1, 2]", "b = [1, 2]", "a == b", "a is b"],
    names: [
      { name: "a", objectId: "list-a" },
      { name: "b", objectId: "list-b" },
    ],
    objects: [
      { id: "list-a", type: "list", value: "[1, 2]", mutable: true },
      { id: "list-b", type: "list", value: "[1, 2]", mutable: true },
    ],
    verdict: "Value equality can be true while identity is false: these are two separate lists with matching contents.",
    identity: "a == b → True · a is b → False",
  },
  none: {
    label: "Sentinel check",
    code: ["user_id = None", "if user_id is None:", "    raise ValueError(...)"],
    names: [{ name: "user_id", objectId: "none" }],
    objects: [{ id: "none", type: "NoneType", value: "None", mutable: false }],
    verdict: "Use identity for sentinels: None is a singleton, so user_id is None communicates intent and avoids truthiness bugs.",
    identity: "user_id is None → True · do not use user_id == None",
  },
};

const scenarioOrder = ["alias", "rebind", "equal", "none"];

function CodeBlock({ lines }) {
  return (
    <div style={{ fontFamily: "var(--ds-mono)", fontSize: 12, lineHeight: 1.8, color: DS.t2, background: "rgba(255,255,255,0.035)", border: `1px solid ${DS.border}`, borderRadius: 14, padding: "14px 16px" }}>
      {lines.map((line, i) => (
        <div key={`${line}-${i}`}>
          <span style={{ color: DS.dim, marginRight: 10 }}>{String(i + 1).padStart(2, "0")}</span>
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
}

export default function VariableBindingLab() {
  const [active, setActive] = useState("alias");
  const scenario = scenarios[active];
  const objectLookup = useMemo(() => Object.fromEntries(scenario.objects.map((object) => [object.id, object])), [scenario.objects]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
            Name → object binding lab
          </div>
          <p style={{ margin: 0, maxWidth: 560, fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono)", lineHeight: 1.6 }}>
            Choose a scenario and trace whether Python changes an object, creates a new one, or compares value vs identity.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {scenarioOrder.map((key) => {
          const selected = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              style={{
                background: selected ? DS.indB : "rgba(255,255,255,0.04)",
                border: `1px solid ${selected ? "rgba(129,140,248,0.65)" : DS.border}`,
                borderRadius: 999,
                padding: "8px 12px",
                color: selected ? "#fff" : DS.t2,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "var(--ds-mono)",
                cursor: "pointer",
                boxShadow: selected ? DS.shadowCta : "none",
              }}
            >
              {scenarios[key].label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.35fr)", gap: 14 }}>
        <CodeBlock lines={scenario.code} />

        <div style={{ border: `1px solid ${DS.border}`, borderRadius: 14, background: "rgba(15,23,42,0.42)", padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(100px, 0.55fr) minmax(0, 1fr)", gap: 12, alignItems: "stretch" }}>
            <div>
              <div style={{ fontSize: 9, color: DS.grn, letterSpacing: 1.4, fontFamily: "var(--ds-mono)", marginBottom: 8 }}>NAMES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {scenario.names.map((binding) => {
                  const target = objectLookup[binding.objectId];
                  return (
                    <div key={binding.name} style={{ border: `1px solid ${DS.border}`, borderRadius: 10, padding: "9px 10px", background: "rgba(255,255,255,0.04)" }}>
                      <div style={{ color: DS.t1, fontWeight: 800, fontFamily: "var(--ds-mono)", fontSize: 13 }}>{binding.name}</div>
                      <div style={{ color: DS.dim, fontFamily: "var(--ds-mono)", fontSize: 10, marginTop: 3 }}>points to {target.type}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 9, color: DS.ind, letterSpacing: 1.4, fontFamily: "var(--ds-mono)", marginBottom: 8 }}>OBJECTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {scenario.objects.map((object) => (
                  <div key={object.id} style={{ border: `1px solid ${object.mutable ? "rgba(52,211,153,0.28)" : "rgba(129,140,248,0.28)"}`, borderRadius: 12, padding: "10px 12px", opacity: object.faded ? 0.48 : 1, background: object.mutable ? "rgba(52,211,153,0.055)" : "rgba(129,140,248,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <span style={{ color: DS.t1, fontWeight: 800, fontSize: 13 }}>{object.value}</span>
                      <span style={{ color: object.mutable ? DS.grn : DS.ind, fontFamily: "var(--ds-mono)", fontSize: 10 }}>{object.type}</span>
                    </div>
                    <div style={{ color: DS.t3, fontSize: 11, marginTop: 5 }}>{object.mutable ? "mutable state" : "immutable / sentinel"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 10 }}>
        <div style={{ border: "1px solid rgba(52,211,153,0.22)", background: "rgba(52,211,153,0.06)", borderRadius: 12, padding: "12px 14px", color: DS.t2, fontSize: 13, lineHeight: 1.55 }}>
          <strong style={{ color: DS.grn }}>Prediction check:</strong> {scenario.verdict}
        </div>
        <div style={{ border: "1px solid rgba(129,140,248,0.24)", background: "rgba(129,140,248,0.07)", borderRadius: 12, padding: "12px 14px", color: DS.t2, fontSize: 13, lineHeight: 1.55 }}>
          <strong style={{ color: DS.ind }}>Debugger cue:</strong> {scenario.identity}
        </div>
      </div>
    </div>
  );
}
