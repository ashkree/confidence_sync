export type AppEnv = "dev" | "demo" | "prod";
const appEnv = (import.meta.env.VITE_APP_ENV as AppEnv) || "prod";

export const APP_ENV = appEnv;
export const USE_MOCK_DATA = appEnv === "dev";
export const SHOW_DEV_TOOLS = appEnv !== "prod"; // dev or demo
