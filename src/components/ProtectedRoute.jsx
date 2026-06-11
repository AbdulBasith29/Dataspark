import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/authContext.jsx";
import { DS, dsGlassCard } from "../lib/ds-platform-tokens.js";

function Spinner() {
  return (
    <div style={{ minHeight: "100dvh", background: DS.bg, display: "grid", placeItems: "center" }}>
      <div style={{ ...dsGlassCard({ padding: "20px 28px" }), color: DS.t3, fontSize: 14 }}>
        Loading…
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { user, loading, openAuthModal } = useAuth();

  useEffect(() => {
    if (!loading && user === null) {
      openAuthModal("signin");
    }
  }, [loading, user, openAuthModal]);

  if (loading) return <Spinner />;
  if (user === null) return <Navigate to="/" replace />;
  return children;
}
