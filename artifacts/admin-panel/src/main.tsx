import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const originalFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  if (url.includes("/api/")) {
    const headers = new Headers(init?.headers);
    headers.set("x-admin-token", "aston-admin-2026");
    return originalFetch(input, { ...init, headers });
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById("root")!).render(<App />);
