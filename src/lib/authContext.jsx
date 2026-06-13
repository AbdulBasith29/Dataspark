import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "./supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [session, setSession] = useState(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signup");
  const [mfaFactorId, setMfaFactorId] = useState(null);

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
