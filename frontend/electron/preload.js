const { contextBridge } = require("electron");

// Expose a minimal API surface to the renderer.
// All backend calls are plain fetch() — no IPC needed for HTTP.
// This preload exists as a safe extension point for future IPC needs.
contextBridge.exposeInMainWorld("lakeura", {
  version: process.env.npm_package_version ?? "1.0.0",
});
