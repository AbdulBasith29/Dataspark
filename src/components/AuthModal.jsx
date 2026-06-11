import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getSupabaseBrowserClient } from "../lib/supabaseClient.js";
import { useAuth } from "../lib/authContext.jsx";

const M = {
  bg: "rgba(6,8,24,0.98)",
  border: "rgba(255,255,255,0.09)",
  t1: "#F8FAFC", t2: "#E2E8F0", t3: "#94A3B8", dim: "#475569",
  ind: "#818CF8", indB: "#6366F1",
  err: "#F87171", errBg: "rgba(248,113,113,0.08)",
  grn: "#34D399", grnBg: "rgba(52,211,153,0.08)",
  input: "rgba(255,255,255,0.05)",
  EASE: "cubic-bezier(0.23,1,0.32,1)",
};

function friendlyError(msg = "") {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "Incorrect email or password.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox, then sign in.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Sign in instead.";
  if (m.includes("password should be") || m.includes("weak password"))
    return "Password must be at least 6 characters.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts — please wait a moment and try again.";
  if (m.includes("unable to validate") || m.includes("network"))
    return "Network error — check your connection and try again.";
  return msg || "Something went wrong. Please try again.";
}

function Field({ label, id, type = "text", value, onChange, onFocus, onBlur, focused, placeholder, autoComplete, inputRef }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={id} style={{ display: "block", fontSize: 12, fontWeight: 600, color: M.t3, marginBottom: 6, letterSpacing: "0.03em" }}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        style={{
          width: "100%", boxSizing: "border-box",
          background: M.input,
          border: `1px solid ${focused ? "rgba(99,102,241,0.6)" : M.border}`,
          boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
          borderRadius: 8, padding: "11px 14px",
          fontSize: 14, color: M.t1,
          outline: "none",
          transition: `border-color 0.15s ${M.EASE}, box-shadow 0.15s ${M.EASE}`,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      />
    </div>
  );
}

function SubmitBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: "100%", padding: "12px 0",
        background: loading ? "rgba(99,102,241,0.5)" : M.indB,
        color: "#fff", border: "none", borderRadius: 9,
        fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
        transition: `background 0.15s ${M.EASE}, opacity 0.15s`,
        letterSpacing: "-0.01em",
        marginTop: 4,
      }}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

// Inline logo mark with am- prefixed gradient IDs to avoid DOM conflicts
function ModalLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" style={{ display: "block", margin: "0 auto 14px" }}>
      <defs>
        <radialGradient id="am-bg" cx="40%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#07081a" />
        </radialGradient>
        <radialGradient id="am-peak" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#818CF8" />
        </radialGradient>
        <filter id="am-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="32" height="32" rx="7.5" fill="url(#am-bg)" />
      <ellipse cx="16" cy="1.5" rx="12" ry="5" fill="rgba(129,140,248,0.1)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
      <line x1="7.5" y1="24.5" x2="24.5" y2="9" stroke="rgba(129,140,248,0.28)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7.5" cy="24.5" r="2" fill="#4F46E5" opacity="0.7" />
      <circle cx="16" cy="16.75" r="2.5" fill="#6366F1" opacity="0.88" />
      <circle cx="24.5" cy="9" r="5.5" fill="rgba(129,140,248,0.18)" filter="url(#am-glow)" />
      <circle cx="24.5" cy="9" r="3" fill="url(#am-peak)" filter="url(#am-glow)" />
      <line x1="25.5" y1="3.5" x2="25.5" y2="6" stroke="rgba(224,231,255,0.85)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="24.25" y1="4.75" x2="26.75" y2="4.75" stroke="rgba(224,231,255,0.85)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="25.5" cy="4.75" r="0.8" fill="white" />
    </svg>
  );
}

