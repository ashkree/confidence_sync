import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./auth.tsx";
import App from "./App.tsx";
import { AppEnvProvider } from "./contexts/app-env.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppEnvProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppEnvProvider>
  </StrictMode>,
);
