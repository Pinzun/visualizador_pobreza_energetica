// src/components/PieAcceso.tsx
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
  type PieLabelRenderProps,
} from "recharts";

export type DesgloseAcceso = {
  indicador: number; // ← era porcentaje
  total_a: string; // ← era total_indicador
  total_b: string; // ← era total_viviendas
};

type Props = {
  desglose: DesgloseAcceso | null | undefined;
  height?: number;
  title?: string;
};

const COLORS = ["#FE6565", "#006FB3"]; // [Sin, Con]
const nf = new Intl.NumberFormat("es-CL");

function parseCLNumber(s: string | number | null | undefined): number {
  if (s == null) return 0;
  if (typeof s === "number") return s;
  const cleaned = s.toString().trim().replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

const renderPieLabel = (props: PieLabelRenderProps) => {
  const name = (props as any).name ?? "";
  const percent = Number((props as any).percent ?? 0);
  return `${name}: ${(percent * 100).toFixed(0)}%`;
};

export default function PieAcceso({ desglose, height = 250, title }: Props) {
  const totalA = parseCLNumber(desglose?.total_a); // ← era total_indicador
  const totalB = parseCLNumber(desglose?.total_b); // ← era total_viviendas
  const totalCon = Math.max(totalB - totalA, 0);

  const data = [
    { name: "Sin acceso", value: totalA }, // ← era "Sin electricidad"
    { name: "Con acceso", value: totalCon }, // ← era "Con electricidad"
  ];

  return (
    <div style={{ width: "100%", height }}>
      {title && <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>}
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={renderPieLabel}
            isAnimationActive={false}
          >
            {data.map((entry, idx) => (
              <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => nf.format(v)} separator=": " />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
