// src/context/LoadingContext.tsx
import { createContext, useContext, useMemo, useState } from "react";

type LoadingState = {
  loading: boolean;
  progress: number; // 0..1
  message?: string;
};
type LoadingCtx = LoadingState & {
  setLoading: (v: boolean) => void;
  setProgress: (p: number) => void;
  setMessage: (m?: string) => void;
};

const Ctx = createContext<LoadingCtx | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  // 👇 arrancamos en "cargando" para que el overlay se muestre junto al TopBar
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | undefined>(
    "Cargando información..."
  );

  const value = useMemo(
    () => ({ loading, progress, message, setLoading, setProgress, setMessage }),
    [loading, progress, message]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGlobalLoading() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useGlobalLoading must be used within <LoadingProvider>");
  return ctx;
}
