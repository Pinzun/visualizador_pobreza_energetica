// src/components/TopBar.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

interface TopBarProps {
  title?: string;
  hideButtons?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  title = "Visualizador Pobreza Energética",
  hideButtons = false,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () =>
      document.removeEventListener("click", handleClickOutside, true);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="top-bar" role="banner">
      <div className="top-bar__inner">
        <div className="top-bar-left">
          <Link to="/home" aria-label="Ir al inicio">
            <img
              src="/logo_energia.svg"
              alt="Ministerio de Energía"
              className="logo"
              style={{ cursor: "pointer" }}
            />
          </Link>
        </div>

        <div className="top-bar-center">
          <h1 className="page-title">{title}</h1>
        </div>

        {!hideButtons && (
          <div className="top-bar-right" ref={dropdownRef}>
            <button
              className="dropdown-toggle"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-label="Abrir menú"
              type="button"
            >
              Menú
            </button>

            {open && (
              <ul className="dropdown-menu" role="menu" aria-label="Menú">
                <li className="dropdown-item" role="none">
                  <Link
                    role="menuitem"
                    to="/home"
                    onClick={() => setOpen(false)}
                  >
                    Inicio
                  </Link>
                </li>
                <li className="dropdown-item" role="none">
                  <Link
                    role="menuitem"
                    to="/mapa"
                    onClick={() => setOpen(false)}
                  >
                    Visualizador
                  </Link>
                </li>
                <li className="dropdown-item" role="none">
                  <Link
                    role="menuitem"
                    to="/manual"
                    onClick={() => setOpen(false)}
                  >
                    Manual de Visor
                  </Link>
                </li>
                {/* Deja/ajusta estas rutas si las usas */}
                <li className="dropdown-item" role="none">
                  <Link
                    role="menuitem"
                    to="/opcion1"
                    onClick={() => setOpen(false)}
                  >
                    Cotiza
                  </Link>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
