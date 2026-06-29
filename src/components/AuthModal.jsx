import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getSupabaseBrowserClient } from "../lib/supabaseClient.js";
import { useAuth } from "../lib/authContext.jsx";

const M = {
  bg: "rgba(6,8,24,0.98)", border: "rgba(255,255,255,0.09)",
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
    return "An account with this email exists. Sign in instead.";
  if (m.includes("password should be") || m.includes("weak password"))
    return "Password must be at least 6 characters.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts — wait a moment and try again.";
  if (m.includes("invalid totp") || m.includes("invalid code") || m.includes("code mismatch"))
    return "Incorrect code — check your authenticator app and try again.";
  if (m.includes("provider") && m.includes("not enabled"))
    return "This sign-in method isn't enabled yet. Try email/password.";
  return msg || "Something went wrong. Please try again.";
}

// ── Social icons ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.1 22.56 15.4 22.56 12.25z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ── Shared sub-components ─────────────────────────────────────────────────────
function Field({ label, id, type = "text", value, onChange, onFocus, onBlur, focused, placeholder, autoComplete, inputRef, required = true }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={id} style={{ display: "block", fontSize: 12, fontWeight: 600, color: M.t3, marginBottom: 6, letterSpacing: "0.03em" }}>
        {label}
      </label>
      <input
        ref={inputRef} id={id} type={type} value={value}
        onChange={onChange} onFocus={onFocus} onBlur={onBlur}
        placeholder={placeholder} autoComplete={autoComplete}
        required={required}
        style={{
          width: "100%", boxSizing: "border-box",
          background: M.input,
          border: `1px solid ${focused ? "rgba(99,102,241,0.6)" : M.border}`,
          boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
          borderRadius: 8, padding: "11px 14px",
          fontSize: 14, color: M.t1, outline: "none",
          transition: `border-color 0.15s ${M.EASE}, box-shadow 0.15s ${M.EASE}`,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      />
    </div>
  );
}

function SubmitBtn({ loading, children }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: "100%", padding: "12px 0",
      background: loading ? "rgba(99,102,241,0.45)" : M.indB,
      color: "#fff", border: "none", borderRadius: 9,
      fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
      transition: `background 0.15s ${M.EASE}`, letterSpacing: "-0.01em", marginTop: 4,
      fontFamily: "var(--ds-sans), sans-serif",
    }}>
      {loading ? "Please wait…" : children}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
      <div style={{ flex: 1, height: 1, background: M.border }} />
      <span style={{ fontSize: 11, color: M.dim, fontWeight: 500, letterSpacing: "0.06em" }}>OR</span>
      <div style={{ flex: 1, height: 1, background: M.border }} />
    </div>
  );
}

