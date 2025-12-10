// src/components/Legend.tsx
import React from "react";

export type LeyendaBin = {
  min: number;
  max: number;
  label: string;
  color: string; // "#RRGGBB"
};

export type LeyendaMapa = {
  titulo: string;
  nota?: string;
  unidad?: string;
  tipo: "discreto" | "secuencial";
  formato_tooltip?: string;
  bins: LeyendaBin[];
};

type Props = {
  leyenda: LeyendaMapa;
  className?: string;
};

const Legend: React.FC<Props> = ({ leyenda, className }) => {
  return (
    <div
      className={className}
      style={{
        marginTop: 16,
        background: "rgba(255,255,255,0.96)",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{leyenda.titulo}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {leyenda.bins.map((b, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              aria-hidden
              style={{
                width: 20,
                height: 20,
                background: b.color,
                border: "1px solid #999",
                borderRadius: 3,
                flex: "0 0 auto",
              }}
              title={b.label}
            />
            <div>{b.label}</div>
          </div>
        ))}
      </div>

      {leyenda.nota && (
        <div style={{ marginTop: 10, color: "#666", fontSize: 12 }}>
          {leyenda.nota}
        </div>
      )}
    </div>
  );
};

export default Legend;
