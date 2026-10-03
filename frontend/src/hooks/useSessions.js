import { useState, useCallback } from "react";

const STORAGE_KEY = "lakeura_sessions";

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function save(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function makeId() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function deriveTitle(text) {
  const c = text.trim().replace(/\s+/g, " ");
  return c.length > 36 ? c.slice(0, 33) + "…" : c;
}

export function useSessions() {
  const [sessions, setSessions] = useState(load);
  const [activeId, setActiveId] = useState(() => {
    const s = load();
    if (s.length) return s[0].id;
    const fresh = { id: makeId(), title: "New Session", messages: [] };
    save([fresh]);
    return fresh.id;
  });

  const persist = useCallback((next) => {
    setSessions(next);
    save(next);
  }, []);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;

  function newSession() {
    const s = { id: makeId(), title: "New Session", messages: [] };
    const next = [s, ...sessions];
    persist(next);
    setActiveId(s.id);
  }

  function switchSession(id) {
    setActiveId(id);
  }

  function deleteSession(id) {
    const next = sessions.filter((s) => s.id !== id);
    // if we deleted the active session, move to the next one (or create fresh)
    if (id === activeId) {
      if (next.length > 0) {
        setActiveId(next[0].id);
      } else {
        const fresh = { id: makeId(), title: "New Session", messages: [] };
        next.push(fresh);
        setActiveId(fresh.id);
      }
    }
    persist(next);
  }

  function appendMessage(role, text) {
    const msg = { role, text, ts: Date.now() };
    setSessions((prev) => {
      const next = prev.map((s) => {
        if (s.id !== activeId) return s;
        const updated = { ...s, messages: [...s.messages, msg] };
        // auto-title on first user message
        if (role === "user" && s.messages.length === 0) {
          updated.title = deriveTitle(text);
        }
        return updated;
      });
      save(next);
      return next;
    });
    return msg;
  }

  return { sessions, activeId, activeSession, newSession, switchSession, appendMessage, deleteSession };
}
