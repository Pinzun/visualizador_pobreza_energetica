// src/components/TopBar.tsx
import React, { useState, useRef, useEffect } from "react";
import "../styles/TopBar.css";
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
      </div>
    </header>
  );
};

export default TopBar;
