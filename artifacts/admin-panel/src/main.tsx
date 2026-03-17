import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "aston-admin-2026";
const originalFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  if (url.includes("/api/")) {
    const headers = new Headers(init?.headers);
    headers.set("x-admin-token", ADMIN_TOKEN);
    return originalFetch(input, { ...init, headers });
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById("root")!).render(<App />);
