import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "./supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [session, setSession] = useState(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signup");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Auto-open password reset form when user clicks reset link in email
      if (event === "PASSWORD_RECOVERY") {
        setAuthTab("new_password");
        setIsAuthOpen(true);
      }
      // Close modal on successful sign-in
      if (event === "SIGNED_IN") {
        setIsAuthOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = useCallback((tab = "signup") => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setIsAuthOpen(false), []);

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
      openAuthModal,
      closeAuthModal,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
