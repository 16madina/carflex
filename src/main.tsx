import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { CountryProvider } from "./contexts/CountryContext";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <CountryProvider>
      <App />
    </CountryProvider>
  </HelmetProvider>
);
