import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGlobalErrorHandling } from "./lib/logger";

initGlobalErrorHandling();

createRoot(document.getElementById("root")!).render(<App />);
