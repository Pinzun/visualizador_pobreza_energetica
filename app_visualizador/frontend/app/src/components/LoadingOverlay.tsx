// src/components/LoadingOverlay.tsx
import { useGlobalLoading } from "../context/LoadingContext";
import "../styles/loading.css";
export default function LoadingOverlay() {
  const { loading, progress, message } = useGlobalLoading();
  if (!loading) return null;

  return (
    <div className="fullscreen-loading-overlay">
      <div className="loading-centered-container">
        <img alt="Ministerio de Energía" className="loading-overlay-logo" />
        <div className="loading-overlay-text">{message || "Cargando..."}</div>
        <div className="loading-bar-wrapper">
          <div
            className="loading-bar"
            style={{ width: `${Math.floor(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
