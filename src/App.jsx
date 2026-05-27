import React, { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./app/landing-page.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import ThankYouPage from "./pages/ThankYouPage.jsx";
import PreviewPage from "./pages/PreviewPage.jsx";
import { DS, dsGlassCard } from "./lib/ds-platform-tokens.js";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";

const DataSparkPlatform = lazy(() => import("./app/dataspark-platform.jsx"));

function PlatformLoadingFallback() {
  return (
    <div style={{ minHeight: "100dvh", background: DS.bg, color: DS.t2, display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ ...dsGlassCard({ padding: "20px 24px" }) }}>Loading platform…</div>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route
            path="/platform"
            element={(
              <Suspense fallback={<PlatformLoadingFallback />}>
                <DataSparkPlatform />
              </Suspense>
            )}
          />
          <Route path="/dashboard" element={<Navigate to="/platform" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