export default function AuthModal() {
  const { isAuthOpen, authTab, closeAuthModal } = useAuth();
  const [view, setView] = useState(authTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [focused, setFocused] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const emailRef = useRef(null);

  useEffect(() => {
    if (isAuthOpen) {
      setView(authTab);
      setError(""); setSuccess("");
      setTimeout(() => emailRef.current?.focus(), 80);
    }
  }, [isAuthOpen, authTab]);

  useEffect(() => {
    if (!isAuthOpen) return;
    const onKey = (e) => { if (e.key === "Escape") closeAuthModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAuthOpen, closeAuthModal]);

  if (!isAuthOpen) return null;

  const clearForm = () => {
    setEmail(""); setPassword(""); setConfirmPassword(""); setDisplayName("");
    setError(""); setSuccess("");
  };

  const switchView = (v) => { clearForm(); setView(v); };

  const fld = (name) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
    focused: focused === name,
  });

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      // SIGNED_IN event in authContext closes the modal automatically
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setSubmitting(true);
    try {
      const { error } = await getSupabaseBrowserClient().auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() || email.split("@")[0] } },
      });
      if (error) throw error;
      setSuccess("Almost there! Check your inbox for a confirmation email, then sign in.");
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      const { error } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/platform`,
      });
      if (error) throw error;
      setSuccess("Password reset email sent — check your inbox.");
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setSubmitting(true);
    try {
      const { error } = await getSupabaseBrowserClient().auth.updateUser({ password });
      if (error) throw error;
      setSuccess("Password updated! You're now signed in.");
      setTimeout(() => closeAuthModal(), 1800);
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const titles = {
    signin: ["Welcome back", "Sign in to continue learning"],
    signup: ["Create your account", "Free during early access"],
    reset: ["Forgot password?", "We'll email you a reset link"],
    new_password: ["Set new password", "Choose a new password for your account"],
  };
  const [title, subtitle] = titles[view] ?? titles.signin;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) closeAuthModal(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(2,6,23,0.8)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "grid", placeItems: "center", padding: 24,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 420,
        background: M.bg,
        border: `1px solid ${M.border}`,
        borderRadius: 18,
        boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
        padding: "28px 32px 32px",
        position: "relative",
      }}>
        {/* Close */}
        <button
          onClick={closeAuthModal}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(255,255,255,0.05)", border: "none",
            cursor: "pointer", color: M.dim, padding: 6,
            borderRadius: 7, display: "flex", alignItems: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <ModalLogo />
          <div style={{ fontSize: 19, fontWeight: 700, color: M.t1, letterSpacing: "-0.02em", marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 13, color: M.t3 }}>{subtitle}</div>
        </div>

        {/* Tab switcher */}
        {(view === "signin" || view === "signup") && (
          <div style={{
            display: "flex", gap: 3,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10, padding: 4, marginBottom: 22,
          }}>
            {[["signin", "Sign in"], ["signup", "Create account"]].map(([v, label]) => (
              <button key={v} onClick={() => switchView(v)} style={{
                flex: 1, padding: "8px 0", borderRadius: 7,
                border: "none", cursor: "pointer",
                background: view === v ? "rgba(99,102,241,0.2)" : "transparent",
                color: view === v ? M.t1 : M.t3,
                fontWeight: view === v ? 600 : 400,
                fontSize: 13,
                transition: `background 0.2s, color 0.2s`,
                fontFamily: "var(--ds-sans), sans-serif",
              }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {error && (
          <div style={{ background: M.errBg, border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: M.err, lineHeight: 1.5 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: M.grnBg, border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: M.grn, lineHeight: 1.5 }}>
            {success}
          </div>
        )}

        {/* ── Sign In ── */}
        {view === "signin" && !success && (
          <form onSubmit={handleSignIn}>
            <Field label="Email" id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputRef={emailRef} {...fld("si-email")} />
            <Field label="Password" id="si-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" {...fld("si-pass")} />
            <SubmitBtn loading={submitting}>Sign in</SubmitBtn>
            <button type="button" onClick={() => switchView("reset")} style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: M.t3, textDecoration: "underline", textDecorationColor: "transparent", transition: "color 0.15s, text-decoration-color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = M.ind; e.currentTarget.style.textDecorationColor = M.ind; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = M.t3; e.currentTarget.style.textDecorationColor = "transparent"; }}
            >
              Forgot password?
            </button>
          </form>
        )}

        {/* ── Sign Up ── */}
        {view === "signup" && !success && (
          <form onSubmit={handleSignUp}>
            <Field label="Name" id="su-name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" autoComplete="name" inputRef={emailRef} {...fld("su-name")} />
            <Field label="Email" id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" {...fld("su-email")} />
            <Field label="Password" id="su-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" {...fld("su-pass")} />
            <SubmitBtn loading={submitting}>Create account</SubmitBtn>
            <p style={{ fontSize: 12, color: M.dim, textAlign: "center", marginTop: 14, marginBottom: 0, lineHeight: 1.5 }}>
              By creating an account you agree to our{" "}
              <a href="/terms" style={{ color: M.t3, textDecoration: "underline" }}>Terms</a>
              {" "}and{" "}
              <a href="/privacy" style={{ color: M.t3, textDecoration: "underline" }}>Privacy Policy</a>.
            </p>
          </form>
        )}

        {/* ── Reset Password ── */}
        {view === "reset" && !success && (
          <form onSubmit={handleReset}>
            <Field label="Email" id="rp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputRef={emailRef} {...fld("rp-email")} />
            <SubmitBtn loading={submitting}>Send reset email</SubmitBtn>
            <button type="button" onClick={() => switchView("signin")} style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: M.t3 }}>
              ← Back to sign in
            </button>
          </form>
        )}

        {/* ── Set New Password (after reset email link) ── */}
        {view === "new_password" && !success && (
          <form onSubmit={handleNewPassword}>
            <Field label="New password" id="np-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" inputRef={emailRef} {...fld("np-pass")} />
            <Field label="Confirm password" id="np-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" autoComplete="new-password" {...fld("np-confirm")} />
            <SubmitBtn loading={submitting}>Update password</SubmitBtn>
          </form>
        )}
      </div>
    </div>
  );
}
