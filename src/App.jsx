import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./app/landing-page.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import ThankYouPage from "./pages/ThankYouPage.jsx";
import PreviewPage from "./pages/PreviewPage.jsx";
import { DS, dsGlassCard } from "./lib/ds-platform-tokens.js";

const DataSparkPlatform = lazy(() => import("./app/dataspark-full-platform.jsx"));

function RouteLoadingFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: DS.bg,
        color: DS.t2,
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "var(--ds-sans), Outfit, system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes ds-route-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          ...dsGlassCard({ padding: "28px 32px", maxWidth: 420, textAlign: "center" }),
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            margin: "0 auto 18px",
            borderRadius: "50%",
            border: `2px solid ${DS.border}`,
            borderTopColor: DS.indB,
            animation: "ds-route-spin 0.75s linear infinite",
          }}
          aria-hidden
        />
        <div style={{ fontSize: 18, fontWeight: 700, color: DS.t1, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Loading DataSpark Platform
        </div>
        <div style={{ fontSize: 12, color: DS.t3, lineHeight: 1.55, fontFamily: "var(--ds-mono), monospace" }}>
          Preparing lessons, visual labs, and practice workspace
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/platform" element={<DataSparkPlatform />} />
          <Route path="/dashboard" element={<Navigate to="/platform" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
