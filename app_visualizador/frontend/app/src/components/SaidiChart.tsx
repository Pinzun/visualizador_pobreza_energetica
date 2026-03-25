// src/components/SaidiChart.tsx
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

const NOMBRES_REGION: Record<string, string> = {
  "01": "Tarapacá",
  "02": "Antofagasta",
  "03": "Atacama",
  "04": "Coquimbo",
  "05": "Valparaíso",
  "06": "O'Higgins",
  "07": "Maule",
  "08": "Biobío",
  "09": "La Araucanía",
  "10": "Los Lagos",
  "11": "Aysén",
  "12": "Magallanes",
  "13": "Metropolitana",
  "14": "Los Ríos",
  "15": "Arica y Parinacota",
  "16": "Ñuble",
};

type DesgloseAnual = {
  promedio_anual?: number;
  promedio_nacional_anual?: number;
  promedio_regional_anual?: number;
  fm_total: string;
  saidi_sin_fm_total: string;
};

type Props = {
  payload: Record<string, any> | null | undefined;
  selectedRegion?: string;
  selectedComuna?: string;
};

export default function SaidiChart({
  payload,
  selectedRegion,
  selectedComuna,
}: Props) {
  const [anioIdx, setAnioIdx] = useState(0);

  // Detectar nivel según qué claves trae el payload
  const nivel = useMemo(() => {
    if (!payload) return "nacional";
    if (payload.desglose_calidad_saidi_comunal) return "comuna";
    if (payload.desglose_calidad_saidi_regional) return "region";
    return "nacional";
  }, [payload]);

  const anosDisponibles: number[] = payload?.anos_disponibles ?? [];
  const anioSafe = Math.min(anioIdx, Math.max(anosDisponibles.length - 1, 0));
  const anio = String(anosDisponibles[anioSafe] ?? "");

  // ── Nacional ──
  const promedioNacional =
    payload?.desglose_nacional_calidad_saidi?.[anio]?.promedio_nacional_anual ??
    0;

  const dataNacional = useMemo(() => {
    if (
      nivel !== "nacional" ||
      !payload?.desglose_regional_calidad_saidi ||
      !anio
    )
      return [];
    return Object.entries(
      payload.desglose_regional_calidad_saidi as Record<
        string,
        Record<string, DesgloseAnual>
      >,
    )
      .map(([cod, años]) => ({
        region: NOMBRES_REGION[cod] ?? `R${cod}`,
        cod,
        valor: años[anio]?.promedio_regional_anual ?? null,
      }))
      .filter((d) => d.valor !== null)
      .sort((a, b) => (b.valor ?? 0) - (a.valor ?? 0));
  }, [payload, anio, nivel]);

  // ── Regional: evolución por año ──
  const dataRegional = useMemo(() => {
    if (nivel !== "region" || !payload?.desglose_calidad_saidi_regional)
      return [];
    const desglose = payload.desglose_calidad_saidi_regional as Record<
      string,
      DesgloseAnual
    >;
    return anosDisponibles
      .map((a) => ({
        anio: String(a),
        valor: desglose[String(a)]?.promedio_anual ?? null,
      }))
      .filter((d) => d.valor !== null);
  }, [payload, anosDisponibles, nivel]);

  // ── Comunal: evolución por año + promedio nacional para comparar ──
  const dataComunal = useMemo(() => {
    if (nivel !== "comuna" || !payload?.desglose_calidad_saidi_comunal)
      return [];
    const desglose = payload.desglose_calidad_saidi_comunal as Record<
      string,
      DesgloseAnual
    >;
    return anosDisponibles
      .map((a) => ({
        anio: String(a),
        valor: desglose[String(a)]?.promedio_anual ?? null,
      }))
      .filter((d) => d.valor !== null);
  }, [payload, anosDisponibles, nivel]);

  // Guard
  if (!anosDisponibles.length || !payload) {
    return (
      <div style={{ color: "#666", padding: 16 }}>Cargando datos SAIDI…</div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* ── Vista nacional ── */}
      {nivel === "nacional" && (
        <>
          {/* Slider */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Año:</span>
              <input
                type="range"
                min={0}
                max={anosDisponibles.length - 1}
                value={anioSafe}
                onChange={(e) => setAnioIdx(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontWeight: 700, fontSize: 15, minWidth: 40 }}>
                {anio}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
              Promedio nacional {anio}:{" "}
              <strong>{promedioNacional.toFixed(2)} hrs/año</strong>
            </div>
          </div>

          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
            SAIDI promedio por región — {anio}
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={dataNacional}
              layout="vertical"
              margin={{ left: 90, right: 20, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" unit=" hrs" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="region"
                tick={{ fontSize: 11 }}
                width={90}
              />
              <Tooltip
                formatter={(v: number) => [`${v.toFixed(2)} hrs/año`, "SAIDI"]}
              />
              <ReferenceLine
                x={promedioNacional}
                stroke="#e63946"
                strokeDasharray="4 4"
                label={{
                  value: "Prom. nacional",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#e63946",
                }}
              />
              <Bar dataKey="valor" radius={[0, 3, 3, 0]}>
                {dataNacional.map((d) => (
                  <Cell
                    key={d.cod}
                    fill={
                      (d.valor ?? 0) > promedioNacional ? "#e63946" : "#006FB3"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      {/* ── Vista regional ── */}
      {nivel === "region" && (
        <>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
            SAIDI —{" "}
            {NOMBRES_REGION[selectedRegion?.padStart(2, "0") ?? ""] ??
              `Región ${selectedRegion}`}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={dataRegional}
              margin={{ left: 10, right: 20, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anio" tick={{ fontSize: 12 }} />
              <YAxis unit=" hrs" tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: number) => [
                  `${v.toFixed(2)} hrs/año`,
                  "SAIDI regional",
                ]}
              />
              <Bar
                dataKey="valor"
                name="Promedio regional"
                fill="#006FB3"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <table
            style={{
              width: "100%",
              fontSize: 12,
              marginTop: 12,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#f0f4f8" }}>
                <th style={{ padding: "4px 8px", textAlign: "left" }}>Año</th>
                <th style={{ padding: "4px 8px", textAlign: "right" }}>
                  Promedio regional (hrs/año)
                </th>
              </tr>
            </thead>
            <tbody>
              {dataRegional.map((d) => (
                <tr key={d.anio} style={{ borderBottom: "1px solid #e0e0e0" }}>
                  <td style={{ padding: "4px 8px" }}>{d.anio}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right" }}>
                    {d.valor?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Vista comunal ── */}
      {nivel === "comuna" && (
        <>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
            SAIDI — Comuna seleccionada
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={dataComunal}
              margin={{ left: 10, right: 20, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anio" tick={{ fontSize: 12 }} />
              <YAxis unit=" hrs" tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: number) => [
                  `${v.toFixed(2)} hrs/año`,
                  "SAIDI comunal",
                ]}
              />
              <Bar
                dataKey="valor"
                name="Promedio comunal"
                fill="#006FB3"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <table
            style={{
              width: "100%",
              fontSize: 12,
              marginTop: 12,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#f0f4f8" }}>
                <th style={{ padding: "4px 8px", textAlign: "left" }}>Año</th>
                <th style={{ padding: "4px 8px", textAlign: "right" }}>
                  Promedio comunal (hrs/año)
                </th>
              </tr>
            </thead>
            <tbody>
              {dataComunal.map((d) => (
                <tr key={d.anio} style={{ borderBottom: "1px solid #e0e0e0" }}>
                  <td style={{ padding: "4px 8px" }}>{d.anio}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right" }}>
                    {d.valor?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
