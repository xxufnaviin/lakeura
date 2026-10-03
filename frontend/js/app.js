/* ─────────────────────────────────────────────────────────────────────────────
   Lakeura — Frontend Client
   Handles: session management (localStorage), chat history, POST to /chat,
            creative thinking indicator with rotating messages.
───────────────────────────────────────────────────────────────────────────── */

const BACKEND_URL = "http://127.0.0.1:8080/chat";
const STORAGE_KEY = "lakeura_sessions";

// Rotating "thinking" phrases that cycle while the backend responds
const THINKING_PHRASES = [
  "Querying the lake",
  "Scanning catalog",
  "Consulting the warehouse",
  "Running the agent",
  "Calling MCP tools",
  "Reading your tables",
  "Crunching Iceberg data",
  "Traversing partitions",
  "Inspecting schemas",
  "Executing query",
];

// ─── State ────────────────────────────────────────────────────────────────────

let sessions = [];          // [{ id, title, messages: [{role, text, ts}] }]
let activeSessionId = null;
let thinkingInterval = null;

// ─── DOM refs ────────────────────────────────────────────────────────────────

const messagesEl     = document.getElementById("messages");
const inputEl        = document.getElementById("input");
const sendBtn        = document.getElementById("send-btn");
const sessionList    = document.getElementById("session-list");
const sessionTitle   = document.getElementById("session-title");
const thinkingEl     = document.getElementById("thinking");
const thinkingLabel  = document.getElementById("thinking-label");
const newSessionBtn  = document.getElementById("new-session-btn");

// ─── Session helpers ─────────────────────────────────────────────────────────

function loadSessions() {
  try {
    sessions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    sessions = [];
  }
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function getSession(id) {
  return sessions.find(s => s.id === id);
}

function createSession() {
  const id = `s_${Date.now()}`;
  const session = { id, title: "New Session", messages: [] };
  sessions.unshift(session);
  saveSessions();
  return session;
}

/** Derive a short title from the first user message */
function deriveTitle(text) {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > 36 ? clean.slice(0, 33) + "…" : clean;
}

// ─── Sidebar rendering ────────────────────────────────────────────────────────

function renderSidebar() {
  sessionList.innerHTML = "";
  sessions.forEach(s => {
    const li = document.createElement("li");
    li.className = "session-item" + (s.id === activeSessionId ? " active" : "");
    li.textContent = s.title;
    li.title = s.title;
    li.addEventListener("click", () => switchSession(s.id));
    sessionList.appendChild(li);
  });
}

// ─── Switch & load a session ──────────────────────────────────────────────────

function switchSession(id) {
  activeSessionId = id;
  const session = getSession(id);
  sessionTitle.textContent = session.title;
  renderSidebar();
  renderMessages(session.messages);
}

// ─── Message rendering ────────────────────────────────────────────────────────

function renderMessages(messages) {
  messagesEl.innerHTML = "";

  if (messages.length === 0) {
    messagesEl.innerHTML = `
      <div class="welcome">
        <div class="welcome-icon">◈</div>
        <h2>Welcome to Lakeura</h2>
        <p>Ask me anything about your Iceberg data warehouse.<br/>
           I can query, onboard, and inspect your tables.</p>
      </div>`;
    return;
  }

  messages.forEach(m => appendMessageNode(m.role, m.text, m.ts, false));
  scrollToBottom();
}

function appendMessageNode(role, text, ts, animate = true) {
  // Remove welcome screen if present
  const welcome = messagesEl.querySelector(".welcome");
  if (welcome) welcome.remove();

  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;
  if (!animate) wrapper.style.animation = "none";

  const time = ts ? formatTime(ts) : formatTime(Date.now());

  wrapper.innerHTML = `
    <div class="bubble">${escapeHtml(text)}</div>
    <span class="msg-meta">${time}</span>`;

  messagesEl.appendChild(wrapper);
  scrollToBottom();
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── Thinking indicator ───────────────────────────────────────────────────────

function startThinking() {
  let idx = Math.floor(Math.random() * THINKING_PHRASES.length);
  thinkingLabel.textContent = THINKING_PHRASES[idx];
  thinkingEl.classList.remove("hidden");

  thinkingInterval = setInterval(() => {
    idx = (idx + 1) % THINKING_PHRASES.length;
    thinkingLabel.style.opacity = "0";
    setTimeout(() => {
      thinkingLabel.textContent = THINKING_PHRASES[idx];
      thinkingLabel.style.transition = "opacity 0.3s";
      thinkingLabel.style.opacity = "1";
    }, 150);
  }, 2000);

  scrollToBottom();
}

function stopThinking() {
  clearInterval(thinkingInterval);
  thinkingEl.classList.add("hidden");
}

// ─── Send message ─────────────────────────────────────────────────────────────

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  // Ensure there's an active session
  if (!activeSessionId) {
    const s = createSession();
    activeSessionId = s.id;
  }

  const session = getSession(activeSessionId);

  // Title the session from the first message
  if (session.messages.length === 0) {
    session.title = deriveTitle(text);
    sessionTitle.textContent = session.title;
  }

  // Record & render user message
  const userMsg = { role: "user", text, ts: Date.now() };
  session.messages.push(userMsg);
  saveSessions();
  appendMessageNode("user", text, userMsg.ts);

  // Clear input and lock UI
  inputEl.value = "";
  autoResize();
  setLoading(true);
  startThinking();

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const reply = data.response ?? "(no response)";

    const aiMsg = { role: "assistant", text: reply, ts: Date.now() };
    session.messages.push(aiMsg);
    saveSessions();

    stopThinking();
    appendMessageNode("assistant", reply, aiMsg.ts);

  } catch (err) {
    stopThinking();
    const errMsg = { role: "assistant", text: `⚠ ${err.message}`, ts: Date.now() };
    session.messages.push(errMsg);
    saveSessions();
    appendMessageNode("assistant", errMsg.text, errMsg.ts);
  } finally {
    setLoading(false);
    renderSidebar();
    inputEl.focus();
  }
}

function setLoading(on) {
  sendBtn.disabled = on;
  inputEl.disabled = on;
}

// ─── Auto-resize textarea ─────────────────────────────────────────────────────

function autoResize() {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + "px";
}

// ─── Event listeners ──────────────────────────────────────────────────────────

sendBtn.addEventListener("click", sendMessage);

inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

inputEl.addEventListener("input", autoResize);

newSessionBtn.addEventListener("click", () => {
  const s = createSession();
  switchSession(s.id);
  renderSidebar();
  inputEl.focus();
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

function boot() {
  loadSessions();

  if (sessions.length === 0) {
    // First run — create a default session
    const s = createSession();
    activeSessionId = s.id;
  } else {
    // Resume the most recent session
    activeSessionId = sessions[0].id;
  }

  const session = getSession(activeSessionId);
  sessionTitle.textContent = session.title;
  renderSidebar();
  renderMessages(session.messages);
  inputEl.focus();
}

boot();
