// src/components/AsequibilidadChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const NOMBRES_MACROZONA: Record<string, string> = {
  "1": "Norte",
  "2": "Gran Santiago",
  "3": "Centro",
  "4": "Sur",
};

const COLORES_MACROZONA = ["#006FB3", "#2196a8", "#43a8a0", "#6db89a"];

// Parsea números con formato chileno: "51.624" → 51624, "0.21" → 0.21
function parseCLNumber(v: any): number {
  if (typeof v === "number") return v;
  if (!v) return 0;
  const str = String(v).trim();
  // Si tiene punto y no tiene coma, puede ser miles (51.624) o decimal (0.21)
  // Heurística: si hay exactamente 3 dígitos después del punto → miles
  const millesMatch = str.match(/^[\d.]+$/);
  if (millesMatch) {
    return Number(str.replace(/\./g, ""));
  }
  return Number(str.replace(/\./g, "").replace(",", "."));
}

type Props = {
  payload: Record<string, any> | null | undefined;
  titulo?: string;
};

export default function AsequibilidadChart({ payload, titulo }: Props) {
  if (!payload?.desglose) {
    return <div style={{ color: "#666", padding: 16 }}>Cargando datos…</div>;
  }

  const data = Object.entries(
    payload.desglose as Record<string, { indicador: any }>,
  )
    .map(([key, val]) => ({
      macrozona: NOMBRES_MACROZONA[key] ?? `Zona ${key}`,
      key,
      valor: parseCLNumber(val.indicador), // ← parseo defensivo
    }))
    .sort((a, b) => Number(a.key) - Number(b.key));
  return (
    <div style={{ width: "100%" }}>
      {titulo && (
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
          {titulo}
        </div>
      )}

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ left: 10, right: 20, top: 20, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="macrozona" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(v) => `${v.toFixed(2)}`}
            tick={{ fontSize: 11 }}
            label={{
              value: "Indicador",
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
            }}
          />
          <Tooltip
            formatter={(v: any) => [
              Number(v).toLocaleString("es-CL"),
              "Valor indicador",
            ]}
          />
          <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="valor"
              position="top"
              formatter={(v: any) => Number(v).toLocaleString("es-CL")}
              style={{ fontSize: 11, fill: "#333" }}
            />
            {data.map((d, idx) => (
              <Cell
                key={d.key}
                fill={COLORES_MACROZONA[idx % COLORES_MACROZONA.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div
        style={{
          fontSize: 11,
          color: "#888",
          marginTop: 8,
          textAlign: "center",
        }}
      >
        Datos disponibles solo a nivel nacional
      </div>
    </div>
  );
}
