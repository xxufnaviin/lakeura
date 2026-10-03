const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const isDev = process.env.NODE_ENV === "development";

// ─── Kill Python servers spawned by the launcher ─────────────────────────────
// __dirname = frontend/electron/ so ../../logs/ = project root logs/
function stopServers() {
  const pidFiles = ["../../logs/mcp.pid", "../../logs/backend.pid"];
  for (const rel of pidFiles) {
    const pidFile = path.join(__dirname, rel);
    try {
      const pid = fs.readFileSync(pidFile, "utf8").trim();
      if (pid) {
        if (process.platform === "win32") {
          execSync(`taskkill /pid ${pid} /f /t`, { stdio: "ignore" });
        } else {
          process.kill(parseInt(pid), "SIGTERM");
        }
      }
      fs.unlinkSync(pidFile);
    } catch (_) {
      // process already gone or file missing — that's fine
    }
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 620,
    minHeight: 500,
    backgroundColor: "#171411",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#211C18",
      symbolColor: "#a89880",
      height: 36,
    },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  setTimeout(createWindow, 5000);
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  stopServers();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", stopServers);
