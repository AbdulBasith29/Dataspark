import { useEffect, useRef, useState } from "react";
import { X, Shield, ShieldCheck, Trash2 } from "lucide-react";
import { getSupabaseBrowserClient } from "../lib/supabaseClient.js";

const S = {
  bg: "rgba(6,8,24,0.98)", border: "rgba(255,255,255,0.09)",
  t1: "#F8FAFC", t2: "#E2E8F0", t3: "#94A3B8", dim: "#475569",
  ind: "#818CF8", indB: "#6366F1",
  grn: "#34D399", grnBg: "rgba(52,211,153,0.08)",
  err: "#F87171", errBg: "rgba(248,113,113,0.08)",
  input: "rgba(255,255,255,0.05)",
  card: "rgba(255,255,255,0.03)",
  EASE: "cubic-bezier(0.23,1,0.32,1)",
};

function friendlyError(msg = "") {
  const m = msg.toLowerCase();
  if (m.includes("invalid totp") || m.includes("invalid code") || m.includes("code mismatch"))
    return "Incorrect code — check your app and try again.";
  if (m.includes("factor") && m.includes("not found"))
    return "This factor no longer exists.";
  return msg || "Something went wrong. Try again.";
}

function Msg({ type, children }) {
  const isErr = type === "error";
  return (
    <div style={{
      background: isErr ? S.errBg : S.grnBg,
      border: `1px solid ${isErr ? "rgba(248,113,113,0.2)" : "rgba(52,211,153,0.2)"}`,
      borderRadius: 8, padding: "10px 14px",
      marginBottom: 16, fontSize: 13,
      color: isErr ? S.err : S.grn, lineHeight: 1.5,
    }}>
      {children}
    </div>
  );
}

function CodeInput({ value, onChange, inputRef, focused, onFocus, onBlur }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: S.t3, marginBottom: 6, letterSpacing: "0.03em" }}>
        Verification code
      </label>
      <input
        ref={inputRef}
        type="text" inputMode="numeric" pattern="[0-9]*"
        maxLength={6} value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
        onFocus={onFocus} onBlur={onBlur}
        placeholder="123456" autoComplete="one-time-code"
        required
        style={{
          width: "100%", boxSizing: "border-box",
          background: S.input,
          border: `1px solid ${focused ? "rgba(99,102,241,0.6)" : S.border}`,
          boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
          borderRadius: 8, padding: "11px 14px",
          fontSize: 20, fontWeight: 700, color: S.t1, outline: "none",
          letterSpacing: "0.25em", textAlign: "center",
          transition: `border-color 0.15s ${S.EASE}, box-shadow 0.15s ${S.EASE}`,
          fontFamily: "var(--ds-mono), monospace",
        }}
      />
    </div>
  );
}

