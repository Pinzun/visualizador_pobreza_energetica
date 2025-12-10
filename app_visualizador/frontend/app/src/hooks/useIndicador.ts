// src/hooks/useIndicador.ts
import { useEffect, useState } from "react";
import { IndicadorPayload, fetchIndicador } from "../api/indicadores";

export default function useIndicador(
  indicator: string | null | undefined,
  cut?: string
) {
  const [data, setData] = useState<IndicadorPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await fetchIndicador(indicator, cut);
        if (!cancelled) setData(payload);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Error cargando indicador");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [indicator, cut]);

  return { data, loading, error };
}
