// src/components/barchart.tsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend as RechartsLegend,
  Cell,
} from "recharts";

export type TipoEnergetico = {
  red_electrica?: string;
  generador?: string;
  solar?: string;
  eolica?: string;
  otro?: string;
  no_tiene?: string;
  no_declara?: string;
};

type Props = {
  dataTipo?: TipoEnergetico | null | undefined;
  height?: number;
  showZeros?: boolean;
  unit?: string; // unidad real (p.ej. "viviendas")
  yDivisor?: number; // escala visual (p.ej. 1000 => miles)
  yLabel?: string; // etiqueta eje Y (p.ej. "Miles de viviendas")
};

const nf = new Intl.NumberFormat("es-CL");

function parseCLInt(s?: string): number {
  if (s === null || s === undefined) return 0;
  const n = Number(String(s).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

const ORDER: (keyof TipoEnergetico)[] = [
  "red_electrica",
  "generador",
  "solar",
  "eolica",
  "otro",
  "no_tiene",
  "no_declara",
];
const LABELS: Record<keyof TipoEnergetico, string> = {
  red_electrica: "Red eléctrica",
  generador: "Generador",
  solar: "Solar",
  eolica: "Eólica",
  otro: "Otro",
  no_tiene: "Sin acceso",
  no_declara: "No declara",
};
const COLORS = [
  "#006FB3",
  "#FE6565",
  "#FFA11B",
  "#2D717C",
  "#59A14F",
  "#EDC949",
  "#B07AA1",
];
const CommonBarChart: React.FC<Props> = ({
  dataTipo,
  height = 300,
  showZeros = false,
  unit = "viviendas",
  yDivisor = 1000,
  yLabel = "Miles de viviendas",
}) => {
  const { chartData, total } = useMemo(() => {
    const src = dataTipo ?? {};
    const rows = ORDER.map((k, i) => {
      const raw = parseCLInt(src[k]);
      return {
        key: k,
        name: LABELS[k],
        valueRaw: raw, // valor real
        valueScaled: yDivisor ? raw / yDivisor : raw, // valor para graficar
        color: COLORS[i % COLORS.length],
      };
    });
    const filtered = showZeros ? rows : rows.filter((d) => d.valueRaw !== 0);
    const total = rows.reduce((acc, d) => acc + d.valueRaw, 0);
    return { chartData: filtered, total };
  }, [dataTipo, showZeros, yDivisor]);

  // Leyenda custom “dentro” del gráfico (se renderiza en el wrapper de Recharts)
  const LegendContent: React.FC = () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
        fontSize: 12,
        paddingTop: 4,
      }}
    >
      {chartData.map((d) => (
        <span
          key={d.key}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <span
            aria-hidden
            style={{
              width: 12,
              height: 12,
              background: d.color,
              border: "1px solid #999",
              borderRadius: 2,
            }}
          />
          {d.name}
        </span>
      ))}
    </div>
  );

  const TooltipContent = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0]?.payload; // objeto del dato
    const raw = Number(p?.valueRaw || 0);
    const scaled = Number(p?.valueScaled || 0);
    const pct = total > 0 ? (raw / total) * 100 : 0;

    return (
      <div
        style={{
          background: "rgba(255,255,255,0.98)",
          border: "1px solid #e5e7eb",
          padding: "8px 10px",
          borderRadius: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          fontSize: 13,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div>
          {nf.format(raw)} {unit}
        </div>
        {yDivisor !== 1 && (
          <div style={{ color: "#555" }}>
            ({nf.format(scaled)} {yLabel.toLowerCase()})
          </div>
        )}
        <div style={{ color: "#555" }}>{pct.toFixed(1)}%</div>
      </div>
    );
  };

  if (!chartData.length) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: 14,
        }}
      >
        Sin datos para graficar.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 12, left: 8, bottom: 46 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={48}
          />
          <YAxis
            tickFormatter={(v) => nf.format(v as number)}
            width={70}
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
              offset: 10,
            }}
          />
          <Tooltip content={<TooltipContent />} />

          {/* Leyenda colocada dentro del chart */}
          <RechartsLegend
            verticalAlign="bottom"
            align="center"
            height={30}
            content={<LegendContent />}
          />

          {/* Graficamos el valor escalado */}
          <Bar dataKey="valueScaled" radius={[4, 4, 0, 0]}>
            {chartData.map((d) => (
              <Cell key={d.key} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommonBarChart;
