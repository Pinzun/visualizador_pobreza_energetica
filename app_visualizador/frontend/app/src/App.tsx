// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoadingProvider } from "./context/LoadingContext";
import PublicShell from "./layouts/PublicShell";
import "leaflet/dist/leaflet.css";

const Home = lazy(() => import("./pages/Home")); // pesado

export default function App(): JSX.Element {
  return (
    <LoadingProvider>
      <Routes>
        {/* Público: "/" con TopBar + Overlay desde el primer paint */}
        <Route
          index
          element={
            <PublicShell>
              <Suspense fallback={null /* TopBar + Overlay ya visibles */}>
                <Home />
              </Suspense>
            </PublicShell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LoadingProvider>
  );
}
