import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "./supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [session, setSession] = useState(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signup");
  const [mfaFactorId, setMfaFactorId] = useState(null);
  const [plan, setPlan] = useState("free"); // "free" | "pro" — synced from user_subscriptions

  // Load the current user's plan from Supabase. Defaults to "free" for any
  // user without an active subscription row.
  const refreshPlan = useCallback(async (currentUser) => {
    const u = currentUser ?? user;
    if (!u) { setPlan("free"); return; }
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("user_subscriptions")
        .select("plan, status")
        .eq("user_id", u.id)
        .maybeSingle();
      const active = data?.plan === "pro" && ["active", "trialing"].includes(data?.status);
      setPlan(active ? "pro" : "free");
    } catch {
      setPlan("free");
    }
  }, [user]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setSession(session);
        setUser(session?.user ?? null);
        setAuthTab("new_password");
        setIsAuthOpen(true);
        return;
      }

      if (event === "SIGNED_IN" && session) {
        // Check whether MFA is required before granting access
        try {
          const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aal?.nextLevel === "aal2" && aal?.currentLevel !== "aal2") {
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const totp = factors?.totp?.[0];
            if (totp) {
              setMfaFactorId(totp.id);
              setSession(session);
              // Keep user null — /platform stays blocked until MFA is complete
              setUser(null);
              setAuthTab("mfa_challenge");
              setIsAuthOpen(true);
              return;
            }
          }
        } catch {
          // MFA check failed — fall through and grant access
        }
        setSession(session);
        setUser(session.user);
        setIsAuthOpen(false);
        return;
      }

      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setMfaFactorId(null);
        return;
      }

      // TOKEN_REFRESHED, USER_UPDATED, etc.
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Keep plan in sync with whoever is signed in.
  useEffect(() => {
    if (user === undefined) return; // still loading
    refreshPlan(user);
  }, [user, refreshPlan]);

  const openAuthModal = useCallback((tab = "signup") => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setIsAuthOpen(false), []);

  // Called by AuthModal after successful MFA verification to unblock the user
  const refreshUser = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
    setMfaFactorId(null);
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading: user === undefined,
      isAuthOpen,
      authTab,
      mfaFactorId,
      plan,
      isPro: plan === "pro",
      refreshPlan,
      openAuthModal,
      closeAuthModal,
      refreshUser,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
