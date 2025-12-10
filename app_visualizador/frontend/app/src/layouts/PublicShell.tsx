// src/layouts/PublicShell.tsx
import TopBar from "../components/TopBar";
import LoadingOverlay from "../components/LoadingOverlay";

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-shell">
      <header className="topbar">
        <TopBar title="Visualizador Pobreza Energética" />
      </header>
      {/* overlay global, se muestra/oculta según LoadingContext */}
      <LoadingOverlay />
      <main className="public-content">{children}</main>
    </div>
  );
}
