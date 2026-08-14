import { createContext, useContext, useState } from "react";
import { APP_ENV, type AppEnv } from "@/lib/env";

interface AppEnvContextValue {
  appEnv: AppEnv;
  setAppEnv: (env: AppEnv) => void;
}

const AppEnvContext = createContext<AppEnvContextValue | null>(null);

export function AppEnvProvider({ children }: { children: React.ReactNode }) {
  const [appEnv, setAppEnvState] = useState<AppEnv>(APP_ENV);

  // Hard lock in real prod builds
  const setAppEnv = (env: AppEnv) => {
    if (APP_ENV === "prod") return;
    setAppEnvState(env);
  };

  return (
    <AppEnvContext.Provider value={{ appEnv, setAppEnv }}>
      {children}
    </AppEnvContext.Provider>
  );
}

export function useAppEnv() {
  const ctx = useContext(AppEnvContext);
  if (!ctx) throw new Error("useAppEnv must be used within AppEnvProvider");
  return ctx;
}