// ── Enroll flow ───────────────────────────────────────────────────────────────
function EnrollFlow({ onSuccess, onCancel }) {
  const [step, setStep] = useState("loading"); // loading | scan | verify | done
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const codeRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await getSupabaseBrowserClient().auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Authenticator app",
        });
        if (error) throw error;
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        setStep("scan");
      } catch (err) {
        setError(err.message || "Failed to start enrollment.");
        setStep("scan");
      }
    })();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      const { error } = await getSupabaseBrowserClient().auth.mfa.challengeAndVerify({
        factorId,
        code,
      });
      if (error) throw error;
      setStep("done");
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "loading") {
    return <div style={{ textAlign: "center", padding: "32px 0", color: S.t3, fontSize: 14 }}>Setting up…</div>;
  }

  if (step === "done") {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>
          <ShieldCheck size={44} color={S.grn} style={{ display: "block", margin: "0 auto" }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: S.t1, marginBottom: 6 }}>2FA enabled!</div>
        <div style={{ fontSize: 13, color: S.t3 }}>Your account is now protected with two-factor authentication.</div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: S.t3, marginTop: 0, marginBottom: 16, lineHeight: 1.6 }}>
        Scan this QR code with an authenticator app (Google Authenticator, Authy, 1Password, etc.), then enter the 6-digit code to confirm.
      </p>

      {error && <Msg type="error">{error}</Msg>}

      {/* QR code */}
      {qrCode && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            display: "inline-block", padding: 12,
            background: "#fff", borderRadius: 10,
          }}>
            <img src={qrCode} alt="2FA QR code" width={160} height={160} style={{ display: "block" }} />
          </div>
        </div>
      )}

      {/* Manual entry */}
      {secret && (
        <div style={{
          background: S.card, border: `1px solid ${S.border}`,
          borderRadius: 8, padding: "10px 14px", marginBottom: 18,
        }}>
          <div style={{ fontSize: 11, color: S.dim, fontWeight: 600, marginBottom: 4, letterSpacing: "0.05em" }}>
            CAN'T SCAN? ENTER THIS KEY MANUALLY:
          </div>
          <div style={{
            fontFamily: "var(--ds-mono), monospace", fontSize: 13,
            color: S.t2, letterSpacing: "0.1em", wordBreak: "break-all",
            userSelect: "all",
          }}>
            {secret}
          </div>
        </div>
      )}

      <form onSubmit={handleVerify}>
        <CodeInput
          value={code} onChange={setCode} inputRef={codeRef}
          focused={focused}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={onCancel} style={{
            flex: 1, padding: "11px 0", background: "rgba(255,255,255,0.04)",
            border: `1px solid ${S.border}`, borderRadius: 9, cursor: "pointer",
            color: S.t3, fontSize: 14, fontFamily: "var(--ds-sans), sans-serif",
          }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting || code.length < 6} style={{
            flex: 2, padding: "11px 0",
            background: (submitting || code.length < 6) ? "rgba(99,102,241,0.4)" : S.indB,
            border: "none", borderRadius: 9, cursor: submitting ? "not-allowed" : "pointer",
            color: "#fff", fontSize: 14, fontWeight: 700,
            fontFamily: "var(--ds-sans), sans-serif",
          }}>
            {submitting ? "Verifying…" : "Enable 2FA"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main SecuritySettings modal ───────────────────────────────────────────────
export default function SecuritySettings({ open, onClose }) {
  const [factors, setFactors] = useState([]);
  const [loadingFactors, setLoadingFactors] = useState(true);
  const [view, setView] = useState("status"); // "status" | "enroll"
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFactors = async () => {
    setLoadingFactors(true);
    try {
      const { data, error } = await getSupabaseBrowserClient().auth.mfa.listFactors();
      if (error) throw error;
      setFactors(data?.totp ?? []);
    } catch {
      setFactors([]);
    } finally {
      setLoadingFactors(false);
    }
  };

  useEffect(() => {
    if (open) { setView("status"); setError(""); setSuccess(""); loadFactors(); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleRemove = async (factorId) => {
    setError(""); setRemoving(factorId);
    try {
      const { error } = await getSupabaseBrowserClient().auth.mfa.unenroll({ factorId });
      if (error) throw error;
      setSuccess("2FA removed from your account.");
      await loadFactors();
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setRemoving(null);
    }
  };

  const enrolled = factors.filter(f => f.status === "verified");
  const hasTotp = enrolled.length > 0;

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Security settings"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1001,
        background: "rgba(2,6,23,0.82)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        display: "grid", placeItems: "center", padding: 24,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 420,
        background: S.bg, border: `1px solid ${S.border}`,
        borderRadius: 18,
        boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
        padding: "24px 28px 28px", position: "relative",
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(255,255,255,0.05)", border: "none",
          cursor: "pointer", color: S.dim, padding: 6, borderRadius: 7,
          display: "flex", alignItems: "center",
        }}>
          <X size={16} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Shield size={20} color={S.ind} />
          <div style={{ fontSize: 17, fontWeight: 700, color: S.t1, letterSpacing: "-0.02em" }}>Security</div>
        </div>

        {error && <Msg type="error">{error}</Msg>}
        {success && <Msg type="success">{success}</Msg>}

        {view === "status" && (
          <div>
            {/* 2FA status card */}
            <div style={{
              background: S.card, border: `1px solid ${S.border}`,
              borderRadius: 12, padding: "16px 18px", marginBottom: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {hasTotp
                      ? <ShieldCheck size={16} color={S.grn} />
                      : <Shield size={16} color={S.dim} />
                    }
                    <span style={{ fontSize: 14, fontWeight: 600, color: S.t1 }}>
                      Two-factor authentication
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: S.t3 }}>
                    {loadingFactors ? "Checking…" : hasTotp ? "Enabled — authenticator app" : "Not enabled"}
                  </div>
                </div>
                {!loadingFactors && (
                  hasTotp ? (
                    <button onClick={() => handleRemove(enrolled[0].id)} disabled={!!removing}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
                        borderRadius: 7, padding: "7px 12px", cursor: removing ? "not-allowed" : "pointer",
                        color: S.err, fontSize: 12, fontWeight: 600, flexShrink: 0,
                        fontFamily: "var(--ds-sans), sans-serif",
                      }}
                    >
                      <Trash2 size={13} />
                      {removing ? "Removing…" : "Remove"}
                    </button>
                  ) : (
                    <button onClick={() => { setSuccess(""); setError(""); setView("enroll"); }}
                      style={{
                        background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.28)",
                        borderRadius: 7, padding: "7px 14px", cursor: "pointer",
                        color: S.ind, fontSize: 12, fontWeight: 600, flexShrink: 0,
                        fontFamily: "var(--ds-sans), sans-serif",
                      }}
                    >
                      Enable
                    </button>
                  )
                )}
              </div>
            </div>

            <p style={{ fontSize: 12, color: S.dim, margin: 0, lineHeight: 1.6 }}>
              2FA adds a second layer of protection. After enabling, you'll need your authenticator app every time you sign in.
            </p>
          </div>
        )}

        {view === "enroll" && (
          <EnrollFlow
            onSuccess={() => { setView("status"); setSuccess("2FA enabled successfully."); loadFactors(); }}
            onCancel={() => setView("status")}
          />
        )}
      </div>
    </div>
  );
}