function SocialBtn({ icon, label, onClick, provider }) {
  const [hov, setHov] = useState(false);
  const colors = {
    google:   { bg: "rgba(255,255,255,0.06)", hov: "rgba(255,255,255,0.1)",  border: "rgba(255,255,255,0.12)" },
    facebook: { bg: "rgba(24,119,242,0.1)",   hov: "rgba(24,119,242,0.16)", border: "rgba(24,119,242,0.28)" },
    twitter:  { bg: "rgba(255,255,255,0.06)", hov: "rgba(255,255,255,0.1)",  border: "rgba(255,255,255,0.12)" },
  };
  const c = colors[provider] ?? colors.google;
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "10px 8px", borderRadius: 8,
        background: hov ? c.hov : c.bg,
        border: `1px solid ${c.border}`,
        cursor: "pointer", color: M.t2, fontSize: 13, fontWeight: 500,
        transition: `background 0.15s ${M.EASE}`,
        fontFamily: "var(--ds-sans), sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ModalLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" style={{ display: "block", margin: "0 auto 14px" }}>
      <defs>
        <radialGradient id="am-bg" cx="40%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#1e1b4b" /><stop offset="100%" stopColor="#07081a" />
        </radialGradient>
        <radialGradient id="am-peak" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e0e7ff" /><stop offset="100%" stopColor="#818CF8" />
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

// ── Main modal ────────────────────────────────────────────────────────────────
export default function AuthModal() {
  const { isAuthOpen, authTab, mfaFactorId, closeAuthModal, refreshUser } = useAuth();
  const [view, setView] = useState(authTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [focused, setFocused] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const firstRef = useRef(null);

  useEffect(() => {
    if (isAuthOpen) {
      setView(authTab);
      setError(""); setSuccess(""); setTotpCode("");
      setTimeout(() => firstRef.current?.focus(), 80);
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
    setError(""); setSuccess(""); setTotpCode("");
  };
  const switchView = (v) => { clearForm(); setView(v); };
  const fld = (name) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
    focused: focused === name,
  });

  // ── Handlers ──
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      // authContext's SIGNED_IN handler takes over — checks MFA, closes or switches view
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
        email, password,
        options: { data: { display_name: displayName.trim() || email.split("@")[0] } },
      });
      if (error) throw error;
      setSuccess("Almost there! Check your inbox for a confirmation link, then sign in.");
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
      setSuccess("Reset email sent — check your inbox.");
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
      setSuccess("Password updated — you're signed in.");
      setTimeout(() => closeAuthModal(), 1800);
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      const code = totpCode.replace(/\s/g, "");
      const { error } = await getSupabaseBrowserClient().auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code,
      });
      if (error) throw error;
      await refreshUser(); // Unblocks /platform
      closeAuthModal();
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError("");
    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/platform` },
      });
      if (error) throw error;
      // Page redirects to OAuth provider — nothing else to do here
    } catch (err) {
      setError(friendlyError(err.message));
    }
  };

  // ── View metadata ──
  const meta = {
    signin:       ["Welcome back",        "Sign in to continue learning"],
    signup:       ["Create your account", "Free during early access"],
    reset:        ["Forgot password?",    "We'll email you a reset link"],
    new_password: ["Set new password",    "Choose a new password for your account"],
    mfa_challenge:["Two-factor auth",     "Enter the code from your authenticator app"],
  };
  const [title, subtitle] = meta[view] ?? meta.signin;
  const showSocialAndTabs = view === "signin" || view === "signup";

  return (
    <div
      role="dialog" aria-modal="true" aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) closeAuthModal(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(2,6,23,0.82)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        display: "grid", placeItems: "center", padding: 24,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 420,
        background: M.bg, border: `1px solid ${M.border}`,
        borderRadius: 18,
        boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
        padding: "28px 32px 32px", position: "relative",
      }}>
        {/* Close */}
        <button onClick={closeAuthModal} aria-label="Close" style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(255,255,255,0.05)", border: "none",
          cursor: "pointer", color: M.dim, padding: 6, borderRadius: 7,
          display: "flex", alignItems: "center", transition: "background 0.15s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <ModalLogo />
          <div style={{ fontSize: 19, fontWeight: 700, color: M.t1, letterSpacing: "-0.02em", marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 13, color: M.t3 }}>{subtitle}</div>
        </div>

        {/* Social buttons — only on signin/signup */}
        {showSocialAndTabs && (
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <SocialBtn provider="google" icon={<GoogleIcon />} label="Continue with Google" onClick={() => handleOAuth("google")} />
          </div>
        )}

        {/* Tab switcher */}
        {showSocialAndTabs && (
          <>
            <Divider />
            <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, marginBottom: 20 }}>
              {[["signin", "Sign in"], ["signup", "Create account"]].map(([v, label]) => (
                <button key={v} onClick={() => switchView(v)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 7, border: "none", cursor: "pointer",
                  background: view === v ? "rgba(99,102,241,0.2)" : "transparent",
                  color: view === v ? M.t1 : M.t3,
                  fontWeight: view === v ? 600 : 400,
                  fontSize: 13, transition: `background 0.2s, color 0.2s`,
                  fontFamily: "var(--ds-sans), sans-serif",
                }}>{label}</button>
              ))}
            </div>
          </>
        )}

        {/* Messages */}
        {error && <div style={{ background: M.errBg, border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: M.err, lineHeight: 1.5 }}>{error}</div>}
        {success && <div style={{ background: M.grnBg, border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: M.grn, lineHeight: 1.5 }}>{success}</div>}

        {/* ── Sign In ── */}
        {view === "signin" && !success && (
          <form onSubmit={handleSignIn}>
            <Field label="Email" id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputRef={firstRef} {...fld("si-email")} />
            <Field label="Password" id="si-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" {...fld("si-pass")} />
            <SubmitBtn loading={submitting}>Sign in</SubmitBtn>
            <button type="button" onClick={() => switchView("reset")}
              style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: M.t3, fontFamily: "var(--ds-sans), sans-serif" }}
              onMouseEnter={(e) => e.currentTarget.style.color = M.ind}
              onMouseLeave={(e) => e.currentTarget.style.color = M.t3}
            >Forgot password?</button>
          </form>
        )}

        {/* ── Sign Up ── */}
        {view === "signup" && !success && (
          <form onSubmit={handleSignUp}>
            <Field label="Name" id="su-name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" autoComplete="name" inputRef={firstRef} required={false} {...fld("su-name")} />
            <Field label="Email" id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" {...fld("su-email")} />
            <Field label="Password" id="su-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" {...fld("su-pass")} />
            <SubmitBtn loading={submitting}>Create account</SubmitBtn>
            <p style={{ fontSize: 12, color: M.dim, textAlign: "center", marginTop: 14, marginBottom: 0, lineHeight: 1.5 }}>
              By creating an account you agree to our{" "}
              <a href="/terms" style={{ color: M.t3, textDecoration: "underline" }}>Terms</a>{" "}and{" "}
              <a href="/privacy" style={{ color: M.t3, textDecoration: "underline" }}>Privacy Policy</a>.
            </p>
          </form>
        )}

        {/* ── Forgot Password ── */}
        {view === "reset" && !success && (
          <form onSubmit={handleReset}>
            <Field label="Email" id="rp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputRef={firstRef} {...fld("rp-email")} />
            <SubmitBtn loading={submitting}>Send reset email</SubmitBtn>
            <button type="button" onClick={() => switchView("signin")} style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: M.t3, fontFamily: "var(--ds-sans), sans-serif" }}>
              ← Back to sign in
            </button>
          </form>
        )}

        {/* ── Set New Password ── */}
        {view === "new_password" && !success && (
          <form onSubmit={handleNewPassword}>
            <Field label="New password" id="np-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" inputRef={firstRef} {...fld("np-pass")} />
            <Field label="Confirm password" id="np-conf" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" autoComplete="new-password" {...fld("np-conf")} />
            <SubmitBtn loading={submitting}>Update password</SubmitBtn>
          </form>
        )}

        {/* ── MFA Challenge ── */}
        {view === "mfa_challenge" && !success && (
          <form onSubmit={handleMfaVerify}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                display: "inline-flex", gap: 6, marginBottom: 16,
              }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{
                    width: 36, height: 44, borderRadius: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${M.border}`,
                    display: "grid", placeItems: "center",
                    fontSize: 20, fontWeight: 700, color: M.t1,
                    fontFamily: "var(--ds-mono), monospace",
                  }}>
                    {totpCode.replace(/\s/g, "")[i] || ""}
                  </div>
                ))}
              </div>
              <input
                ref={firstRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9 ]*"
                maxLength={7}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="000000"
                autoComplete="one-time-code"
                style={{
                  position: "absolute", opacity: 0, pointerEvents: "none",
                }}
              />
            </div>
            {/* Visible tap target that focuses the hidden input */}
            <button
              type="button"
              onClick={() => firstRef.current?.focus()}
              style={{
                display: "block", width: "100%", background: "rgba(255,255,255,0.03)",
                border: `1px solid ${M.border}`, borderRadius: 8,
                padding: "10px 14px", marginBottom: 16, cursor: "text",
                fontSize: 13, color: M.t3, textAlign: "center",
                fontFamily: "var(--ds-sans), sans-serif",
              }}
            >
              Tap to enter your 6-digit code
            </button>
            {/* Real visible input as fallback */}
            <Field
              label="Authenticator code"
              id="mfa-code"
              type="text"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="123456"
              autoComplete="one-time-code"
              {...fld("mfa-code")}
            />
            <SubmitBtn loading={submitting}>Verify</SubmitBtn>
          </form>
        )}
      </div>
    </div>
  );
}
