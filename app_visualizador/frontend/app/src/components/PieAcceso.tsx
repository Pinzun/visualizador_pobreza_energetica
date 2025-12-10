// src/components/PieAcceso.tsx
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
  type PieLabelRenderProps, // 👈 importa el tipo correcto
} from "recharts";

export type DesgloseAcceso = {
  porcentaje: string;
  total_indicador: string;
  total_viviendas: string;
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

// 👇 renderer tipado con PieLabelRenderProps
const renderPieLabel = (props: PieLabelRenderProps) => {
  const name = (props as any).name ?? ""; // name puede venir en payload, dependerá de la versión
  const percent = Number((props as any).percent ?? 0);
  return `${name}: ${(percent * 100).toFixed(0)}%`;
};

export default function PieAcceso({ desglose, height = 250, title }: Props) {
  const totalSin = parseCLNumber(desglose?.total_indicador);
  const totalViviendas = parseCLNumber(desglose?.total_viviendas);
  const totalCon = Math.max(totalViviendas - totalSin, 0);

  const data = [
    { name: "Sin electricidad", value: totalSin },
    { name: "Con electricidad", value: totalCon },
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
