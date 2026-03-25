// src/components/BarChart.tsx
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

// Diccionario global de labels conocidos — se expande según nuevas claves
const LABELS_CONOCIDOS: Record<string, string> = {
  // Electricidad CENSO
  red_electrica: "Red eléctrica",
  generador: "Generador",
  solar: "Solar",
  eolica: "Eólica",
  otro: "Otro",
  no_tiene: "Sin acceso",
  no_declara: "No declara",
  // Cocción / Calefacción CENSO
  gas: "Gas",
  lenia: "Leña",
  carbon: "Carbón",
  parafina: "Parafina",
  pellet: "Pellet",
  electricidad: "Electricidad",
  // Cocción / Calefacción / ACS CASEN
  gas_licuado: "Gas licuado",
  gas_red: "Gas de red",
  derivados_madera: "Der. madera",
  parafina_petr: "Parafina/Petróleo",
  no_usa: "No usa",
  // Electricidad CASEN
  generador_comunitario: "Gen. comunitario",
  generador_propio: "Gen. propio",
  red_med_compartido: "Red med. compartido",
  red_med_propio: "Red med. propio",
  red_publica_sin_medidor: "Red sin medidor",
  red_publica_y_generador_compartido: "Red + gen. compartido",
  red_publica_y_generador_propio: "Red + gen. propio",
  // Habitabilidad
  total_2000: "Antes 2000",
  total_2000_2006: "2000–2006",
  total_2007_2024: "2007–2024",
  total_censo2024: "Total Censo 2024",
  // Zonas térmicas
  total_a: "Con brecha",
  total_b: "Sin brecha",
};

const COLORS = [
  "#006FB3",
  "#FE6565",
  "#FFA11B",
  "#2D717C",
  "#59A14F",
  "#EDC949",
  "#B07AA1",
  "#FF9DA7",
  "#9C755F",
  "#BAB0AC",
];

type Props = {
  dataTipo?: Record<string, string | number> | null | undefined;
  height?: number;
  showZeros?: boolean;
  unit?: string;
  yDivisor?: number;
  yLabel?: string;
};

const nf = new Intl.NumberFormat("es-CL");

function parseCLNumber(s?: string | number): number {
  if (s === null || s === undefined) return 0;
  if (typeof s === "number") return s;
  const n = Number(String(s).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function labelFor(key: string): string {
  if (LABELS_CONOCIDOS[key]) return LABELS_CONOCIDOS[key];
  // Fallback: capitaliza y reemplaza guiones bajos
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

const CommonBarChart: React.FC<Props> = ({
  dataTipo,
  height = 300,
  showZeros = false,
  unit = "viviendas",
  yDivisor = 1000,
  yLabel = "Miles de viviendas",
}) => {
  const { chartData, total } = useMemo(() => {
    if (!dataTipo) return { chartData: [], total: 0 };

    const rows = Object.entries(dataTipo).map(([key, val], i) => {
      const raw = parseCLNumber(val);
      return {
        key,
        name: labelFor(key),
        valueRaw: raw,
        valueScaled: yDivisor ? raw / yDivisor : raw,
        color: COLORS[i % COLORS.length],
      };
    });

    const filtered = showZeros ? rows : rows.filter((d) => d.valueRaw !== 0);
    const total = rows.reduce((acc, d) => acc + d.valueRaw, 0);
    return { chartData: filtered, total };
  }, [dataTipo, showZeros, yDivisor]);

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
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload;
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
          <RechartsLegend
            verticalAlign="bottom"
            align="center"
            height={30}
            content={<LegendContent />}
          />
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
